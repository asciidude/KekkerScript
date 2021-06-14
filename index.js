#!/usr/bin/env node
const commander = require('commander');
const fs = require('fs');
const path = require('path');
let strictUse = false;

commander
    .version('rw1.0.2').alias('v') // this is actually kinda hot ngl XD
    .command('kekkerscript', 'Transpile and run a *.kek file').alias('kek')
    .option('-f, --set-file [path]', 'Set run path, defaults to main.kek', `${__dirname}/main.kek`)
    .option('-s, --use-strict [true/false]', 'Use strict when transpiling', 'false')

    .action(args => {
		const filepath = path.resolve(args.setFile);
        if(!filepath.endsWith('.kek'))
			throw new Error('Cannot run file that does not end with .kek')
		if (!fs.existsSync(filepath))
			throw new Error('Cannot run file that does not exist.');
        if(strictUse !== 'true' || strictUse !== 'false')
            throw new Error('--strict-use must be true or false')

        const parse = require('./parser');
        const transpile = require('./transpiler');
        const ast = parse(fs.readFileSync(filepath, 'utf8'));
        strictUse = Boolean(args.useStrict);

        const result = transpile(ast);
        fs.writeFileSync(`${filepath}.js`, result, 'utf-8');
        require(`${filepath}.js`);
    });

commander.parse(process.argv);

module.exports = { strictUse }