const net = require('net');
const readline = require('readline');

const client = new net.Socket();

client.connect(3000, 'localhost', () => {
  console.log('Połączono z serwerem.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    client.write(input);
  });

  client.on('data', (data) => {
    console.log(data.toString());
  });

  client.on('close', () => {
    console.log('Połączenie z serwerem zostało zakończone.');
    rl.close();
  });
});

process.on('SIGINT', () => {
  console.log('Zamykanie klienta...');
  client.end(() => {
    console.log('Zakończono połączenie');
    process.exit(0);
  });
});