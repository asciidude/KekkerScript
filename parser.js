const { Lexer, Parser, grammar } = require('./library');
const fs = require('fs');

const { lexer, parser } = grammar(fs.readFileSync(__dirname + '/grammar.txt', 'utf8'));

module.exports = text => Parser.ast(parser, Lexer.tokens(lexer, text));