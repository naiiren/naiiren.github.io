---
layout: post
title:  "所见即所得的数字电路教程"
subtitle: "使用 NetX 的图形化编程模型设计数字电路"
date:   2025-07-01 16:25:00 +0800
line_height: 2.0
---

![and](http://127.0.0.1:4000/assets/and.png)

```netx
component HA : [a, b] -> [s, c] {
	wire a, b, s, c of bit(1);
	s <> XOR <> (a || b);
	c <> AND <> (a || b);
}
```

```netx
component ADDER : [a, b] -> [c] {
	wire a, b, c of bit(4);
	/* ... */
	wire carry of bit(4);
	for (i in [0..4]) {
		carry[i] <> patt(i) <> (
			if i > 0 then carry[i - 1] else 1'b0
		);
	}
}
```

