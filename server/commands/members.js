function handle(args, db, clients, channels, categories, socket) {
    const members = Array.from(clients.values()).map(client => client.username);
    socket.write(`Obecni użytkownicy: ${members.join(', ')}\n`);
  }
  
module.exports = { handle };
  