function handle(args, db, clients, channels, categories, socket) {
  const [channelName] = args;

  if (!channelName) {
    socket.write('Niepoprawne użycie komendy. Użyj: /switch (name)\n');
    return;
  }

  db.get('SELECT id, category_id FROM channels WHERE name = ?', [channelName], (err, row) => {
    if (err) {
      console.error('Błąd podczas sprawdzania kanału w bazie danych:', err);
      socket.write('Wystąpił błąd podczas przełączania kanału.\n');
      return;
    }

    if (!row) {
      socket.write('Kanał o podanej nazwie nie istnieje.\n');
      return;
    }

    const channelId = row.id;
    const currentCategoryId = row.category_id;

    const client = clients.get(socket);
    if (client) {
      const { channel: currentChannel } = client;

      if (currentChannel === channelId) {
        socket.write('Jesteś już w tym kanale.\n');
        return;
      }

      // Sprawdź, czy podano kategorię
      const category = categories.get(currentCategoryId);
      const categoryPrefix = category ? `[${category.name}]` : '';

      client.channel = channelId;

      clients.forEach((clientInfo, clientSocket) => {
        if (clientSocket !== socket && clientInfo.channel === currentChannel) {
          clientSocket.write(`Użytkownik ${client.username} opuścił ${categoryPrefix} ${currentChannel}.\n`);
        }
        if (clientSocket !== socket && clientInfo.channel === channelId) {
          clientSocket.write(`Użytkownik ${client.username} dołączył do ${categoryPrefix} ${channelName}.\n`);
        }
      });

      socket.write(`Przełączono do ${categoryPrefix} ${channelName}.\n`);
    }
  });
}

module.exports = {
  handle,
};