const sql = require('../adapter/db')

async function createSessionInDb(name, discord) {
  try {
    return sql
      .promise()
      .query('INSERT INTO session (name, creator) VALUES (?, ?) RETURNING ID', [
        name,
        discord
      ])
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = { createSessionInDb }
