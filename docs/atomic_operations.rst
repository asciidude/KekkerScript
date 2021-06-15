KekkerScript Atoms
------------------
Atoms are atomic operations

0-9 ?('.' 0.9)  | Numerical values (0.0, for example, would still be a number)
"", ''          | String literals, escapable by \\ (for example, "hello\"world" = hello"world, 'hello\'world' = hello'world)
identifier      | Identifiers are used for variables and such
true/false      | Booleans
(expression)    | Used for functions and calling functions