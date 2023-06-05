function handle(args, db, clients, channels, categories, socket) {
  const [token] = args;
  if (!token) {
    socket.write('Nie podano tokenu.');
    return;
  }

  // Sprawdź istnienie tokenu w bazie danych
  db.get('SELECT * FROM users WHERE token = ?', token, (err, row) => {
    if (err) {
      console.error('Błąd podczas sprawdzania tokenu w bazie danych:', err);
      socket.write('Wystąpił błąd podczas logowania.');
      return;
    }

    if (!row) {
      socket.write('Podany token jest nieprawidłowy.');
      return;
    }

    clients.set(socket, { username: row.username }); // Zapisz informacje o zalogowanym użytkowniku
    socket.write(`Zalogowano jako ${row.username}.`);
  });
}

module.exports = { handle, allowBeforeLogin: true };
