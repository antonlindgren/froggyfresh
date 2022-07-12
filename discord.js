const { Client, Intents } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })
const { addEsportal } = require('./lib/services/bot')
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
  console.log('MessageCreated!')
})

client.login(process.env.TOKEN_ID)
