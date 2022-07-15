const { got } = require('got-cjs')
const sql = require('../adapter/db')

async function esportalCron() {
	const players = [];
	sql.query("select nickname from esportal", function(err, res, fields) {
		players.push(res.nickname);
	});

	if(players.length === 0) return;
	
}

module.exports = {
  esportalCron
}