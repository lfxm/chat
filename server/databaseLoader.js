const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbDir = path.join(__dirname, 'data');
const dbPath = path.join(dbDir, 'data.sqlite3');
const db = new sqlite3.Database(dbPath);

function createTables(channels, categories) {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        token TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        timestamp INTEGER,
        channel INTEGER,
        FOREIGN KEY (channel) REFERENCES channels (id)
      )
    `);
  });

  // Załaduj kanały i kategorie z bazy danych
  loadChannels(db, channels);
  loadCategories(db, categories);
}

function addUser(username, token) {
  db.run('INSERT INTO users (username, token) VALUES (?, ?)', [username, token], (err) => {
    if (err) {
      console.error('Błąd podczas dodawania użytkownika do bazy danych:', err);
    } else {
      console.log(`Dodano użytkownika: ${username}`);
    }
  });
}

function addChannel(name, categoryId) {
  db.run('INSERT INTO channels (name, category_id) VALUES (?, ?)', [name, categoryId], (err) => {
    if (err) {
      console.error('Błąd podczas dodawania kanału do bazy danych:', err);
    } else {
      console.log(`Dodano kanał: ${name}`);
    }
  });
}

function addCategory(name) {
  db.run('INSERT INTO categories (name) VALUES (?)', [name], (err) => {
    if (err) {
      console.error('Błąd podczas dodawania kategorii do bazy danych:', err);
    } else {
      console.log(`Dodano kategorię: ${name}`);
    }
  });
}

function loadChannels(db, channels) {
  db.all('SELECT * FROM channels', (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania kanałów z bazy danych:', err);
      return;
    }

    rows.forEach((row) => {
      const channel = {
        id: row.id,
        name: row.name,
        category: row.category_id ? { id: row.category_id } : null,
      };
      channels.set(row.id, channel);
    });

    console.log('Załadowano kanały z bazy danych.');
  });
}

function loadCategories(db, categories) {
  db.all('SELECT * FROM categories', (err, rows) => {
    if (err) {
      console.error('Błąd podczas pobierania kategorii z bazy danych:', err);
      return;
    }

    rows.forEach((row) => {
      const category = {
        id: row.id,
        name: row.name,
      };
      categories.set(row.id, category);
    });

    console.log('Załadowano kategorie z bazy danych.');
  });
}

module.exports = {
  db,
  createTables,
  addUser,
  addChannel,
  addCategory,
  loadChannels,
  loadCategories,
};
