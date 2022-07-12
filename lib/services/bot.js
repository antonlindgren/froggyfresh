const { addUser } = require('./user')

const sendMessage = (i, m) => {
  return i.reply({
    content: m,
    ephemeral: true
  })
}

async function addEsportal(interaction) {
  const discord = interaction.user.username
  const nickname = interaction.options.getString('nickname')
  try {
    await addUser(nickname, discord)
    sendMessage(interaction, 'nu är du med min fakking bram')
  } catch (e) {
    sendMessage(interaction, e.message)
  }
}

module.exports = {
  addEsportal
}
