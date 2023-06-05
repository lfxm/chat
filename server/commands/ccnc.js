function handle(args, db, clients, channels, categories, socket) {
    const [name] = args;
  
    if (!name) {
      socket.write('Nie podano nazwy kanału. Użyj: /create (name)\n');
      return;
    }
  
    db.run('INSERT INTO channels (name, category_id) VALUES (?, NULL)', [name], function (err) {
      if (err) {
        console.error('Błąd podczas tworzenia kanału:', err);
        socket.write('Wystąpił błąd podczas tworzenia kanału.\n');
        return;
      }
  
      const channelId = this.lastID;
      const channel = {
        id: channelId,
        name,
        category: null,
      };
  
      channels.set(channelId, channel);
  
      socket.write(`Utworzono nowy kanał "${name}" bez kategorii.\n`);
    });
  }
  
  module.exports = { handle };
  