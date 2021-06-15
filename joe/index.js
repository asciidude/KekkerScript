const Discord = require('discord.js');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const cmds = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for(const f of cmds) {
    const cmd = require(`./commands/${f}`);
    client.commands.set(cmd.name, cmd);
}

client.on('message', message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;

    const config = new _config();
    const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));

    if(!cmd) return;
    config

    try {
        cmd.execute(message, args, client);
    } catch(e) {
        message.channel.send(`:x: An unexpected error occured: \n \`\`\`bash \n ${e} \n \`\`\``);
        console.log(e);
    }
});

client.login('token');