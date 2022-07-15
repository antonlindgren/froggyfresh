exports.up = function (db) {
  return db.runSql(`ALTER TABLE esportal
    change created created DATETIME DEFAULT NOW()
  `)
}

exports.down = function (db) {
  return db.runSql(`ALTER TABLE esportal
  change created created TIME DEFAULT CURRENT_TIME
  `)
}
