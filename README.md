# KekkerScript Example
```
<< main >>
set a -> 1
print: a
while a < 10 (
    set a -> a + 1
    print: a
)
```

# Compiling KekkerScript
First, run `nearleyc kekkerscript.grammar -o kekkerscript.js` if you don't already have `kekkerscript.js`<br>
Then, run `node parse.js file.kek`<br>
Finally, run `node generate.js file.ast` with the AST generated from `file.kek`

This will all be simplified and automatic later on in time.

# KekkerScript Documentation
For now, our documentation will be held on
GitHub. We will, later on in the future, migrate to
[ReadTheDocs](https://www.readthedocs.io)

KekkerScript is a transpiler that transpiles to JavaScript.

**File extension is .kek**<br>
`()`: brackets

(examples will be shown)<br>
`set variable -> 12.5`: assign a variable to a value, this is how you set and make new variables<br>
`print: hello`: print given parameters to console<br>
`while variable <= 12.5`: while a condition is true, loop over body. newlines required for body<br>
`<< mainfile >>`: comments are currently not very conventional, they will be transpiled but no spaces or symbols are allowed<br>
`true/false`: these are boolean expression, everyone knows what those are so i dont care to explain them
