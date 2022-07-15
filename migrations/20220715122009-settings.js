exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE settings (
      id int(4) NOT NULL AUTO_INCREMENT,
      name varchar(32) NOT NULL DEFAULT '',
      value varchar(128) NOT NULL DEFAULT '',
      created DATETIME DEFAULT NOW(),
      PRIMARY KEY (id)
    )
  `)
}

exports.down = function (db) {
  return db.dropTable('settings')
}
