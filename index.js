const fs = require('fs');
const parse = require('./parser');
const transpile = require('./transpiler');

const ast = parse(fs.readFileSync(__dirname + '/main.kek', 'utf8'));
const result = transpile(ast);

fs.writeFileSync(__dirname + '/main.js', result, 'utf-8');
require('./main.js');