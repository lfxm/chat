function handle(args, db, clients, channels, categories, socket) {
    const [category] = args;
    
    if (!category) {
      socket.write('Nie podano nazwy kategorii. Użyj: /createcategory (category)\n');
      return;
    }
    
    db.run('INSERT INTO categories (name) VALUES (?)', [category], function (err) {
      if (err) {
        console.error('Błąd podczas tworzenia kategorii:', err);
        socket.write('Wystąpił błąd podczas tworzenia kategorii.\n');
        return;
      }
      
      const categoryId = this.lastID;
      const newCategory = { id: categoryId, name: category };
      
      categories.set(categoryId, newCategory);
      
      socket.write(`Utworzono nową kategorię "${category}" z ID ${categoryId}.\n`);
    });
  }
  
  module.exports = { handle };