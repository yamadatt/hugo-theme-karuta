---
title: "Syntax Highlighting Demo"
date: 2024-01-10T14:30:00Z
tags: ["code", "syntax", "highlighting"]
categories: ["demo"]
---

# Syntax Highlighting

The Karuta theme includes excellent syntax highlighting support using Hugo's built-in Chroma highlighter.

## JavaScript Example

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
    return `Welcome to Karuta theme, ${name}`;
}

const message = greet("Hugo");
document.getElementById("output").textContent = message;
```

## Python Example

```python
def fibonacci(n):
    """Generate fibonacci sequence up to n terms."""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Generate first 10 fibonacci numbers
fib_sequence = list(fibonacci(10))
print(f"Fibonacci sequence: {fib_sequence}")
```

## HTML Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Karuta Theme</title>
</head>
<body>
    <header>
        <h1>Welcome to Karuta</h1>
    </header>
    <main>
        <p>A beautiful Hugo theme with card-style layout.</p>
    </main>
</body>
</html>
```

## CSS Example

```css
:root {
    --primary-color: #2563eb;
    --text-color: #1f2937;
    --background-color: #ffffff;
}

.card {
    background: var(--background-color);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    transition: transform 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
}
```

The syntax highlighting adapts to both light and dark themes automatically!