// Importing the required modules
const WebSocketServer = require('ws');
 
// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 1337 })
 
const chambers = {};

// Creating connection using websocket
wss.on('connection', ws => {
    console.log('new client connected');
    // sending message
    ws.on('message', (data, isBinary) => {
        console.log(`Client has sent us: ${data}`)
        const jsonData = JSON.parse(data);
        const chamberName = jsonData.chamber;

        switch (jsonData) {
            case 'join':
                if (chamberName in chambers) {
                    ws.send(chambers[jsonData].flowchart);
                }
                else {
                    chambers[chamberName] = {
                        flowchart: jsonData.flowchart,
                        owner: ws,
                        mages: [ws]
                    }
                }
                break;
            case 'update':
                chambers[chamberName].flowchart = jsonData.flowchart;
                chambers[chamberName].mages.forEach(mage => {
                    if (mage !== ws && mage.readyState == 1) {
                        mage.send(data, { binary: isBinary });
                    }
                });
                break;
        }
        
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