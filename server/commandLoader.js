const fs = require('fs');
const path = require('path');

function registerCommand(commands, name, handler) {
  commands[name] = handler;
}

function loadCommands(commandsDir) {
  const files = fs.readdirSync(commandsDir);
  const commands = {};

  for (const file of files) {
    const commandName = path.parse(file).name;
    const commandModule = require(path.join(commandsDir, file));
    registerCommand(commands, commandName, commandModule);
  }

  return commands;
}

module.exports = { loadCommands };
