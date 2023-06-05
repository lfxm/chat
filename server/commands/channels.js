function handle(args, db, clients, channels, categories, socket) {
  const categoryChannels = {};
  const uncategorizedChannels = []; // Kanały bez kategorii

  channels.forEach(channel => {
    if (channel.category) {
      const categoryName = getCategoryName(channel.category.id, categories);
      if (!categoryChannels[categoryName]) {
        categoryChannels[categoryName] = [];
      }
      categoryChannels[categoryName].push(channel.name);
    } else {
      uncategorizedChannels.push(channel.name);
    }
  });

  let message = '';

  // Dodaj kanały bez kategorii na samej górze
  if (uncategorizedChannels.length > 0) {
    const uncategorizedChannelsList = uncategorizedChannels.join(', ');
    message += `Bez kategorii:\n${uncategorizedChannelsList}\n\n`;
  }

  // Dodaj pozostałe kategorie i kanały
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
