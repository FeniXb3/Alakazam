const WebSocketServer = require('ws').Server;
const https = require('https');
const fs = require('fs');

const privateKey = fs.readFileSync('cert/cert.key', 'utf8');
const certificate = fs.readFileSync('cert/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials);
const port = 1338;

const wss = new WebSocketServer({
    server: httpsServer
});

httpsServer.listen(port);


const chambers = {};

// Creating connection using websocket
wss.on('connection', ws => {
    console.log('new client connected');
    // sending message
    ws.on('message', (data, isBinary) => {
        console.log(`Client has sent us: ${data}`)
        const jsonData = JSON.parse(data);
        const chamberName = jsonData.chamber;

        switch (jsonData.command) {
            case 'join':
                console.log('case join');
                if (chamberName in chambers) {
                    chambers[chamberName].mages.push(ws);
                    const broadcastData = {
                        command: 'update',
                        flowchart: chambers[chamberName].flowchart
                    }
                    ws.send(JSON.stringify(broadcastData), { binary: isBinary });
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
                console.log('case update');
                chambers[chamberName].flowchart = jsonData.flowchart;
                const broadcastData = {
                    command: 'update',
                    flowchart: jsonData.flowchart
                }
                chambers[chamberName].mages.forEach(mage => {
                    if (mage !== ws && mage.readyState == 1) {
                        console.log('Sending update info to ', mage);
                        mage.send(JSON.stringify(broadcastData), { binary: isBinary });
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

console.log(`The WebSocket server is running on port ${port}`);