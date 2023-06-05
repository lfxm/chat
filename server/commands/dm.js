function handle(args, db, clients, channels, categories, socket) {
    const [targetUsername] = args;
  
    if (!targetUsername) {
      socket.write('Podaj nazwę użytkownika, z którym chcesz rozpocząć prywatną rozmowę.\n');
      return;
    }
  
    const client = clients.get(socket);
    const targetClient = [...clients.values()].find((clientInfo) => clientInfo.username === targetUsername);
  
    if (!targetClient) {
      socket.write(`Użytkownik "${targetUsername}" nie istnieje lub nie jest zalogowany.\n`);
      return;
    }
  
    client.dmTarget = targetClient;
    socket.write(`Rozpoczęto prywatną rozmowę z użytkownikiem "${targetUsername}".\n`);
  }
  
  module.exports = { handle };
  