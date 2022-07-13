const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })
const { addEsportal } = require('./lib/services/bot')
const { parseChannelMessage } = require('./lib/services/channel');

require('dotenv').config()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return
  }

  if (interaction.commandName === 'esportal') {
    addEsportal(interaction)
  }
})

client.on('messageCreate', async (message) => {
  var user = message.author;
  var channel = client.channels.cache.get(message.channelId);

  console.log("User '"+user.username+"' wrote '"+message.content+"' in '#"+channel.name+"'");
  parseChannelMessage(user, channel, message);
})

client.login(process.env.TOKEN_ID)
