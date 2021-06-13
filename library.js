const util = require('util');

class LexerError extends Error {
	constructor(index) {
		super();
		this.index = index;
	}
}

class ParserError extends Error {
	constructor(index) {
		super();
		this.index = index;
	}
}

function Lexer(rules) {
	const proxy = new Proxy(rules, {
		get: (_, rule) => {
			const handler = (text, index = 0, errors = []) => {
				function execute(content, index) {
					if (content instanceof RegExp) {
						const match = text.slice(index).match(content);
						if (match === null || match.index !== 0) {
							const error = new LexerError(index);
							errors.push(error);
							throw error;
						}
						return [index + match[0].length, [{
							text: match[0], items: [],
							start: index, stop: index + match[0].length
						}]];
					} else if (typeof content === 'string') {
						if (!text.startsWith(content, index)) {
							const error = new LexerError(index);
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
						else return content(index);
					} else {
						throw new Error('Invalid lexer content.');
					}
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
						for (const rule of rules) {
							try {
								return execute(rule, index);
							} catch(error) {
								if (!(error instanceof LexerError)) throw error;
							}
						}
						const error = new LexerError(index);
						errors.push(error);
						throw error;
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
										const error = new LexerError(index);
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
							const error = new LexerError(index);
							errors.push(error);
							throw error;
						}
					},
					zero: (...rules) => $.between(0, Infinity, ...rules),
					one: (...rules) => $.between(1, Infinity, ...rules),
					optional: (...rules) => $.between(0, 1, ...rules)
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
		}
	});
	return proxy;
}

Lexer.tokens = function(lexer = Lexer({}), text = '') {
	const tokens = [];
	const errors = [];
	let index = 0;
	const rules = Object.keys(lexer);
	while (index < text.length) {
		let matched = false;
		for (const rule of rules) {
			try {
				const [position, items] = lexer[rule](text, index, errors);
				tokens.push(...items);
				index = position;
				matched = true;
				break;
			} catch(error) {
				if (!(error instanceof LexerError)) throw error;
			}
		}
		if (!matched) {
			errors.push(new LexerError(index));
			throw errors.sort((a, b) => b.index - a.index)[0];
		}
	}
	return tokens;
}

function stringify(token) {
	const result = [];
	result.push((token.rule ?? '') + `${'rule' in token ? ' ' : ''}(${'parser' in token ? 'Parser ' : 'lexer' in token ? 'Lexer ' : ''}${token.start}-${token.stop})${'text' in token ? `: ${util.inspect(token.text)}` : ''}`);
	token.items.forEach(item => result.push(...stringify(item).split('\n').map(line => '   ' + line)));
	return result.join('\n');
}

function Parser(rules) {
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
								const error = new ParserError(index);
								errors.push(error);
								throw error;
							}
						} else return content(index);
					}
					throw new Error('Invalid parser rule content.');
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
						for (const rule of rules) {
							try {
								return execute(rule, index);
							} catch(error) {
								if (!(error instanceof ParserError)) throw error;
							}
						}
						const error = new ParserError(index);
						errors.push(error);
						throw error;
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
										const error = new ParserError(index);
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
							const error = new ParserError(index);
							errors.push(error);
							throw error;
						}
					},
					zero: (...rules) => $.between(0, Infinity, ...rules),
					one: (...rules) => $.between(1, Infinity, ...rules),
					optional: (...rules) => $.between(0, 1, ...rules)
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
		}
	});
	return proxy;
}

Parser.ast = function(parser = Parser({}), tokens = [], main = 'main') {
	const errors = [];
	let result;
	try {
		result = parser[main](tokens);
	} catch(error) {
		if (!(error instanceof ParserError)) throw error;
		throw errors.sort((a, b) => b.index - a.index)[0];
	}
	if (result[0] < tokens.length) throw new ParserError(result[0]);
	return result[1][0];
}

module.exports = { Lexer, Parser, LexerError, ParserError, stringify };