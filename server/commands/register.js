const crypto = require('crypto');

function handle(args, db, clients, channels, categories, socket) {
  const [username] = args;
  if (!username) {
    socket.write('Nie podano nazwy użytkownika.');
    return;
  }

  // Sprawdź istnienie użytkownika w bazie danych
  db.get('SELECT * FROM users WHERE username = ?', username, (err, row) => {
    if (err) {
      console.error('Błąd podczas sprawdzania użytkownika w bazie danych:', err);
      socket.write('Wystąpił błąd podczas rejestracji.');
      return;
    }

    if (row) {
      socket.write('Podana nazwa użytkownika jest już zajęta.');
      return;
    }

    const token = generateToken(); // Wygeneruj unikalny token
    db.run('INSERT INTO users (username, token) VALUES (?, ?)', [username, token], (err) => {
      if (err) {
        console.error('Błąd podczas zapisywania użytkownika do bazy danych:', err);
        socket.write('Wystąpił błąd podczas rejestracji.');
        return;
      }

      clients.set(socket, { username, token }); // Zapisz informacje o zalogowanym użytkowniku
      socket.write(`Zarejestrowano jako ${username}. Twój token to: ${token}`);
    });
  });
}

function generateToken() {
  const token = crypto.randomBytes(8).toString('hex'); // Wygeneruj unikalny token

  // Możesz tutaj dodać dodatkowe operacje na tokenie, np. zaszyfrowanie lub inne modyfikacje

  return token;
}

module.exports = { handle, allowBeforeLogin: true };
