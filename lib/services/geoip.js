const { got } = require('got-cjs')

async function getGeoIPInfo(ip) {
  return got(
    `http://ip-api.com/json/${ip}`
  ).json()
}

module.exports = {
  getGeoIPInfo
}
