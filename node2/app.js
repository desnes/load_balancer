const express = require('express');
const app = express();
const port = 3000;
const os = require('os');


app.get('/', (req, res) => {
    const hostName = os.hostname();  // Obtiene el nombre del host
  const hostIp = Object.values(os.networkInterfaces())
                        .flat()
                        .find(i => i.family === 'IPv4' && !i.internal)
                        .address; // Encuentra la primera dirección IPv4 que no es interna

  const response = `Hola FIS! Este es el nodo 2 desde la máquina ${hostName} en la IP: ${hostIp}`;
  console.log(response);  // Imprime en la consola del servidor
  res.send(response);  // Envía la respuesta al cliente
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});