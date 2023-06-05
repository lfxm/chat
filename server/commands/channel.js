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

  db.get('SELECT id, category_id FROM channels WHERE name = ?', [name], (err, row) => {
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

      if (currentCategoryId === null && categoryId === null) {
        socket.write(`Kanał "${name}" nie jest przypisany do żadnej kategorii.\n`);
        return;
      }

      client.channel = channelId;

      clients.forEach((clientInfo, clientSocket) => {
        if (clientSocket !== socket && clientInfo.channel === currentChannel) {
          clientSocket.write(`Użytkownik ${client.username} opuścił kanał ${name}.\n`);
        }
        if (clientSocket !== socket && clientInfo.channel === channelId) {
          clientSocket.write(`Użytkownik ${client.username} dołączył do kanału ${name}.\n`);
        }
      });

      socket.write(`Przełączono do kanału ${name}.\n`);
    }
  });
}

module.exports = { handle };
