﻿# KekkerScript Example
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
First, run `node parser.js`, this will parse a file named `main.kek`<br>
Finally, run `node transpiler.js`, this will transpile `main.kek`

This will all be simplified and automatic later on in time.

# KekkerScript Documentation
v. rw1.0.0

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
`<< mainfile >>`: will not be transpiled or generated in ast<br>
`true/false`: these are booleans, true or false values basically<br>
`return: statement/expression`: return an expression or statement, to return nothing use `none`