// Importing the required modules
const WebSocketServer = require('ws');
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 1337 })
 
const ids = [];
const chambers = {};

// Creating connection using websocket
wss.on('connection', ws => {
    console.log('new client connected');
    // sending message
    ws.on('message', (data, isBinary) => {
        console.log(`Client has sent us: ${data}`)
        
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState == 1) {
                client.send(data, { binary: isBinary });
            }
        });
    });
    // handling what to do when clients disconnects from server
    ws.on('close', () => {
        console.log('the client has connected');
    });
    // handling client connection error
    ws.onerror = function () {
        console.log('Some Error occurred')
    }
});
console.log('The WebSocket server is running on port 8080');