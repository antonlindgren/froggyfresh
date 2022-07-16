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
  '*/30 * * * * *',
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

async function loadLastAnnounceId() {
	return sql.promise().query("select value from settings where name = 'ESPORTAL_MATCH_LAST_ANNOUNCE_ID'");
}
async function setLastAnnounceId(id) {
	return sql.promise().query("update settings set value = ? where name = 'ESPORTAL_MATCH_LAST_ANNOUNCE_ID'", [id]);
}

// Matches: 4599112


async function esportalCron() {
  const [[lastIdFromDatabase]] = await loadLastId();
  const [[lastAnnounceIdFromDatabase]] = await loadLastAnnounceId();
  
  let lastMatchId = parseInt(lastIdFromDatabase.value);
  let lastAnnounceId = parseInt(lastAnnounceIdFromDatabase.value);
  
  const [players] = await sql
    .promise()
    .query('select nickname, esportal_id from esportal')

  if (players.length === 0) return

  let matches = []

  for await (const player of players) {
    const playerData = await getUserInfo(player.nickname, ['current_match']);
    const playerMatches = await getUserLatestMatches(player.esportal_id)

    if(playerData.current_match.id > lastAnnounceId) {
        const exist = matches.find(({ matchId }) => matchId === playerData.current_match.id)
        if(!exist) {
			matches.push({
				matchId: playerData.current_match.id,
				players: [],
				map: '',
				map_image: '',
				score: '',
				is_current: true
			})
        }
		matches.forEach((match, idx) => {
        if (match.matchId === playerData.current_match.id) {
          matches[idx].players.push({
			id: playerData.id,
            nickname: playerData.username,
            difference: '',
            stats: ''
          })
        }
      })
    }

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
          score: '',
		  is_current: false
        })
      }

      matches.forEach((match, idx) => {
        if (match.matchId === m.id) {
          matches[idx].players.push({
			id: playerData.id,
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
    console.log("MatchId", match.matchId, "is_current", match.is_current);

	if(!match.is_current && match.matchId > lastMatchId) {
		lastMatchId = match.matchId;
		console.log("Set last ID in database to", lastMatchId);
		await setLastId(lastMatchId);
	} else if(match.is_current && match.matchId > lastAnnounceId) {
		lastAnnounceId = match.matchId
		setLastAnnounceId(lastAnnounceId)
	}
	
    const matchData = await getGameInfo(match.matchId)
    match.score = matchData.team1_score + '-' + matchData.team2_score
    const map = maps.find(({ id: mId }) => mId === matchData.map_id)
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
	if(match.is_current === false) {
		match.players.forEach((player) => {
		  playerFields.push({
			name: player.nickname + (match.mvp_user_id === player.id ? " (MVP)" : ""),
			value: (player.difference > 0 ? "+" : "") + player.difference + " ELO\n" +player.stats,
			inline: false
		  })
		})
	}
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
          title: 'Game '+(match.is_current === true ? "started" : "finished!"),
          description:
            players.join(', ') +
            ' has '+(match.is_current === true ? "started" : "finished")+ ' a match 😍.\nThe match '+(match.is_current === true ? "score is" : "ended with score")+ ' '+
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
