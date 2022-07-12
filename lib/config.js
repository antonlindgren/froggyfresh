require('dotenv').config()

const config = {
  db: {
    host: process.env.SQL_HOST || '',
    user: process.env.SQL_USER || '',
    password: process.env.SQL_PASS || '',
    database: process.env.SQL_DB || ''
  },
  discord: {
    token: process.env.TOKEN_ID
  }
}

module.exports = { ...config }
