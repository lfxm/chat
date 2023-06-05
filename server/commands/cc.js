function handle(args, db, clients, channels, categories, socket) {
  const [category, name] = args;

  if (!name) {
    socket.write('Nie podano nazwy kanału. Użyj: /create (category) (name)\n');
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

  db.run('INSERT INTO channels (name, category_id) VALUES (?, ?)', [name, categoryId], function (err) {
    if (err) {
      console.error('Błąd podczas tworzenia kanału:', err);
      socket.write('Wystąpił błąd podczas tworzenia kanału.\n');
      return;
    }

    const channelId = this.lastID;
    const channel = {
      id: channelId,
      name,
      category: categoryId ? { id: categoryId, name: category } : null,
    };

    channels.set(channelId, channel);

    socket.write(`Utworzono nowy kanał "${name}"${categoryId ? ` w kategorii "${category}"` : ' bez kategorii'}.\n`);
  });
}

module.exports = { handle };
