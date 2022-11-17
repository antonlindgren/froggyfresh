const { got } = require('got-cjs')

async function getUserInfo(username, extra = []) {
	let params = ''
	if (extra.length > 0) {
		extra.forEach((v) => {
			params += '&' + v + '=1'
		})
	}

	let user = "username="+username;
	if(!isNaN(username)) user = "id="+username;

	return got(
		`https://esportal.com/api/user_profile/get?${user}${params}`
	).json()
}

async function getUserLatestMatches(id) {
  return got(
    `https://esportal.com/api/user_profile/get_latest_matches?id=${id}&page=1&v=2`
  ).json()
}

async function getGameInfo(matchId) {
  return got(`https://esportal.com/api/match/get?_=1&id=${matchId}`).json()
}

async function getMaps() {
  return got('https://esportal.com/api/maps').json()
}

module.exports = {
  getUserInfo,
  getUserLatestMatches,
  getGameInfo,
  getMaps
}
