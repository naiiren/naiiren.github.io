---
layout: post
title:  "所见即所得的数字电路教程"
subtitle: "使用 NetX 的图形化编程模型设计数字电路"
date:   2025-07-01 16:25:00 +0800
line_height: 2.0
---

数字电路系统是现代计算机与电子工业工程的基础。本教程将介绍如何使用一种新兴的硬件描述语言 NetX 进行数字电路设计。在设计和实现数字电路时，我们脑海里总是会先有一个大概的电路图，接着使用硬件描述语言来描绘它——而 NetX 代码的组织形式与电路图的结构非常相似，用 NetX 编码几乎就是所见即所得地描述电路图的过程。

本教程只作简单介绍。更多细节可以参考 NetX 的语言手册。

---

我们首先介绍 NetX 中最基础的两个运算符，`||` 与 `<>`，分别称作并行组合子与串行组合子。下面我们小试牛刀，用这两个运算符把二输入与门组合成一个四输入与门：

<center>
<img src="assets/and.svg" alt="and" style="zoom:200%;" />
</center>

我们从与门 `AND` 出发，首先用 `||` 并列连接两个与门，这就得到了一个四输入、两输出的电路元件。这个元件的内部有两个并列的与门，分别处理整个元件的前两个、后两个输入并分别输出。接下来，我们用 `<>` 将这个元件的输出串接到第三个与门上，也就得到了一个四输入、一输出的元件——也就是一个四输入与门。

使用包括 `AND` 的 NetX 内置的各种基础逻辑门，我们还可以组合出稍复杂一些的元件。比如，可以通过下面的代码实现一个半加器（Half Adder, HA）。它接受两个位宽为 1 的输入 `a` 和 `b`，输出他们的和 `sum` 以及可能的进位 `carry`：


```netx
component HA : [a, b] -> [sum, carry] {
	wire a, b, sum, carry of bit(1);
	  sum <> XOR <> (a || b);
	carry <> AND <> (a || b);
}
```

---

<img src="assets/add.svg" alt="add" style="zoom:200%;" />

半加器实现了宽度为 1 的二进制加法，接着我们来实现位宽更多的加法。对于给定的输入 `a` 和 `b`，最简单的思路是从低位向高位依次计算每一个二进制位的和。这里每一步都是宽度为 1 的加法。但是要注意，计算每一位的和时，除了要考虑当前的输入 `a[i]` 和 `b[i]`，还需要考虑前一位加法进位 `cin`。因此，我们需要一个可以处理三个输入的元件——全加器。对照图片左上角的电路图，我们可以写出下面的代码：


```netx
let FA = (TO || OR) <> (HA || TO) <> (TO || HA);
```

这里 `TO` 是一种特殊的内置元件，可以理解为匿名的“电线”，它会将接受的输入信号忠实地传递到输出端去。如果你更熟悉传统命令式语言给变量起名字的方式，我们也可以给每个元件的输入输出端口起个名字，写成下面的样子：

```netx
component FA : [a, b, cin] -> [sum, cout] {
    wire a, b, cin, sum, cout of bit(1);
    wire tmp_sum, c1, c2 of bit(1);
    (tmp_sum || c1) <> HA <> (b || cin);
        (sum || c2) <> HA <> (a || tmp_sum);
    cout <> OR <> (c1 || c2);
}
```

好了，接下来把全加器串联起来，让第 `i` 个全加器的进位输出 `cout` 连接到第 `i+1` 个全加器的进位输入 `cin`，就可以实现任意位宽的二进制加法了。下面是一个 4 位加法器的代码示例：

```netx
component ADDER : [a, b] -> [c] {
	wire a, b, c of bit(4);
	let FA = (TO || OR) <> (HA || TO) <> (TO || HA);
	let pattern(i) = 
		(#c[i] || TO) <> FA <> (a[i]# || b[i]# || TO);
	let adder(i) =
		if i < 0 then 1'b0
		else pattern(i) <> adder(i - 1);
	adder(3);
}
```

在这个代码中，我们使用了一个递归的方式来定义加法器。`pattern(i)` 定义了第 `i` 个全加器，把他的输入输出绑定到 `a[i]`、`b[i]` 和 `c[i]` 上，但是把进位输入和输出用 `TO` 留空。这里出现了一个新的运算符 `#`，它表示忽略某个元件的输入或者输出。比如 `c[0]` 原本是一根名叫 `c[0]` 的电线，它有一个输出和一个输出，但是我们用 `#c[0]` 来表示只关心它的输入端口，而忽略它的输出端口。如果不做这种忽略，那么 `pattern` 就还是一个三输入两输出的元件，只不过在端口处接了几根有名字的电线而已；但添加了装饰器 `#` 之后，他就是只有一个输入一个输出的元件了，从而我们就可以通过一个递归的宏 `adder(i)` 把它们前后串联起来。

当然，如果你不熟悉通过递归的话，也可以引入一个中间变量，写成下面的样子：

```netx
component ADDER : [a, b] -> [c] {
	wire a, b, c of bit(4);
	wire carry of bit(4);
	let cin(i) = if i == 0 then 1'b0 else carry[i - 1];
	for (i in [0..4]) {
		(c[i] || carry[i]) <> FA <> (
			a[i] || b[i] || cin(i)
       );	
	}
	adder(3);
}
```

---

下面我们考虑另外一种常见的组合电路：编码器。编码器有 $$2^n$$ 个输入，其中只有一个输入为 `1`，其余输入均为 `0`。假设第 $$i$$ 个输入为 `1`，则编码器的输出为 $$i$$ 的二进制表示（宽度为 $$n$$）。下面展示了一个 4-2 编码器的电路图：

<img src="assets/encoder.svg" alt="encoder" style="zoom:200%;" />

观察电路图发现，编码器其实是通过一系列或门计算最终的输出的：既然第 $$j$$ 个输出为 `1` 当且仅当 $$i$$ 的二进制表示的第 $$j$$ 位为 `1`，那么我们只需要用一个或门把所有二进制表示第 $$j$$ 位为 `1` 的输入端口连接起来就可以了。下面是一个 4-2 编码器的 NetX 代码实现：

```netx
component ENCODER(n) : [input] -> [output] {
	let power = 2 ** n;
	wire input of bit(in_n);
	wire output of bit(n);
	for (j in [0..n]) {
		output[j] <> OR <> [
			input[i] | i in [0..power], 
			           when (i >> j) & 1 == 1
		];
	}
}
```

这里出现了一种新的语法： 列表推导（List Comprehension）也即 `[... | ...]`。由于数字电路是高度并行的，实践中我们经常会遇到形如 `(x1 || x2 || ... || xn)` 这样非常长的并行组合。为了简化起见，NetX 引入了列表 `[x1, x2, ..., xn]` 表达相同的意思。虽然列表本身看起来和原来没什么差别，但是我们可以通过列表推导来表达复杂的逻辑。比如上面的代码中，列表推导

```netx
[input[i] | i in [0..W], when (i >> j) & 1 == 1]
```

表达的意思就是生成一个列表，列表中有许多元素 `input[i]`，其中 `i` 是 $$0$$ 到 $$2^n$$ 之间的数字，但是只有当 `i` 的二进制表示的第 $$j$$ 位为 `1` 时（即 `i >> j & 1 == 1`），才会把 `input[i]` 加入到列表中。比如当 `n == 2`，`j == 1` 时，我们就会得到列表 `[input[2], input[3]]`，它等价于 `(input[2] || input[3])`。通过类似的列表推导，我们可以把电路图中重复的、复杂的图形模式抽象出来，从而写出更简洁的代码。

---

到目前为止，我们已经大概了解了怎么使用 NetX 设计组合电路。接下来我们看看如何设计时序电路，也就是含有寄存器等存储元件，可以记录状态的电路。

NetX 首先内置了一个简单的寄存器 `REGISTER`，使用时大概像是这样：

```netx
out <> REGISTER(isPosEdge = true) <> [input, clk]
```

它含有一个参数 `isPosEdge`，规定该元件是在时钟的上升沿还是下降沿触发。`input` 是寄存器的输入端口，`clk` 是时钟信号。寄存器会在时钟的上升沿（或下降沿）把 `input` 的值存储到输出端口 `out` 上。

在实际应用中，我们常常又会用到包含复位信号（reset）的寄存器，就可以写出下面的代码

```netx
import std.selector.MUX;

component REG(isPosEdge, isHighRst, rst_value) : [clk, rst, input] -> [output] {
	wire clk of clock();
	auto input, output;
	
	output <> REGISTER(isPosEdge) <> (
		MUX(1) <> (
            if isHighRst 
            then [rst, input, rst_value]
            else [rst, rst_value, input]
        ) || clk
	);
}
```

这份代码里又引入了一些新的 NetX 特性。首先我们有一条 `import` 语句，从标准库里引入了多路选择器 `MUX`，它是数字电路里的 `if-then-else` 语句，可以根据条件选择某个输入信号作为输出。此外我们还发现 `input, output` 三个值不像之前一样用 `wire` 声明具体的位宽，而是使用了一个 `auto` 关键字让编译器自动推断他们的位宽。接下来的事情就很简单了，我们在常规的寄存器 `REGISTER` 前面加上一个多路选择器，如果 `rst` 信号指示需要复位，那么就把复位值 `rst_value` 更新到寄存器，否则还是把 `input` 的值存储到寄存器中。

在使用这个含有复位信号的寄存器时，我们就可以写成

```netx
my_output <> REG <> [my_clk, my_rst, my_input]
```

或者为了让代码更清晰，写成

```netx
{output : my_output} <> REG <> {
	clk : my_clk,
	rst : my_rst,
	input : my_input
};
```

显式地指定输入输出端口的名字。

---

现在我们就可以利用寄存器画出时序电路了。下面展示的是如何用 NetX 实现一篇论文（[ICCD'96](https://doi.org/10.1109/ICCD.1996.563604)）提出的开平方电路：

```netx
import std.utils.REG;
import std.selector.MUX;
import std.memory.SHIFT_REG;

component sqrt32(isPosEdge, isHighRst) : [clk, rst, D] -> [Q] {
	wire clk of clock();
	wire rst of bit(1);
	wire D of bit(32);
	wire Q of bit(16);

	let shift = SHIFT_REG(
		width = 16, rst_value = 16'b0,
		isPosEdge = isPosEdge, isHighRst = isHighRst
	) <> [clk#, rst#, TO];
  
	auto D_odd <> shift <> CONCAT <> [D[i * 2 + 1] | i in [16..0]];
	auto D_eve <> shift <> CONCAT <> [D[i * 2] | i in [16..0]];

	wire R, R_next, lhs, rhs of bit(18);
	lhs <> CONCAT <> [R[15:0], D_odd[15], D_eve[15]];
	rhs <> CONCAT <> [Q, R[17], 1'b1];
	Q <> shift <> [ 16'd0, NOT <> R_next[17]];
	R_next <> MUX(1) <> [R[17], 
		SUB <> [lhs, rhs],
		ADD <> [lhs, rhs]
	];
	R <> REG(isPosEdge, isHighRst, 18'd0) <> [
		clk, rst, R_next
	];
}
```

对照论文中呈现的电路图，可以发现图上的每一个元件、每一条线在代码中均有明确的对应。NetX 代码组织的方式和电路图非常相似，这也就是 NetX 语言“所见即所得”的设计哲学。

<img src="assets/sqrt.png" alt="sqrt" style="zoom:50%;" />
