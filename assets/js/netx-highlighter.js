// NetX Syntax Highlighter for GitHub Pages
// Based on LaTeX lstlisting definition for NetX language
// CSS styles are loaded separately from netx-syntax.css

document.addEventListener('DOMContentLoaded', function() {
    // Find all code blocks marked as 'netx'
    const netxBlocks = document.querySelectorAll('code.language-netx, pre.language-netx code');
    
    netxBlocks.forEach(function(block) {
        // Skip if already processed
        if (block.classList.contains('netx-highlighted')) {
            return;
        }
        
        let code = block.textContent || block.innerText;
        
        // NetX syntax highlighting rules based on LaTeX definition
        // Apply in order of precedence to avoid conflicts
        
        // 1. Block comments /* ... */ (process first to avoid conflicts)
        code = code.replace(/\/\*([\s\S]*?)\*\//g, '___COMMENT_BLOCK_START___$1___COMMENT_BLOCK_END___');
        
        // 2. Line comments // (process second)
        code = code.replace(/\/\/(.*?)$/gm, '___COMMENT_LINE_START___$1___COMMENT_LINE_END___');
        
        // 3. Strings (process before keywords to avoid conflicts)
        code = code.replace(/"([^"]*)"/g, '___STRING_DOUBLE_START___$1___STRING_DOUBLE_END___');
        code = code.replace(/'([^']*)'/g, '___STRING_SINGLE_START___$1___STRING_SINGLE_END___');
        
        // 4. Binary literals (process before regular numbers)
        code = code.replace(/\b(\d+'b[01]+)\b/g, '___NUMBER_BINARY_START___$1___NUMBER_BINARY_END___');
        
        // 5. Regular numbers
        code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, '___NUMBER_START___$1___NUMBER_END___');
        
        // 6. Keywords Group 2 (component, interface, import, library, application)
        code = code.replace(/\b(component|interface|import|library|application)\b/g, '___KEYWORD2_START___$1___KEYWORD2_END___');
        
        // 7. Keywords Group 1 (of, in, let, for, if, then, else, when, auto, wire, bit, clock, bundle)
        code = code.replace(/\b(of|in|let|for|if|then|else|when|auto|wire|bit|clock|bundle)\b/g, '___KEYWORD1_START___$1___KEYWORD1_END___');
        
        // 8. Built-in components (NOT, OR, AND, XOR, ADD, REGISTER, TO)
        code = code.replace(/\b(NOT|OR|AND|XOR|ADD|REGISTER|TO)\b/g, '___BUILTIN_START___$1___BUILTIN_END___');
        
        // 9. NetX operators (before HTML escaping)
        code = code.replace(/(<>|\|\||->)/g, '___OPERATOR_START___$1___OPERATOR_END___');
        
        // 10. Punctuation (before HTML escaping)
        code = code.replace(/([\[\]\{\}\(\),;:])/g, '___PUNCT_START___$1___PUNCT_END___');
        
        // Now escape HTML entities
        code = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        
        // Convert placeholders to HTML spans
        code = code
            .replace(/___COMMENT_BLOCK_START___([\s\S]*?)___COMMENT_BLOCK_END___/g, '<span class="netx-comment">/*$1*/</span>')
            .replace(/___COMMENT_LINE_START___(.*?)___COMMENT_LINE_END___/g, '<span class="netx-comment">//$1</span>')
            .replace(/___STRING_DOUBLE_START___(.*?)___STRING_DOUBLE_END___/g, '<span class="netx-string">"$1"</span>')
            .replace(/___STRING_SINGLE_START___(.*?)___STRING_SINGLE_END___/g, '<span class="netx-string">\'$1\'</span>')
            .replace(/___NUMBER_BINARY_START___(.*?)___NUMBER_BINARY_END___/g, '<span class="netx-number">$1</span>')
            .replace(/___NUMBER_START___(.*?)___NUMBER_END___/g, '<span class="netx-number">$1</span>')
            .replace(/___KEYWORD2_START___(.*?)___KEYWORD2_END___/g, '<span class="netx-keyword2">$1</span>')
            .replace(/___KEYWORD1_START___(.*?)___KEYWORD1_END___/g, '<span class="netx-keyword1">$1</span>')
            .replace(/___BUILTIN_START___(.*?)___BUILTIN_END___/g, '<span class="netx-builtin">$1</span>')
            .replace(/___OPERATOR_START___(.*?)___OPERATOR_END___/g, '<span class="netx-operator">$1</span>')
            .replace(/___PUNCT_START___(.*?)___PUNCT_END___/g, '<span class="netx-operator">$1</span>');
        
        // Set the processed HTML
        block.innerHTML = code;
        block.classList.add('netx-highlighted');
    });
});
