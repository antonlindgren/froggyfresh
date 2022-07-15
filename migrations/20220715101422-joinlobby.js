exports.up = function (db) {
  return db.runSql(`
   	CREATE TABLE signed (
      id int NOT NULL AUTO_INCREMENT,
      player varchar(128) NOT NULL DEFAULT '',
      joined DATETIME DEFAULT NOW(),
      sessionId int NOT NULL,
      PRIMARY KEY (id),
      CONSTRAINT fk_signed_session foreign key (sessionId) references session (id)
    )
  `)
}

exports.down = function async(db) {
  return db.dropTable('signed')
}
