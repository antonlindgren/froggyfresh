exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE esportal (
      id int(4) NOT NULL AUTO_INCREMENT,
      nickname varchar(32) NOT NULL DEFAULT '',
      discord varchar(128) NOT NULL DEFAULT '',
      esportal_id varchar(128) NOT NULL DEFAULT '',
      created TIME DEFAULT CURRENT_TIME,
      PRIMARY KEY (id),
      UNIQUE(esportal_id)
    )
  `)
}

exports.down = function (db) {
  return db.dropTable('esportal')
}
