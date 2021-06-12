// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "program", "symbols": ["statements"], "postprocess": id},
    {"name": "statements", "symbols": ["_", "statement", "_"], "postprocess": 
        data => [data[1]]
                },
    {"name": "statements$string$1", "symbols": [{"literal":"\r"}, {"literal":"\n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "statements", "symbols": ["_", "statement", "_", "statements$string$1", "statements"], "postprocess": 
        data => [data[1], ...data[4]]
                },
    {"name": "statement", "symbols": ["make_var"], "postprocess": id},
    {"name": "statement", "symbols": ["set_var"], "postprocess": id},
    {"name": "statement", "symbols": ["print_statement"], "postprocess": id},
    {"name": "statement", "symbols": ["comment"], "postprocess": id},
    {"name": "statement", "symbols": ["while_loop"], "postprocess": id},
    {"name": "comment$string$1", "symbols": [{"literal":"<"}, {"literal":"<"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comment$string$2", "symbols": [{"literal":">"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comment", "symbols": ["comment$string$1", "_", "expression", "_", "comment$string$2"], "postprocess": 
        data => {
            return {
                type: "comment",
                comment: data[2]
            }
        }
            },
    {"name": "while_loop$string$1", "symbols": [{"literal":"w"}, {"literal":"h"}, {"literal":"i"}, {"literal":"l"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "while_loop$string$2", "symbols": [{"literal":"\r"}, {"literal":"\n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "while_loop$string$3", "symbols": [{"literal":"\r"}, {"literal":"\n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "while_loop", "symbols": ["while_loop$string$1", "__", "bin_expr", "_", {"literal":"("}, "_", "while_loop$string$2", "statements", "_", "while_loop$string$3", "_", {"literal":")"}], "postprocess": 
        data => {
            return {
                type: "while_loop",
                condition: data[2],
                body: data[7]
            }
        }
                },
    {"name": "print_statement$string$1", "symbols": [{"literal":"p"}, {"literal":"r"}, {"literal":"i"}, {"literal":"n"}, {"literal":"t"}, {"literal":":"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "print_statement", "symbols": ["print_statement$string$1", "__", "expression"], "postprocess": 
        data => {
            return {
                type: "print_statement",
                expression: data[2]
            }
        }
                },
    {"name": "expression", "symbols": ["bin_expr"], "postprocess": id},
    {"name": "expression", "symbols": ["unary_expr"], "postprocess": id},
    {"name": "unary_expr", "symbols": ["num"], "postprocess": id},
    {"name": "unary_expr", "symbols": ["identifier"], "postprocess": id},
    {"name": "bin_expr", "symbols": ["unary_expr", "_", "operator", "_", "expression"], "postprocess": 
        data => {
            return {
                type: "binary_expression",
                operand_left: data[0],
                operator: data[2],
                operand_right: data[4]
            }
        }
                },
    {"name": "operator", "symbols": [{"literal":"+"}], "postprocess": id},
    {"name": "operator", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "operator", "symbols": [{"literal":"*"}], "postprocess": id},
    {"name": "operator", "symbols": [{"literal":"/"}], "postprocess": id},
    {"name": "operator", "symbols": [{"literal":">"}], "postprocess": id},
    {"name": "operator", "symbols": [{"literal":"<"}], "postprocess": id},
    {"name": "operator$string$1", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "operator", "symbols": ["operator$string$1"], "postprocess": id},
    {"name": "operator$string$2", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "operator", "symbols": ["operator$string$2"], "postprocess": id},
    {"name": "operator", "symbols": [{"literal":"="}], "postprocess": id},
    {"name": "make_var$string$1", "symbols": [{"literal":"m"}, {"literal":"a"}, {"literal":"k"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "make_var$string$2", "symbols": [{"literal":"-"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "make_var", "symbols": ["make_var$string$1", "__", "identifier", "_", "make_var$string$2", "_", "expression"], "postprocess": 
        data => {
            return {
                type: "make_variable",
                name: data[2],
                value: data[6]
            }
        }
            },
    {"name": "set_var$string$1", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "set_var$string$2", "symbols": [{"literal":"-"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "set_var", "symbols": ["set_var$string$1", "__", "identifier", "_", "set_var$string$2", "_", "expression"], "postprocess": 
        data => {
            return {
                type: "set_variable",
                name: data[2],
                value: data[6]
            }
        }
            },
    {"name": "identifier$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "identifier$ebnf$1", "symbols": ["identifier$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "identifier", "symbols": ["identifier$ebnf$1"], "postprocess": 
        data => data[0].join('')
            },
    {"name": "num", "symbols": ["digits", {"literal":"."}, "digits"], "postprocess": 
        data => Number(data[0] + "." + data[2])
                },
    {"name": "num", "symbols": ["digits"], "postprocess": 
        data => Number(data[0])
                },
    {"name": "digits$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "digits$ebnf$1", "symbols": ["digits$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "digits", "symbols": ["digits$ebnf$1"], "postprocess": 
        data => data[0].join('')
            },
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[ ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "__$ebnf$1", "symbols": [/[ ]/]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", /[ ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"]}
]
  , ParserStart: "program"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
