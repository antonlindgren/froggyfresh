const sql = require('../adapter/db')
const { createSessionInDb } = require('./session')
const { getUserInfo, getGameInfo } = require('./esportal')
const maps = require('../data/maps.json')

var commands = [
  { name: 'help', channel: '', arguments: 0, usage: '', func: commandHelp },
  { name: 'test', channel: '', arguments: 0, usage: '', func: commandTest },
  {
    name: 'slap',
    channel: '',
    arguments: 1,
    usage: '<nick>',
    func: commandSlap
  },
  {
    name: 'esportallist',
    channel: '',
    arguments: 0,
    usage: '',
    func: commandEsportalList
  },
  {
    name: 'lookup',
    channel: '',
    arguments: 1,
    usage: '<nick>',
    func: commandLookup
  },
  {
    name: 'play',
    channel: '',
    arguments: 0,
    usage: '',
    func: createSession
  }
]

function parseChannelMessage(user, channel, message) {
  var content = message.content.toLowerCase()
  if (content.length === 0 || content[0] !== '!') return

  // Remove first character (the !)
  content = content.substring(1)

  var input = content.split(' ')
  var arguments = []
  if (input.length > 1) arguments = input.slice(1)

  commands.forEach((cmd) => {
    // Loop through commands and see if we have a match
    if (cmd.name.toLowerCase() === input[0]) {
      if (
        cmd.channel.length === 0 ||
        cmd.channel.toLowerCase() === channel.name.toLowerCase()
      ) {
        // Check arguments
        if (arguments.length < cmd.arguments) {
          message.reply('Usage: !' + cmd.name + ' ' + cmd.usage)
          return
        }
        // Execute command
        cmd.func(user, channel, arguments)
      }
    }
  })
}

function commandHelp(user, channel, arguments) {
  var out = ''
  commands.forEach((cmd) => {
    if (out.length > 0) out += ', '
    out += '**!' + cmd.name + '**'
  })
  channel.send(out)
}
function commandTest(user, channel, arguments) {
  channel.send('Test')
}

async function createSession({ username }, channel, arguments) {
  const [[{ ID }]] = await createSessionInDb('abba', username)

  channel.send(`
    >>> :video_game:
      ***${username}*** just created a lobby *(abba${ID})* to play!
      Write \`!join abba${ID}\` to join the session!
  `)
}

async function commandLookup(user, channel, arguments) {
  const player = await getUserInfo(arguments, ['current_match'])

  let ingame = ''
  if (player.current_match.id > 0) {
    const game = await getGameInfo(player.current_match.id)
	const map = maps.find(({ id: mId }) => mId === game.map_id)
    ingame = `${game.currentMap.name} - ${player.current_match.team1_score}-${player.current_match.team2_score}`
  }

  channel.send(
    `
    >>> **${player.username}**
    :thumbsup: ${player.thumbs_up} :thumbsdown: ${player.thumbs_down}
    **Elo:**: ${player.elo}
    **K/D:** ${(player.recent_kills / player.recent_deaths).toFixed(2)}
    **Games**: ${player.wins + player.losses} (WR: ${Math.round(
      (player.wins / (player.wins + player.losses)) * 100
    )}%)
   ${ingame !== '' ? ' **In game - ** ' + ingame : ''}
    `
  )
}

function commandSlap(user, channel, arguments) {
  channel.send('_bitchslaps ' + arguments[0] + '_')
}
function commandEsportalList(user, channel, arguments) {
  return sql.query(
    'select nickname, discord, created from esportal',
    function (err, results, fields) {
      var out = 'Found **' + results.length + '** users.\n'
      results.forEach((res) => {
        out += res.created + ': ' + res.nickname + '\n'
      })
      channel.send(out)
    }
  )
}

module.exports = { parseChannelMessage }
