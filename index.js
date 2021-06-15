#!/usr/bin/env node
const commander = require('commander');
const fs = require('fs');
const path = require('path');
const parse = require('./parser');
const transpile = require('./transpiler');
const version = 'rw1.2.1'

commander
    .version(version)
    .command('kekkerscript', 'Transpile and run a *.kek file').aliases(['kek', 'trans-kek', 'compile-kek'])
    .option('-f, --set-file [path]', 'Set run path, defaults to main.kek', `${__dirname}/main.kek`)
    .option('-v, --version', 'show version', version, '')

    .action(args => {
		const filepath = path.resolve(args.setFile);
        if(!args.setFile == null)
            if(!filepath.endsWith('.kek'))
		    	throw new Error('Cannot run file that does not end with .kek')
		    if (!fs.existsSync(filepath))
		    	throw new Error('Cannot run file that does not exist.');

        const ast = parse(fs.readFileSync(filepath, 'utf8'));
        const result = transpile(ast);
        
        fs.writeFileSync(`${filepath}.js`, result, 'utf-8');
        require(`${filepath}.js`);
    });

commander.parse(process.argv);

const run = (r_setFile) => {
    let filepath = path.resolve(r_setFile);
    if(!r_setFile == null)
        if(!filepath.endsWith('.kek'))
        throw new Error('Cannot run file that does not end with .kek')
    else
        filepath = path.join(__dirname, 'main.kek')
    if (!fs.existsSync(filepath))
    	throw new Error('Cannot run file that does not exist.');

    const ast = parse(fs.readFileSync(filepath, 'utf8'));
    const result = transpile(ast);

    fs.writeFileSync(`${filepath}.js`, result, 'utf-8');
    require(`${filepath}.js`);
}

module.exports = { run }