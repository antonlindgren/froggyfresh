const sql = require('../adapter/db')

async function addUser(nickname, discord, esportalId) {
  try {
    return sql
      .promise()
      .query(
        'INSERT INTO esportal (nickname, discord, esportal_id) VALUES (?, ?, ?)',
        [nickname, discord, esportalId]
      )
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = { addUser }
