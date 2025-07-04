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

        // Step 1: Extract comments and replace with placeholders
        let commentMap = [];
        // Block comments
        code = code.replace(/\/\*([\s\S]*?)\*\//g, function(match) {
            commentMap.push({ type: 'block', value: match });
            return `___COMMENT_BLOCK_PLACEHOLDER_${commentMap.length - 1}___`;
        });
        // Line comments
        code = code.replace(/\/\/(.*?)$/gm, function(match) {
            commentMap.push({ type: 'line', value: match });
            return `___COMMENT_LINE_PLACEHOLDER_${commentMap.length - 1}___`;
        });

        // Step 2: Highlight code (excluding comments)
        // Strings (process before keywords to avoid conflicts)
        code = code.replace(/"([^"]*)"/g, '___STRING_DOUBLE_START___$1___STRING_DOUBLE_END___');

        // Binary literals (process before regular numbers)
        code = code.replace(/\b(\d+'[dbhoDBHO][0123456789abcdefABCDEF]+)\b/g, '___NUMBER_BINARY_START___$1___NUMBER_BINARY_END___');

        // Regular numbers
        code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, '___NUMBER_START___$1___NUMBER_END___');

        // Keywords Group 2 (component, interface, import, library, application, enum)
        code = code.replace(/\b(component|interface|import|library|application|enum)\b/g, '___KEYWORD2_START___$1___KEYWORD2_END___');

        // Keywords Group 1 (of, in, let, for, if, then, else, when, auto, wire, bit, clock, bundle)
        code = code.replace(/\b(of|in|let|for|if|then|else|when|auto|wire|bit|clock|bundle)\b/g, '___KEYWORD1_START___$1___KEYWORD1_END___');

        // Built-in components (NOT, OR, AND, XOR, ADD, REGISTER, TO)
        code = code.replace(/\b(NOT|OR|AND|XOR|ADD|REGISTER|TO)\b/g, '___BUILTIN_START___$1___BUILTIN_END___');

        // NetX operators (before HTML escaping)
        code = code.replace(/(<>|\|\||->|#)/g, '___OPERATOR_START___$1___OPERATOR_END___');

        // Punctuation (before HTML escaping)
        code = code.replace(/([\[\]\{\}\(\),;:])/g, '___PUNCT_START___$1___PUNCT_END___');

        // Step 3: Escape HTML entities
        code = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        // Step 4: Convert placeholders to HTML spans (except comments)
        code = code
            .replace(/___STRING_DOUBLE_START___(.*?)___STRING_DOUBLE_END___/g, '<span class="netx-string">"$1"</span>')
            .replace(/___NUMBER_BINARY_START___(.*?)___NUMBER_BINARY_END___/g, '<span class="netx-number">$1</span>')
            .replace(/___NUMBER_START___(.*?)___NUMBER_END___/g, '<span class="netx-number">$1</span>')
            .replace(/___KEYWORD2_START___(.*?)___KEYWORD2_END___/g, '<span class="netx-keyword2">$1</span>')
            .replace(/___KEYWORD1_START___(.*?)___KEYWORD1_END___/g, '<span class="netx-keyword1">$1</span>')
            .replace(/___BUILTIN_START___(.*?)___BUILTIN_END___/g, '<span class="netx-builtin">$1</span>')
            .replace(/___OPERATOR_START___(.*?)___OPERATOR_END___/g, '<span class="netx-operator">$1</span>')
            .replace(/___PUNCT_START___(.*?)___PUNCT_END___/g, '<span class="netx-operator">$1</span>');

        // Step 5: Restore comments (with HTML escaping and span)
        code = code.replace(/___COMMENT_BLOCK_PLACEHOLDER_(\d+)___/g, function(_, idx) {
            // Escape HTML in comment value
            let comment = commentMap[idx].value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            return `<span class="netx-comment">${comment}</span>`;
        });
        code = code.replace(/___COMMENT_LINE_PLACEHOLDER_(\d+)___/g, function(_, idx) {
            let comment = commentMap[idx].value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            return `<span class="netx-comment">${comment}</span>`;
        });

        // Set the processed HTML
        block.innerHTML = code;
        block.classList.add('netx-highlighted');
    });
});
