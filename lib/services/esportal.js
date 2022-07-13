const { got } = require('got-cjs')

async function getUserInfo(username) {
  return got(
    `https://esportal.com/api/user_profile/get?username=${username}&current_match=1`
  ).json()
}

module.exports = {
  getUserInfo
}
