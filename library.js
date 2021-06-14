const util = require('util');

class LexerError extends Error {
	constructor(text, index) {
		super();
		text = text.replace(/\r?\n/g, text => {
			index -= text.length - 1;
			return '\n';
		});
		this.line = 1;
		this.column = 1;
		for (let i = 0; i < index; i++) {
			if (text[i] === '\n') {
				this.line++;
				this.column = 1;
			} else {
				this.column++;
			}
		}
	}
}

class ParserError extends Error {
	constructor(tokens, index) {
		super();
		let char = tokens[index]?.stop ?? 0;
		const text = tokens.source.replace(/\r?\n/g, text => {
			char -= text.length - 1;
			return '\n';
		});
		this.line = 1;
		this.column = 1;
		for (let i = 0; i < char; i++) {
			if (text[i] === '\n') {
				this.line++;
				this.column = 1;
			} else {
				this.column++;
			}
		}
	}
}

function Lexer(rules = {}) {
	const proxy = new Proxy(rules, {
		get: (_, rule) => {
			const handler = (text, index = 0, errors = []) => {
				function execute(content, index) {
					if (content instanceof RegExp) {
						const match = text.slice(index).match(content);
						if (match === null || match.index !== 0) {
							const error = new LexerError(text, index);
							errors.push(error);
							throw error;
						}
						return [index + match[0].length, [{
							text: match[0], items: [],
							start: index, stop: index + match[0].length
						}]];
					} else if (typeof content === 'string') {
						if (!text.startsWith(content, index)) {
							const error = new LexerError(text, index);
							errors.push(error);
							throw error;
						}
						return [index + content.length, [{
							text: content, items: [],
							start: index, stop: index + content.length
						}]];
					} else if (typeof content === 'function') {
						if (content.lexer !== undefined) return content(text, index, errors);
						else if (content.parser !== undefined) throw new Error('Cannot call a parser rule from a lexer rule.');
						else return content.apply({ text, errors, execute }, [index]);
					}
					throw new Error('Invalid lexer content.');
				}
				const $ = {
					and: (...rules) => function and(index) {
						const result = [];
						for (const rule of rules) {
							const [position, items] = execute(rule, index);
							index = position;
							result.push(...items);
						}
						return [index, result];
					},
					or: (...rules) => function or(index) {
						let matched = undefined;
						for (const rule of rules) {
							try {
								const match = execute(rule, index);
								if (matched === undefined || match[0] > matched[0]) matched = match;
							} catch(error) {
								if (!(error instanceof LexerError)) throw error;
							}
						}
						if (matched === undefined) {
							const error = new LexerError(text, index);
							errors.push(error);
							throw error;
						} else {
							return matched;
						}
					},
					between: (minimum, maximum, ...rules) => {
						rules = rules.length === 1 ? rules[0] : $.and(...rules);
						return function between(index) {
							const result = [];
							for (let i = 0; i < maximum; i++) {
								try {
									const [position, items] = execute(rules, index);
									index = position;
									result.push(...items);
								} catch(error) {
									if (!(error instanceof LexerError)) throw error;
									if (i < minimum) {
										const error = new LexerError(text, index);
										errors.push(error);
										throw error;
									} else {
										return [index, result];
									}
								}
							}
							return [index, result];
						}
					},
					hide: (...rules) => {
						rules = rules.length === 1 ? rules[0] : $.and(...rules);
						return function hide(index) {
							return [execute(rules, index)[0], []];
						}
					},
					not: (...rules) => {
						rules = rules.length === 1 ? rules[0] : $.and(...rules);
						return function not(index) {
							try {
								execute(rules, index);
							} catch(error) {
								if (!(error instanceof LexerError)) throw error;
								return [index, []];
							}
							const error = new LexerError(text, index);
							errors.push(error);
							throw error;
						}
					},
					expand: lexer => {
						return function expand(index) {
							try {
								const result = Lexer.tokens(lexer, text, index, true);
								return result;
							} catch(inner) {
								if (!(inner instanceof LexerError)) throw inner;
								const error = new LexerError(text, index);
								errors.push(error);
								throw error;
							}
						}
					},
					zero: (...rules) => $.between(0, Infinity, ...rules),
					one: (...rules) => $.between(1, Infinity, ...rules),
					optional: (...rules) => $.between(0, 1, ...rules),
					repeat: (times, ...rules) => $.between(times, times, ...rules)
				}
				if (rules[rule] === undefined) throw new Error(`Could not find a rule named "${rule}"`);
				if (rule.startsWith('_')) {
					return [execute(rules[rule]($), index)[0], []];
				} else {
					const [position, items] = execute(rules[rule]($), index);
					return [position, [{
						text: text.slice(index, position),
						lexer: proxy, rule, items,
						start: index,
						stop: position
					}]];
				}
			}
			handler.lexer = proxy;
			handler.rule = rule;
			return handler;
		},
		set: (_, rule, content) => {
			rules[rule] = content;
		}
	});
	return proxy;
}

Lexer.tokens = function(lexer = Lexer({}), text = '', index = 0, partial = false) {
	const tokens = [];
	const errors = [];
	const rules = Object.keys(lexer);
	tokens.source = text;
	while (index < text.length) {
		let matched = undefined;
		for (const rule of rules) {
			try {
				const match = lexer[rule](text, index, errors);
				if (matched === undefined || match[0] > matched[0]) matched = match;
			} catch(error) {
				if (!(error instanceof LexerError)) throw error;
			}
		}
		if (matched === undefined) {
			if (partial) break;
			errors.push(new LexerError(text, index));
			throw errors.sort((a, b) => b.index - a.index)[0];
		} else {
			tokens.push(...matched[1]);
			index = matched[0];
		}
	}
	return partial ? [index, tokens] : tokens;
}

function Parser(rules = {}) {
	const proxy = new Proxy(rules, {
		get: (_, rule) => {
			const handler = (tokens, index = 0, errors = []) => {
				function execute(content, index) {
					if (typeof content === 'function') {
						if (content.parser !== undefined) {
							return content(tokens, index, errors);
						} else if (content.lexer !== undefined) {
							if (tokens.length > index && tokens[index].lexer === content.lexer && tokens[index].rule === content.rule) {
								return [index + 1, [tokens[index]]];
							} else {
								const error = new ParserError(tokens, index);
								errors.push(error);
								throw error;
							}
						} else return content.apply({ tokens, errors, execute }, [index]);
					} else if (typeof content === 'string') {
						if (tokens.length > index && tokens[index].text === content) {
							return [index + 1, [tokens[index]]];
						} else {
							const error = new ParserError(tokens, index);
							errors.push(error);
							throw error;
						}
					} else if (content instanceof RegExp) {
						const match = tokens[index]?.text?.match?.(content) ?? null;
						if (match !== null && match.index === 0) {
							return [index + 1, [tokens[index]]];
						} else {
							const error = new ParserError(tokens, index);
							errors.push(error);
							throw error;
						}
					}
					throw new Error('Invalid parser content.');
				}
				const $ = {
					and: (...rules) => function and(index) {
						const result = [];
						for (const rule of rules) {
							const [position, items] = execute(rule, index);
							index = position;
							result.push(...items);
						}
						return [index, result];
					},
					or: (...rules) => function or(index) {
						let matched = undefined;
						for (const rule of rules) {
							try {
								const match = execute(rule, index);
								if (matched === undefined || match[0] > matched[0]) matched = match;
							} catch(error) {
								if (!(error instanceof ParserError)) throw error;
							}
						}
						if (matched === undefined) {
							const error = new ParserError(tokens, index);
							errors.push(error);
							throw error;
						} else {
							return matched;
						}
					},
					between: (minimum, maximum, ...rules) => {
						rules = rules.length === 1 ? rules[0] : $.and(...rules);
						return function between(index) {
							const result = [];
							for (let i = 0; i < maximum; i++) {
								try {
									const [position, items] = execute(rules, index);
									index = position;
									result.push(...items);
								} catch(error) {
									if (!(error instanceof ParserError)) throw error;
									if (i < minimum) {
										const error = new ParserError(tokens, index);
										errors.push(error);
										throw error;
									} else {
										return [index, result];
									}
								}
							}
							return [index, result];
						}
					},
					hide: (...rules) => {
						rules = rules.length === 1 ? rules[0] : $.and(...rules);
						return function hide(index) {
							return [execute(rules, index)[0], []];
						}
					},
					not: (...rules) => {
						rules = rules.length === 1 ? rules[0] : $.and(...rules);
						return function not(index) {
							try {
								execute(rules, index);
							} catch(error) {
								if (!(error instanceof ParserError)) throw error;
								return [index, []];
							}
							const error = new ParserError(tokens, index);
							errors.push(error);
							throw error;
						}
					},
					zero: (...rules) => $.between(0, Infinity, ...rules),
					one: (...rules) => $.between(1, Infinity, ...rules),
					optional: (...rules) => $.between(0, 1, ...rules),
					repeat: (times, ...rules) => $.between(times, times, ...rules)
				}
				if (rules[rule] === undefined) throw new Error(`Could not find a rule named "${rule}"`);
				if (rule.startsWith('_')) {
					return [execute(rules[rule]($), index)[0], []];
				} else {
					const [position, items] = execute(rules[rule]($), index);
					return [position, [{
						tokens: tokens.slice(index, position),
						parser: proxy, rule, items,
						start: index,
						stop: position
					}]];
				}
			}
			handler.parser = proxy;
			handler.rule = rule;
			return handler;
		},
		set: (_, rule, content) => {
			rules[rule] = content;
		}
	});
	return proxy;
}

Parser.ast = function(parser = Parser({}), tokens = [], main = 'main', index = 0, partial = false) {
	const errors = [];
	let result;
	try {
		result = parser[main](tokens, index, errors);
	} catch(error) {
		if (!(error instanceof ParserError)) throw error;
		throw errors.sort((a, b) => b.index - a.index)[0];
	}
	if (!partial && result[0] < tokens.length) throw new ParserError(tokens, result[0]);
	return partial ? result : result[1][0];
}

function stringify(token, indent = 3, collapse = false) {
	const result = [];
	result.push((token.rule ?? '') + `${'rule' in token ? ' ' : ''}(${'parser' in token ? 'Parser ' : 'lexer' in token ? 'Lexer ' : ''}${token.start}-${token.stop})${'text' in token ? `: ${util.inspect(token.text)}` : ''}`);
	token.items.filter(item => 'rule' in item).forEach(item => result.push(...stringify(item, indent, collapse).split('\n').map(line => (typeof indent === 'string' ? indent : ' '.repeat(indent)) + line)));
	return result.join('\n');
}

const fragments = Lexer({
	regexFirst: $ => $.or(/[^*\r\n\u2028\u2029\\/[]/, fragments.regexEscape, $.and('[', $.zero(fragments.regexClass), ']')),
	regexChar: $ => $.or(/[^\r\n\u2028\u2029\\/[]/, fragments.regexEscape, $.and('[', $.zero(fragments.regexClass), ']')),
	regexClass: $ => $.or(/[^\r\n\u2028\u2029\\\]]/, fragments.regexEscape, $.and('[', $.zero(fragments.regexClass), ']')),
	regexEscape: $ => $.and('\\', /[^\r\n\u2028\u2029]/),
	codeChar: $ => $.or(/[^`]/, $.and($.hide('`'), '`')),
	doubleStringChar: $ => $.or(/[^"\\\r\n]/, $.and('\\', fragments.escape), fragments.lineContinuation),
	singleStringChar: $ => $.or(/[^'\\\r\n]/, $.and('\\', fragments.escape), fragments.lineContinuation),
	escape: $ => $.or(fragments.charEscape, /0(?![0-9])/, fragments.hexEscape, fragments.unicodeEscape, fragments.extendedUnicodeEscape),
	charEscape: $ => $.or(fragments.singleEscape, fragments.nonEscape),
	hexEscape: $ => $.and('x', fragments.hexDigit, fragments.hexDigit),
	unicodeEscape: $ => $.or($.and('u', $.repeat(4, fragments.hexDigit)), $.and('u{', $.between(2, Infinity, fragments.hexDigit), '}')),
	extendedUnicodeEscape: $ => $.and('u{', $.one(fragments.hexDigit), '}'),
	singleEscape: $ => /['"\\bfnrtv]/,
	nonEscape: $ => /[^'"\\bfnrtv0-9xu\r\n]/,
	escapeChar: $ => $.or(fragments.singleEscape, /[0-9]/, /[xu]/),
	lineContinuation: $ => /\\[\r\n\u2028\u2029]/,
	hexDigit: $ => /[_0-9a-fA-F]/,
	identifierStart: $ => $.or(/[\p{L}]/u, /[$_]/, $.and('\\', fragments.unicodeEscape)),
	identifierPart: $ => $.or(fragments.identifierStart, /[\p{Mn}]/u, /[\p{Nd}]/u, /[\p{Pc}]/u, '\u200C', '\u200D')
});

const lexer = Lexer({
	identifier: $ => $.and(fragments.identifierStart, $.zero(fragments.identifierPart)),
	regex: $ => $.and('/', fragments.regexFirst, $.zero(fragments.regexChar), '/'),
	string: $ => $.or($.and('"', $.zero(fragments.doubleStringChar), '"'), $.and("'", $.zero(fragments.singleStringChar), "'")),
	code: $ => $.and('`', $.zero(fragments.codeChar), '`'),
	at: $ => '@',
	colon: $ => ':',
	semicolon: $ => ';',
	one: $ => '+',
	zero: $ => '*',
	optional: $ => '?',
	or: $ => '|',
	not: $ => '!',
	hide: $ => '~',
	insert: $ => '...',
	dot: $ => '.',
	lparen: $ => '(',
	rparen: $ => ')',
	_comment: $ => /\/\/.*|\/\*[^]*?\*\//,
	_whitespace: $ => /\s+/
});

const parser = Parser({
	main: $ => $.and($.zero(lexer.code), $.one($.or(parser.lexer, parser.parser))),
	lexer: $ => $.and($.hide('@', 'lexer'), $.optional(lexer.identifier), $.hide(';'), $.one(parser.rule)),
	parser: $ => $.and($.hide('@', 'parser'), $.optional(lexer.identifier), $.hide(';'), $.one(parser.rule)),
	rule: $ => $.and(lexer.identifier, $.hide(':'), parser.or, $.hide(';')),
	or: $ => $.and(parser.and, $.zero($.hide('|'), parser.and)),
	and: $ => $.and($.zero(parser.prefix), $.optional(lexer.code)),
	prefix: $ => $.and($.zero(/[!~]/), parser.postfix),
	postfix: $ => $.and(parser.literal, $.zero(/[?*+]/)),
	literal: $ => $.or(parser.reference, lexer.string, lexer.regex, parser.insert, $.and($.hide('('), parser.or, $.hide(')'))),
	insert: $ => $.and($.hide(lexer.insert), lexer.identifier),
	reference: $ => $.and(lexer.identifier, $.optional($.hide('.'), lexer.identifier))
});

function grammar(text) {
	const tokens = Lexer.tokens(lexer, text);
	const ast = Parser.ast(parser, tokens);
	const result = {};
	let lexers = [];
	const ctx = {};
	for (const item of ast.items) {
		if (item.rule === 'code') {
			eval(item.text.slice(1, -1).replace(/``/g, '`'));
			continue;
		}
		const name = item.items[0].rule === 'identifier' ? item.items[0].text : item.rule;
		if (name in result) throw new Error(`Duplicate section named "${name}"`);
		result[name] = item.rule === 'lexer' ? Lexer() : Parser();
		if (item.rule === 'lexer') lexers.push(name);
		for (const rule of item.items) {
			if (rule.rule === 'rule') {
				if (rule.items[0].text in result[name]) throw new Error(`Duplicate rule named "${rule.items[0].text}" in the same section.`);
				result[name][rule.items[0].text] = null;
			}
		}
	}
	for (const item of ast.items) {
		if (item.rule === 'code') continue;
		for (const rule of item.items) {
			if (rule.rule === 'rule') {
				execute(item.items[0].rule === 'identifier' ? item.items[0].text : item.rule, rule);
			}
		}
	}
	function execute(name, rule) {
		switch (rule.rule) {
			case 'rule': return result[name][rule.items[0].text] = eval(`$ => ${execute(name, rule.items[1])};`);
			case 'or': return `$.or(${rule.items.map(item => execute(name, item)).join(', ')})`;
			case 'and': {
				let result = `$.and(${rule.items.filter(item => item.rule !== 'code').map(item => execute(name, item)).join(', ')})`;
				if (rule.items[rule.items.length - 1].rule === 'code') {
					result = `(function code(index) {
						const error = () => {
							const error = 'tokens' in this ? new ParserError(this.tokens, index) : new LexerError(this.text, index);
							this.errors.push(error);
							throw error;
						};
						const [position, items] = this.execute(${result}, index);
						index = position;
						${rule.items[rule.items.length - 1].text.slice(1, -1).replace(/``/g, '\`')};
						return [index, []];
					})`;
				}
				return result;
			}
			case 'literal': return execute(name, rule.items[0]);
			case 'reference': {
				if (rule.items.length === 2) return `result.${rule.items[0].text}.${rule.items[1].text}`;
				else {
					const matches = Object.keys(result).filter(section => rule.items[0].text in result[section]);
					if (matches.length === 0) throw new Error(`Unknown rule "${rule.items[0].text}"`);
					else if (matches.length > 1 && matches.includes(name)) return `result.${name}.${rule.items[0].text}`;
					else if (matches.length > 1) throw new Error(`Cannot resolve ambiguous rule name without a section specifier.`);
					else return `result.${matches[0]}.${rule.items[0].text}`;
				}
			}
			case 'prefix': {
				let result = execute(name, rule.items[rule.items.length - 1]);
				rule.items.slice(0, -1).forEach(item => result = `$.${item.rule}(${result})`);
				return result;
			}
			case 'postfix': {
				let result = execute(name, rule.items[0]);
				rule.items.slice(1).forEach(item => result = `$.${item.rule}(${result})`);
				return result;
			}
			case 'insert': {
				const name = rule.items[0].text;
				if (!lexers.includes(name)) throw new Error(`There is no lexer named "${name}"`);
				return `$.expand(result.${name})`;
			}
			case 'regex': return rule.text + 'u';
			case 'string': return rule.text;
			default: throw new Error(`Unhandled rule "${rule.rule}"`);
		}
	}
	return result;
}

module.exports = { Lexer, Parser, LexerError, ParserError, stringify, fragments, lexer, parser, grammar };