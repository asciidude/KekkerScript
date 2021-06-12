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
    {"name": "statement", "symbols": ["set_var"], "postprocess": id},
    {"name": "statement", "symbols": ["print_statement"], "postprocess": id},
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
    {"name": "unary_expr", "symbols": ["str"], "postprocess": id},
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
    {"name": "set_var$string$1", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "set_var$string$2", "symbols": [{"literal":"-"}, {"literal":">"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "set_var", "symbols": ["set_var$string$1", "__", "str", "_", "set_var$string$2", "_", "expression"], "postprocess": 
        data => {
            return {
                type: "variable_assignment",
                name: data[2].join(''),
                value: data[6]
            }
        }
            },
    {"name": "str$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "str$ebnf$1", "symbols": ["str$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "str", "symbols": ["str$ebnf$1"], "postprocess": id},
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
