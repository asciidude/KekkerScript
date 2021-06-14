#!/usr/bin/env node
const commander = require('commander');
const fs = require('fs');
const path = require('path');
let strictUse = false;
const version = 'rw1.2.1'

commander
    .version(version)
    .command('kekkerscript', 'Transpile and run a *.kek file').aliases(['kek', 'trans-kek', 'compile-kek'])
    .option('-f, --set-file [path]', 'Set run path, defaults to main.kek', `${__dirname}/main.kek`)
    .option('-s, --use-strict [true/false]', 'Use strict when transpiling', 'false')
    .option('-v, --version', 'show version', version, '')

    .action(args => {
		const filepath = path.resolve(args.setFile);
        if(!args.setFile == null)
            if(!filepath.endsWith('.kek'))
		    	throw new Error('Cannot run file that does not end with .kek')
		    if (!fs.existsSync(filepath))
		    	throw new Error('Cannot run file that does not exist.');
        if(!args.useStrict == null)
            if(args.useStrict !== 'true' || args.useStrict !== 'false')
                throw new Error('--use-strict must be true or false')    
            strictUse = Boolean(args.useStrict);

        const parse = require('./parser');
        const transpile = require('./transpiler');
        const ast = parse(fs.readFileSync(filepath, 'utf8'));

        const result = transpile(ast);
        fs.writeFileSync(`${filepath}.js`, result, 'utf-8');
        require(`${filepath}.js`);
    });

commander.parse(process.argv);

module.exports = { strictUse }