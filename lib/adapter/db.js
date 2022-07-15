const { db } = require('../config')
const mysql = require('mysql2')

module.exports = mysql.createPool(db)
