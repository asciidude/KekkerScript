const fs = require('mz/fs');
const path = require('path');

const main = async() => {
    const f_name = process.argv[2];
    const out_file = path.basename(f_name, '.ast') + '.js';
    const ast_content = (await fs.readFile(f_name)).toString();
    const ast = JSON.parse(ast_content);
    await fs.writeFile(out_file, transpile_js(ast));
    console.log(`****Output****\nSuccessfully transpiled! Run file ${out_file}`);
}

const transpile_js = (statements) => {
    const transpiled = [];

    for (const statement of statements) {
        if(statement.type === 'make_variable') {
            transpiled.push(`let ${statement.name} = ${expression_gen(statement.value)};`);
        }

        if(statement.type === 'set_variable') {
            transpiled.push(`${statement.name} = ${expression_gen(statement.value)};`);
        }

        else if(statement.type === 'print_statement') {
            transpiled.push(`console.log(${expression_gen(statement.expression)});`);
        }

        else if(statement.type === 'while_loop') {
            transpiled.push(`while(${expression_gen(statement.condition)}) {\n${transpile_js(statement.body).split('\n').map(ln => '  ' + ln).join('\n')}\n}`);
        }
    }

    return transpiled.join('\r\n');
}

const expression_gen = (expression) => {
    const translated_operators = {
        "+":"+",
        "-":"-",
        "*":"*",
        "/":"/",
        ">":">",
        "<":"<",
        "<=":"<=",
        "=":"==="
    }

    if(typeof expression === 'object') {
        if(expression.type === 'binary_expression') {
            if(!Object.values(translated_operators).includes(expression.operator)) {
                throw TypeError(`ERR! - ${expression.operator} does not exist or is not translated`);
            }

            return `${expression_gen(expression.operand_left)} ${translated_operators[expression.operator]} ${expression_gen(expression.operand_right)}`;
        }
    } else {
        return expression;
    }
}

main();