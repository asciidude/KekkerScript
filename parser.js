const { Lexer, Parser, stringify } = require('./library');

const lexer = Lexer({
	set: $ => $.and('set', $.hide(/(?![a-z])|$/)),
	print: $ => $.and('print', $.hide(/(?![a-z])|$/)),
	while: $ => $.and('while', $.hide(/(?![a-z])|$/)),
	return: $ => $.and('return', $.hide(/(?![a-z])|$/)),
	import: $ => $.and('import', $.hide(/(?![a-z])|$/)),
	as: $ => $.and('as', $.hide(/(?![a-z])|$/)),
	from: $ => $.and('from', $.hide(/(?![a-z])|$/)),
	boolean: $ => $.or('true', 'false'),
	comment: $ => /<<[^]*?>>/,
	arrow: $ => '->',
	lteq: $ => '<=',
	gteq: $ => '>=',
	neq: $ => '!=',
	eq: $ => '=',
	add: $ => '+',
	subtract: $ => '-',
	multiply: $ => '*',
	divide: $ => '/',
	modulo: $ => '%',
	lt: $ => '<',
	gt: $ => '>',
	colon: $ => ':',
	lparen: $ => '(',
	rparen: $ => ')',
	identifier: $ => /[a-z]+/,
	number: $ => $.and(/[0-9]+/, $.optional('.', /[0-9]+/)),
	string: $ => /"(?:[^"\\]|\\["\\])*"/,
	_whitespace: $ => /\s+/
});

const parser = Parser({
	main: $ => $.zero(parser.statement),
	statement: $ => $.or(parser.import, parser.set, parser.print, parser.while, parser.return, parser.comment),
	comment: $ => lexer.comment,
	import: $ => $.and($.hide(lexer.import), lexer.string, $.optional($.hide(lexer.as), lexer.string), $.hide(lexer.from), lexer.string),
	while: $ => $.and($.hide(lexer.while), parser.expression, $.hide(lexer.lparen), $.zero(parser.statement), $.hide(lexer.rparen)),
	print: $ => $.and($.hide(lexer.print, lexer.colon), parser.expression),
	set: $ => $.and($.hide(lexer.set), lexer.identifier, $.hide(lexer.arrow), parser.expression),
	return: $ => $.and($.hide(lexer.return, lexer.colon), $.optional($.or(parser.expression, parser.statement))),
	expression: $ => parser.equality,
	equality: $ => $.and(parser.comparison, $.zero($.or(lexer.neq, lexer.eq), parser.comparison)),
	comparison: $ => $.and(parser.additive, $.zero($.or(lexer.lteq, lexer.gteq, lexer.lt, lexer.gt), parser.additive)),
	additive: $ => $.and(parser.multiplicative, $.zero($.or(lexer.add, lexer.subtract), parser.multiplicative)),
	multiplicative: $ => $.and(parser.prefix, $.zero($.or(lexer.multiply, lexer.divide, lexer.modulo), parser.prefix)),
	prefix: $ => $.and($.zero($.or(lexer.add, lexer.subtract)), parser.atom),
	atom: $ => $.or(lexer.number, lexer.identifier, lexer.boolean, $.and($.hide(lexer.lparen), parser.expression, $.hide(lexer.rparen)))
});

module.exports = text => Parser.ast(parser, Lexer.tokens(lexer, text));