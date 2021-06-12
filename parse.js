const nearley = require('nearley');
const grammar = require('./kekkerscript');
const path = require('path');
const fs = require('mz/fs');

const main = async () => {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    const f_name = process.argv[2];
    const out_file = path.basename(f_name, '.kek') + '.ast';
    const code = (await fs.readFile(f_name)).toString();

    try {
        parser.feed(code);
        await fs.writeFile(out_file, JSON.stringify(parser.results[0], null, 4));
        console.log(`****Output written to ${out_file}****`);
    } catch(e) {
        console.error(`****Error****\n${e.message}`)
    }
}

main();