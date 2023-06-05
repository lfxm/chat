function handle(args, db, clients, channels, categories, socket) {
    const categoryChannels = {};
  
    channels.forEach(channel => {
      const categoryName = channel.category ? getCategoryName(channel.category.id, categories) : 'Brak kategorii';
      if (!categoryChannels[categoryName]) {
        categoryChannels[categoryName] = [];
      }
      categoryChannels[categoryName].push(channel.name);
    });
  
    let message = '';
  
    Object.keys(categoryChannels).forEach(category => {
      const channels = categoryChannels[category].join(', ');
      message += `${category}:\n${channels}\n\n`;
    });
  
    message = message.trim();
  
    if (message === '') {
      message = 'Brak dostępnych kanałów.';
    }
  
    socket.write(`Dostępne kanały:\n${message}\n`);
  }
  
  function getCategoryName(categoryId, categories) {
    if (Array.isArray(categories)) {
      const category = categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Brak kategorii';
    } else if (categories instanceof Map) {
      for (const [id, category] of categories) {
        if (id === categoryId) {
          return category.name;
        }
      }
    }
  
    return 'Brak kategorii';
  }
  
  module.exports = { handle };
  