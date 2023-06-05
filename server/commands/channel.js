function handle(args, db, clients, channels, categories, socket) {
    const [category, name] = args;
  
    if (!category || !name) {
      socket.write('Niepoprawne użycie komendy. Użyj: /switch (cat) (name)\n');
      return;
    }
  
    let categoryId = null;
  
    if (category) {
      const existingCategory = Array.from(categories.values()).find(cat => cat.name === category);
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        socket.write(`Kategoria "${category}" nie istnieje.\n`);
        return;
      }
    }
  
    db.get('SELECT id FROM channels WHERE name = ? AND category_id = ?', [name, categoryId], (err, row) => {
      if (err) {
        console.error('Błąd podczas sprawdzania kanału w bazie danych:', err);
        socket.write('Wystąpił błąd podczas przełączania kanału.\n');
        return;
      }
  
      if (!row) {
        socket.write('Kanał o podanej nazwie i kategorii nie istnieje.\n');
        return;
      }
  
      const channelId = row.id;
      const channel = channels.get(channelId);
  
      const client = clients.get(socket);
      if (client) {
        const { channel: currentChannel } = client;
  
        if (currentChannel === channelId) {
          socket.write('Jesteś już w tym kanale.\n');
          return;
        }
  
        client.channel = channelId;
  
        clients.forEach((clientInfo, clientSocket) => {
          if (clientSocket !== socket && clientInfo.channel === currentChannel) {
            clientSocket.write(`Użytkownik ${client.username} opuścił kanał ${channel.name}.\n`);
          }
          if (clientSocket !== socket && clientInfo.channel === channelId) {
            clientSocket.write(`Użytkownik ${client.username} dołączył do kanału ${channel.name}.\n`);
          }
        });
  
        socket.write(`Przełączono do kanału ${channel.name}.\n`);
      }
    });
  }
  
  module.exports = { handle };
  