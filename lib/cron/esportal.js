const CronJob = require('cron').CronJob
const {
  getUserInfo,
  getUserLatestMatches,
  getGameInfo,
  getMaps
} = require('../services/esportal')
const { got } = require('got-cjs')
const sql = require('../adapter/db')


const cron = new CronJob(
  '*/5 * * * * *',
  esportalCron,
  null,
  true,
  'America/Los_Angeles'
)



async function loadLastId() {
	return sql.promise().query("select value from settings where name = 'ESPORTAL_MATCH_LAST_ID'");
}
async function setLastId(id) {
	return sql.promise().query("update settings set value = ? where name = 'ESPORTAL_MATCH_LAST_ID'", [id]);
}

// Matches: 4599112


async function esportalCron() {
  const [[lastIdFromDatabase]] = await loadLastId();
  let lastMatchId = parseInt(lastIdFromDatabase.value);

  
  const [players] = await sql
    .promise()
    .query('select nickname, esportal_id from esportal')

  if (players.length === 0) return

  let matches = []

  for await (const player of players) {
    const playerMatches = await getUserLatestMatches(player.esportal_id)

    playerMatches.forEach((m) => {
      if (m.id <= lastMatchId) {
        return
      }

      const exist = matches.find(({ matchId }) => matchId === m.id)
      if (!exist) {
        matches.push({
          matchId: m.id,
          players: [],
          map: '',
          map_image: '',
          map_id: m.map_id,
          score: ''
        })
      }

      matches.forEach((match, idx) => {
        if (match.matchId === m.id) {
          matches[idx].players.push({
            nickname: player.nickname,
            difference: m.elo_change,
            stats: ''
          })
        }
      })
    })
  }

  if (matches.length === 0) return

  const maps = await getMaps()

  for await (const match of matches) {
	if(match.matchId > lastMatchId) {
		lastMatchId = match.matchId;
		console.log("Set last ID in database to", lastMatchId);
		await setLastId(lastMatchId);
	}
	
    const matchData = await getGameInfo(match.matchId)
    match.score = matchData.team1_score + '-' + matchData.team2_score
    const map = maps.find(({ id: mId }) => mId === match.map_id)
    match.map = map.name
    match.map_image =
      'https://static2.esportal.com/' + map.image.replace('.png', '/full.png')

    matchData.players.forEach((player) => {
      match.players.forEach((p, idx) => {
        if (p.nickname.toLowerCase() === player.username.toLowerCase()) {
          match.players[idx].stats =
            player.kills +
            'K ' +
            player.deaths +
            'D ' +
            player.assists +
            'A (' +
            player.clutches +
            ' clutches, ' +
            player.opening_kills +
            ' entry frags (' +
            Math.round(
              (player.opening_kills /
                (player.opening_kills + player.opening_deaths)) *
                100
            ) +
            '%))'
        }
      })
    })
  }

  matches.forEach((match) => {
    const playerFields = []
    match.players.forEach((player) => {
      playerFields.push({
        name: player.nickname,
        value: (player.difference > 0 ? "+" : "") + player.difference + " ELO\n" +player.stats,
        inline: false
      })
    })
    const players = []
    match.players.forEach((player) => {
      players.push(player.nickname)
    })

    const postData = {
      username: 'FroggyFresh',
      embeds: [
        {
		  author: {
            name: 'FroggyFresh',
			url: 'https://esportal.com/sv/match/' + match.matchId,
          },
          url: 'https://esportal.com/sv/match/' + match.matchId,
          thumbnail: { url: match.map_image },
          title: 'Game finished!',
          description:
            players.join(', ') +
            ' has finished a match 😍.\nThe match ended with score ' +
            match.score +
            ' on map ' +
            match.map,
          fields: playerFields
        }
      ]
    }

    got
      .post(
        process.env.WEBHOOK_ESPORTAL,
        {
          json: {
            ...postData
          }
        }
      )
      .json()
  })
}

module.exports = {
  cron
}
