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
  const { id: esportalId } = await getUserInfo(nickname)

  try {
    await addUser(nickname, discord, esportalId)
    sendMessage(interaction, `Added to frigigigi ${esportalId}`)
  } catch (e) {
    sendMessage(interaction, e.message)
  }
}

module.exports = {
  addEsportal
}
