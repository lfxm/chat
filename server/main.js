const net = require('net');
const path = require('path');
const { db, createTables } = require('./databaseLoader');
const { loadCommands } = require('./commandLoader');

const clients = new Map();
const channels = new Map();
const categories = new Map();
const commandsDir = path.join(__dirname, 'commands');
const commands = loadCommands(commandsDir);

function handleCommand(command, args, db, clients, channels, categories, socket) {
  const commandHandler = commands[command];
  if (commandHandler) {
    if (commandHandler.allowBeforeLogin || clients.has(socket)) {
      commandHandler.handle(args, db, clients, channels, categories, socket);
    } else {
      socket.write('Nie jesteś zalogowany. Zarejestruj się lub zaloguj.\n');
    }
  } else {
    socket.write(`Nieznana komenda: ${command}\n`);
  }
}

const server = net.createServer((socket) => {
  console.log('Klient połączony.');

  socket.write('Witaj! Aby kontynuować, zarejestruj się lub zaloguj.\n');

  socket.on('data', (data) => {
    const message = data.toString().trim();

    if (message.startsWith('/')) {
      const [command, ...args] = message.slice(1).split(' ');
      handleCommand(command, args, db, clients, channels, categories, socket);
    } else {
      const client = clients.get(socket);
      if (client) {
        const { username, channel, dmTarget } = client;

        if (dmTarget && dmTarget.socket) {
          sendMessageToChannel(channel, message, username, true);
        } else if (channel || dmTarget) {
          sendMessageToChannel(channel, message, username);
        } else {
          socket.write('Nie jesteś w żadnym kanale ani prowadzisz prywatnej rozmowy. Użyj komendy /channel lub /dm, aby dołączyć do kanału lub rozpocząć prywatną rozmowę.\n');
        }
      } else {
        socket.write('Nie jesteś zalogowany. Zarejestruj się lub zaloguj.\n');
      }
    }
  });

  socket.on('end', () => {
    const client = clients.get(socket);
    if (client) {
      const { username, channel } = client;
      clients.delete(socket);
      clients.forEach((clientInfo, clientSocket) => {
        if (clientInfo.channel === channel) {
          clientSocket.write(`Użytkownik ${username} opuścił kanał ${channel}.\n`);
        }
      });
    }
    console.log('Klient odłączony.');
  });

  socket.on('error', (err) => {
    console.error('Błąd serwera:', err);
  });
})

function sendMessageToChannel(channel, message, username, isDM = false) {
  clients.forEach((clientInfo, clientSocket) => {
    const { channel: clientChannel, dmTarget } = clientInfo;

    if ((isDM && dmTarget && dmTarget.username === username) || (!isDM && clientChannel === channel)) {
      let prefix = '';
      if (isDM) {
        if (username === clientInfo.username) {
          prefix = '[DM] [JA]';
        } else {
          prefix = '[DM]';
        }
      } else {
        if (username === clientInfo.username) {
          prefix = `[${category}] [${channel}] [JA]`;
        } else {
          const category = channel && channels.get(channel) ? channels.get(channel).category : null;
          const categoryName = category ? category.name : '';
          prefix = `[${categoryName}] [${channel}]`;
        }
      }
      clientSocket.write(`${prefix} [${username}] ${message}\n`);
    }
  });
}

server.listen(3000, () => {
  console.log('Serwer nasłuchuje na porcie 3000');
  createTables(channels, categories);
});

process.on('SIGINT', () => {
  console.log('Zamykanie serwera...');

  db.close((err) => {
    if (err) {
      console.error('Błąd podczas zamykania bazy danych:', err);
      process.exit(1);
    } else {
      server.close(() => {
        console.log('Serwer został zamknięty');
        process.exit(0);
      });
    }
  });
});
