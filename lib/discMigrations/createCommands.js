const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { SlashCommandBuilder } = require('@discordjs/builders')
require('dotenv').config()

const commands = [
  new SlashCommandBuilder()
    .setName('esportal')
    .setDescription(
      'esportal [nick] - Adds your nick to the #esportal announcements'
    )
    .addStringOption((option) =>
      option
        .setName('nickname')
        .setDescription('Your nickname on eSportal')
        .setRequired(true)
    )
]

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN_ID)

;(async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    )

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
