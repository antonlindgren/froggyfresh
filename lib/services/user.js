const sql = require('../adapter/db')

async function addUser(nickname, discord) {
  try {
    return sql
      .promise()
      .query('INSERT INTO esportal (nickname, discord) VALUES (?, ?)', [
        nickname,
        discord
      ])
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = { addUser }
