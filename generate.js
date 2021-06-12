const fs = require('mz/fs');
const path = require('path');

const main = async() => {
    const f_name = process.argv[2];
    const out_file = path.basename(f_name, '.ast') + '.js';
    const ast_content = (await fs.readFile(f_name)).toString();
    const ast = JSON.parse(ast_content);
    await fs.writeFile(out_file, transpile_js(ast, []));
    console.log(`****Output****\nSuccessfully transpiled! Run file ${out_file}`);
}

let declared_vars = [];
const transpile_js = (statements) => {
    const transpiled = [];

    for (const statement of statements) {
        if(statement.type === 'variable_assignment') {
            if(declared_vars.indexOf(statement.name) === -1) {
                transpiled.push(`let ${statement.name} = ${expression_gen(statement.value)};`);
                declared_vars.push(statement.name);
            } else {
                transpiled.push(`${statement.name} = ${expression_gen(statement.value)};`);
            }
        }

        if(statement.type === 'print_statement') {
            transpiled.push(`console.log(${expression_gen(statement.expression)});`);
        }

        if(statement.type === 'while_loop') {
            transpiled.push(`while(${expression_gen(statement.condition)}) {\n${transpile_js(statement.body).split('\n').map(ln => '  ' + ln).join('\n')}\n}`);
        }

        if(statement.type == 'comment') {
            transpiled.push(`/* ${statement.body} */`)
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
            if(!lookup(expression.operator)) {
                throw TypeError(`ERR!: ${expression.operator} does not exist or is not translated`);
            }

            return `${expression_gen(expression.operand_left, declared_vars)} ${translated_operators[expression.operator]} ${expression_gen(expression.operand_right, declared_vars)}`;
        }
    } else {
        return expression;
    }
}

const lookup = async(name) => {
    for(var i = 0, len = arr.length; i < len; i++) {
        if(arr[i].key === name )
            return true;
    }

    return false;
}

main();