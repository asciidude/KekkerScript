const parse = require('./parser');
const util = require('util');
const { stringify } = require('./library');

class Context {
	constructor() {
		this.header = [
			`/* Transpiled with KekkerScript | https://github.com/pxpcandy/kekkerscript */\n'use strict';\n`
		];
		this.variables = [];
	}
}

function transpile(tree, ctx = new Context()) {
	if (tree.parser === undefined) throw new Error('Can only transpile parser rules.');
	switch (tree.rule) {
		case 'main': {
			const result = tree.items.map(item => transpile(item, ctx)).join('\n\n');
			return ctx.header.join('\n') + '\n' + result;
		}
		case 'statement': case 'expression': {
			return transpile(tree.items[0], ctx);
		}
		case 'fn': {
			return `const ${tree.items[0].text} = (${tree.items[1].items.map(item => item.text).join(', ')}) => {${tree.items.slice(1).map(item => transpile(item, ctx).split('\n').map(line => '\t' + line).join('\n')).join('\n')}\n}`;
		}
		case 'set': {
			const id = tree.items[0].text;
            if (!ctx.variables.includes(id)) {
				ctx.variables.push(id);
			    return `let ${id} = ${transpile(tree.items[1], ctx)};`;
            } else {
			    return `${id} = ${transpile(tree.items[1], ctx)};`;
            }
		}
		case 'equality': {
			let result = [transpile(tree.items[0], ctx)];
			for (let i = 1; i < tree.items.length; i += 2) {
				result.push(tree.items[i].text === '=' ? '==' : tree.items[i].text, transpile(tree.items[i + 1], ctx));
			}
			return result.join(' ');
		}
		case 'arguments': {
			return tree.items.splice(1).join(' ');
		};
		case 'comparison': case 'additive': case 'multiplicative': {
			let result = [transpile(tree.items[0], ctx)];
			for (let i = 1; i < tree.items.length; i += 2) {
				result.push(tree.items[i].text, transpile(tree.items[i + 1], ctx));
			}
			return result.join(' ');
		}
		case 'prefix': {
			let result = [transpile(tree.items[tree.items.length - 1], ctx)];
			for (let i = tree.items.length - 2; i >= 0; i--) {
				result.unshift(tree.items[i].text);
			}
			return result.join('');
		}
		case 'postfix': {
			let result = [transpile(tree.items[0], ctx)];
			for (let i = 1; i < tree.items.length; i++) {
				if (tree.items[i].rule === 'call') {
					result.push(transpile(tree.items[i], ctx));
				} else {
					result.push(tree.items[i].text);
				}
			}
			return result.join('');
		}
		case 'call': {
			return `(${tree.items.map(item => transpile(item, ctx)).join(', ')})`;
		}
		case 'atom': {
			if (tree.items[0].rule === 'string') {
				if (tree.items[0].text.startsWith('"')) {
					return util.inspect(tree.items[0].text.slice(1, -1).replace(/\\(\\|")/, '$1'));
				} else {
					return util.inspect(tree.items[0].text.slice(1, -1).replace(/\\(\\|')/, '$1'));
				}
			}
			return tree.items[0].text;
		}
		case 'while': {
			return `while (${transpile(tree.items[0], ctx)}) {\n${tree.items.slice(1).map(item => transpile(item, ctx).split('\n').map(line => '\t' + line).join('\n')).join('\n')}\n}`;
		}
		case 'print': {
			return `console.log(${transpile(tree.items[0], ctx)});`;
		}
		case 'return': {
			return tree.items.length === 1 ? `return ${transpile(tree.items[0], ctx)};` : 'return;';
		}
		case 'comment': {
			return `/*\n\t${tree.items[0].text.slice(2, -2)}\n*/`;
		}
		case 'import': {
			const processString = text => text.slice(1, -1).replace(/\\(?:\\|")/g, text => text.slice(1));
			return `const ${processString(tree.items[tree.items.length === 3 ? 1 : 0].text)} = require('${processString(tree.items[tree.items.length === 3 ? 2 : 1].text)}').${processString(tree.items[0].text)};`;
		}
		default: throw new Error(`Unhandled rule "${tree.rule}"`);
	}
}

module.exports = transpile;