module.exports = {
    name: "ping",
    description: "Ping!",
    aliases: "pong",
    usage: "ping",
    async execute(message, args, client) {
        message.channel.send("Pong! You sent: " + args.join(" "));
    }
}