KekkerScript Statements
-----------------------
:expression: Expressions are equalities, see in **equalities** secrtion of this page
:fn func(paremeters) ( body ): This creates a function
:func(): This calls a function
:<< comment >>: Comments will be generated through the AST and transpiled
:return: Return can return expressions or statements
:while something ( body ): While paremeters are true, do everything in body
:print\: value: Prints a value to the console
:set a -> b: Set/create a variable
:import "a" as "b" from "c.js": Due to KekkerScript being transpiled to JS, JS files or node modules are only allowed

KekkerScript Equalities
~~~~~~~~~~~~~~~~~~~~~~~
:=: === in JS
:!=: !== in JS