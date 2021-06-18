// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "num$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "num$ebnf$1", "symbols": ["num$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "num", "symbols": ["num$ebnf$1"]},
    {"name": "str$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "str$ebnf$1", "symbols": ["str$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "str", "symbols": ["str$ebnf$1"]}
]
  , ParserStart: "num"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
