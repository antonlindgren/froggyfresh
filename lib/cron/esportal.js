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

// Matches: 4599112
const lastMatchId = 4592353

async function esportalCron() {
  const [players] = await sql
    .promise()
    .query('select nickname, esportal_id from esportal')

  console.log(players)

  if (players.length === 0) return

  let matches = []

  for await (const player of players) {
    const playerMatches = await getUserLatestMatches(player.esportal_id)

    playerMatches.forEach((m) => {
      if (m.id < lastMatchId) {
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
            ')'
        }
      })
    })
  }

  matches.forEach((match) => {
    const playerFields = []
    match.players.forEach((player) => {
      playerFields.push({
        name: player.nickname,
        value: player.stats,
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
          url: 'https://esportal.com/sv/match/' + match.matchId,
          thumbnail: { url: match.map_image },
          title: 'Game finished!',
          description:
            players.join(', ') +
            'has finished a match. The match ended with score ' +
            match.score +
            ' on map ' +
            match.map,
          fields: playerFields
        }
      ]
    }

    got
      .post(
        'https://discord.com/api/webhooks/997498804607664270/L1-Sy5HBQwYCBj9RJ17MmJUi6HuaRlkwslnTC2C7DWGhGe76BzYILOXN4M7mGpbUjEPu',
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

// HTTPError: Response code 400 (Bad Request)
//     at Request.<anonymous> (/Users/jimmyjardland/froggyfresh/node_modules/got-cjs/dist/source/as-promise/index.js:93:42)
//     at Object.onceWrapper (node:events:514:26)
//     at Request.emit (node:events:406:35)
//     at Request._onResponseBase (/Users/jimmyjardland/froggyfresh/node_modules/got-cjs/dist/source/core/index.js:757:22)
//     at processTicksAndRejections (node:internal/process/task_queues:96:5)
//     at async Request._onResponse (/Users/jimmyjardland/froggyfresh/node_modules/got-cjs/dist/source/core/index.js:796:13) {
//   input: undefined,
//   code: 'ERR_NON_2XX_3XX_RESPONSE',
//   timings: {
//     start: 1657893005988,
//     socket: 1657893005988,
//     lookup: 1657893005992,
//     connect: 1657893006003,
//     secureConnect: 1657893006016,
//     upload: 1657893006017,
//     response: 1657893006170,
//     end: 1657893006171,
//     error: undefined,
//     abort: undefined,
//     phases: {
//       wait: 0,
//       dns: 4,
//       tcp: 11,
//       tls: 13,
//       request: 1,
//       firstByte: 153,
//       download: 1,
//       total: 183
//     }
//   },
//   options: Options {
//     _unixOptions: undefined,
//     _internals: {
//       request: undefined,
//       agent: { http: undefined, https: undefined, http2: undefined },
//       h2session: undefined,
//       decompress: true,
//       timeout: {
//         connect: undefined,
//         lookup: undefined,
//         read: undefined,
//         request: undefined,
//         response: undefined,
//         secureConnect: undefined,
//         send: undefined,
//         socket: undefined
//       },
//       prefixUrl: '',
//       body: '{"username":"FroggyFresh","embeds":[{"author":"FroggyFresh","url":"https://esportal.com/sv/match/4592353","thumbnail":"https://static2.esportal.com/HBWK7E2LNwntnQ/full.png","title":"eSportal Match Update","description":"yard, steveofdeathhas finished a match 😍!\\nThe match ended with score 16-12 on map Inferno","fields":[{"name":"yard","value":"-23 ELO\\n21K 21D 3A (0 clutches, 8 entry frags (44)"},{"name":"steveofdeath","value":"-23 ELO\\n30K 17D 2A (0 clutches, 2 entry frags (67)"}]}]}',
//       form: undefined,
//       json: undefined,
//       cookieJar: undefined,
//       ignoreInvalidCookies: false,
//       searchParams: undefined,
//       dnsLookup: undefined,
//       dnsCache: undefined,
//       context: {},
//       hooks: {
//         init: [],
//         beforeRequest: [],
//         beforeError: [],
//         beforeRedirect: [],
//         beforeRetry: [],
//         afterResponse: []
//       },
//       followRedirect: true,
//       maxRedirects: 10,
//       cache: undefined,
//       throwHttpErrors: true,
//       username: '',
//       password: '',
//       http2: false,
//       allowGetBody: false,
//       headers: {
//         'user-agent': 'got (https://github.com/sindresorhus/got)',
//         'content-type': 'application/json',
//         accept: 'application/json',
//         'content-length': '492',
//         'accept-encoding': 'gzip, deflate, br'
//       },
//       methodRewriting: false,
//       dnsLookupIpVersion: undefined,
//       parseJson: [Function: parse],
//       stringifyJson: [Function: stringify],
//       retry: {
//         limit: 2,
//         methods: [ 'GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE' ],
//         statusCodes: [
//           408, 413, 429, 500,
//           502, 503, 504, 521,
//           522, 524
//         ],
//         errorCodes: [
//           'ETIMEDOUT',
//           'ECONNRESET',
//           'EADDRINUSE',
//           'ECONNREFUSED',
//           'EPIPE',
//           'ENOTFOUND',
//           'ENETUNREACH',
//           'EAI_AGAIN'
//         ],
//         maxRetryAfter: undefined,
//         calculateDelay: [Function: calculateDelay],
//         backoffLimit: Infinity,
//         noise: 100
//       },
//       localAddress: undefined,
//       method: 'POST',
//       createConnection: undefined,
//       cacheOptions: {
//         shared: undefined,
//         cacheHeuristic: undefined,
//         immutableMinTimeToLive: undefined,
//         ignoreCargoCult: undefined
//       },
//       https: {
//         alpnProtocols: undefined,
//         rejectUnauthorized: undefined,
//         checkServerIdentity: undefined,
//         certificateAuthority: undefined,
//         key: undefined,
//         certificate: undefined,
//         passphrase: undefined,
//         pfx: undefined,
//         ciphers: undefined,
//         honorCipherOrder: undefined,
//         minVersion: undefined,
//         maxVersion: undefined,
//         signatureAlgorithms: undefined,
//         tlsSessionLifetime: undefined,
//         dhparam: undefined,
//         ecdhCurve: undefined,
//         certificateRevocationLists: undefined
//       },
//       encoding: undefined,
//       resolveBodyOnly: false,
//       isStream: false,
//       responseType: 'text',
//       url: <ref *1> URL {
//         [Symbol(context)]: URLContext {
//           flags: 400,
//           scheme: 'https:',
//           username: '',
//           password: '',
//           host: 'discord.com',
//           port: null,
//           path: [
//             'api',
//             'webhooks',
//             '997498804607664270',
//             'L1-Sy5HBQwYCBj9RJ17MmJUi6HuaRlkwslnTC2C7DWGhGe76BzYILOXN4M7mGpbUjEPu'
//           ],
//           query: null,
//           fragment: null
//         },
//         [Symbol(query)]: URLSearchParams {
//           [Symbol(query)]: [],
//           [Symbol(context)]: [Circular *1]
//         }
//       },
//       pagination: {
//         transform: [Function: transform],
//         paginate: [Function: paginate],
//         filter: [Function: filter],
//         shouldContinue: [Function: shouldContinue],
//         countLimit: Infinity,
//         backoff: 0,
//         requestLimit: 10000,
//         stackAllItems: false
//       },
//       setHost: true,
//       maxHeaderSize: undefined
//     },
//     _merging: false,
//     _init: [
//       {
//         json: { username: 'FroggyFresh', embeds: [ [Object] ] },
//         method: 'post'
//       }
//     ]
//   }
