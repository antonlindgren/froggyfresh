const sql = require('../adapter/db')

var commands = [
  { name: 'help', channel: '', arguments: 0, usage: '', func: commandHelp },
  { name: 'test', channel: '', arguments: 0, usage: '', func: commandTest },
  { name: 'slap', channel: 'esportal2', arguments: 1, usage: '<nick>', func: commandSlap },
  { name: 'esportallist', channel: 'esportal2', arguments: 0, usage: '', func: commandEsportalList }
];

function parseChannelMessage(user, channel, message) {
  var content = message.content.toLowerCase();
  if(content.length === 0 || content[0] !== '!') return;

  // Remove first character (the !)
  content = content.substring(1);
  
  var input = content.split(" ");
  var arguments = [];
  if(input.length > 1) arguments = input.slice(1);
  
  commands.forEach( (cmd) => {
    // Loop through commands and see if we have a match
    if(cmd.name.toLowerCase() === input[0]) {
      // Check arguments
      if(arguments.length < cmd.arguments) {
        message.reply("Usage: !"+cmd.name+" "+cmd.usage);
		return
      }
      // Execute command
      cmd.func(user, channel, arguments);
    }
  });
}

function commandHelp(user, channel, arguments) {
  var out = "";
  commands.forEach( (cmd) => {
    if(out.length > 0) out += ", ";
	out += "**!"+cmd.name+"**";
  });
  channel.send(out);
}
function commandTest(user, channel, arguments) {
  channel.send('Test');
}
function commandSlap(user, channel, arguments) {
  channel.send('_bitchslaps '+arguments[0]+'_');
}
function commandEsportalList(user, channel, arguments) {
  sql.query("select nickname, discord, created from esportal", function(err, results, fields) {
    var out = "Found **"+results.length+"** users.\n";
    results.forEach( (res) => {
      out += res.created+": "+res.nickname+"\n";
    });
    channel.send(out);
  });
}

module.exports = { parseChannelMessage }
