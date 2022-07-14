const { got } = require('got-cjs')

async function getUserInfo(username) {
  return got(
    `https://esportal.com/api/user_profile/get?username=${username}&current_match=1`
  ).json()
}

async function getGameInfo(matchId) {
  const game = await got(`https://esportal.com/api/match/get?_=1&id=${matchId}`).json()
  const maps = await getMaps()

  return {
    ...game,
    currentMap: maps.find(map => map.id === game.map_id)
  }
}

async function getMaps() {
  return got('https://esportal.com/api/maps').json()
}


module.exports = {
  getUserInfo,
  getGameInfo,
  getMaps
}
