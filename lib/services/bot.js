const { getUserInfo } = require('./esportal')
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
    const { id: esportalId } = await getUserInfo(nickname)
    await addUser(nickname, discord, esportalId)
    sendMessage(interaction, `Added to ${nickname} (ID#${esportalId})`)
  } catch (e) {
    sendMessage(interaction, "Failed to add - check your spelling")
  }
}

module.exports = {
  addEsportal
}
