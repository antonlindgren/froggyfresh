const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
// So we can use process.env.[variable]
require('dotenv').config()
// MySQL database
var mysql = require('mysql');

var sql = mysql.createConnection({
	host: process.env.SQL_HOST,
	user: process.env.SQL_USER,
	password: process.env.SQL_PASS,
	database: process.env.SQL_DB
});

process.on('SIGINT', (exitCode) => {
	console.log("");
	console.log("onExit called with code", exitCode);

	console.log("Gracefully killing sql...");
	sql.end();

	console.log("Shutting down.");
});

sql.connect( (err) => {
	if(err) {
		console.log("[FroggyFresh] Failed to connect to SQL:", err.stack);
		return;
	}

	console.log("[FroggyFresh] Connected to SQL (#" + sql.threadId+")");
});

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
	console.log("interaction.isCommand=", interaction.isCommand(), "interaction.commandName=", interaction.commandName);
	console.log("interaction.user.username=", interaction.user.username);
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'esportal') {
		const discord = interaction.user.username;
		const nickname = interaction.options.getString('nickname');
		console.log("interaction.nickname=", nickname);

		/* esportal ( id int(4), nickname varchar(32), discord varchar(128), added datetime ) */

		/* TODO: Check if nickname already exists instead? */
		sql.query("delete from esportal where discord = ? or nickname = ?", [discord, nickname]);
		
		sql.query("insert into esportal (nickname, discord, added) values (?, ?, ?)", [nickname, discord, new Date()]);

		await interaction.reply({ content: 'You have been added to the eSportal announcements!!', ephemeral: true });
	}
});

client.on('messageCreate', async message => {
	console.log("MessageCreated!");
});

client.login(process.env.TOKEN_ID);
