function handle(args, db, clients, channels, categories, socket) {
  if (clients.has(socket)) {
    clients.delete(socket);
    socket.write('Zostałeś wylogowany.');
  }
}

module.exports = { handle };
