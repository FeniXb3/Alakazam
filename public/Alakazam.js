import { Flowchart } from './Flowchart.js';
import { Node } from './Node.js';
import { UIHelper } from './uihelper.js';
import { WheelMenu } from './WheelMenu.js';

export class Alakazam {
    constructor() {
        this.flowchart = new Flowchart();
        let enableCreateNodeAnywhere = false;
        this.flowchart.reset();
        this.loadExampleButton = document.getElementById('load-example');
        this.resetButton = document.getElementById('reset');
        this.workspace = document.getElementById('workspace');
        this.output = document.getElementById('output');
        this.previewContainer = document.getElementById('flowchart-code-preview');

        this.serializeBase64Button = document.getElementById('serialize-base64');
        this.deserializeBase64Button = document.getElementById('deserialize-base64');
        this.serializeJsonButton = document.getElementById('serialize-json');
        this.deserializeJsonButton = document.getElementById('deserialize-json');
        this.serializedData = document.getElementById('serialized-data');
        this.sharingLink = document.getElementById('sharing-link');

        this.connectServerButton = document.getElementById('connect-server');
        this.serverAddressText = document.getElementById('server-address');
        this.chamberNameText = document.getElementById('chamber-name');
        this.ws = null;

        this.currentNodeElement;
        this.previousNodeElement;
        this.isLinking = false;
        this.isAlternate = false;

        this.svgElement = document.getElementById('theGraph');
        this.saveSvgButton = document.getElementById('save-svg');
        this.runButton = document.getElementById('run');

        this.setupEventListeners();

        // const data = window.location.hash.replace('#','');
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
          });

        if (params.data) {
            this.flowchart.deserializeBase64(params.data);
        }

        this.nodeMenu = new WheelMenu('node-menu', this.flowchart);
        this.nodeMenu.setupHandler(icon.plus, () => {
            this.addNode();
            this.draw();
        });

        this.nodeMenu.setupHandler(icon.trash, () => {
            this.removeNode();
            this.draw();
        });

        this.nodeMenu.setupHandler(icon.connect, () => {
            this.initializeLinkingNode();
        });

        this.nodeMenu.setupHandler(icon.disconnect, () => {
            this.removeConnection();
            this.draw();
        });

    }

    setMenuStartingPosition = () => {
        this.nodeMenu.hide();
        this.currentNodeElement = this.output.querySelector('.node');
        const rect = this.currentNodeElement.getBoundingClientRect();
        this.nodeMenu.moveTo(rect.x + (rect.width/2), rect.y + rect.height);
        this.nodeMenu.prepareMenuItems(this.currentNodeElement);
    }

    isConnectedToServer = () => {
        return this.ws != null && this.ws.readyState == 1;
    }

    removeNode = () => {
        const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);

        if (currentNode) {
            this.flowchart.removeNode(currentNode);
        }
    }

    removeConnection = () => {;
        let connectionDescription = '';
        const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);
        if (currentNode.type == 'decision') {
            const pathName = prompt('Witch path do you want to create (Yes/No)?', 'Yes');
            if (!(['Yes', 'No'].includes(pathName))) {
                return;
            }
            connectionDescription = pathName;
        }

        this.flowchart.removeConnectionByDescription(currentNode, connectionDescription);
    }

    initializeLinkingNode = () => {
        this.isLinking = true;
    }

    finalizeLinkingNode = () => {
        const currentNodeMermaidId = this.currentNodeElement.id;
        const previousNodeMermaidId = this.previousNodeElement.id;
        const previousNode = this.flowchart.findNodeByMermaidId(previousNodeMermaidId);

        let connectionDescription = '';

        if (previousNode.type == 'decision') {
            const pathName = prompt('Witch path do you want to create (Yes/No)?', 'Yes');
            if (!(['Yes', 'No'].includes(pathName))) {
                return;
            }
            connectionDescription = pathName;
            this.flowchart.connectAlternateNode(previousNodeMermaidId, currentNodeMermaidId, connectionDescription);
        }
        else {
            this.flowchart.connectNodes(previousNodeMermaidId, currentNodeMermaidId, false, connectionDescription);
        }

        this.isLinking = false;
        this.draw();
    }

    addNode = () => {
                const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);
                
                let connectionDescription = '';

                if (currentNode.type == 'decision') {
                    const pathName = prompt('Witch path do you want to create (Yes/No)?', 'Yes');
                    if (!(['Yes', 'No'].includes(pathName))) {
                        return;
                    }
                    connectionDescription = pathName;
                }

                const nodeType = Flowchart.getNodeType();
                if (nodeType == null) {
                    return;
                }
                const nodeDescription = Flowchart.getNodeDescription();
                if (nodeDescription == null) {
                    return;
                }
                
                this.flowchart.addNodeTo(this.currentNodeElement.id, false, nodeDescription, nodeType, connectionDescription);
    }

    setupEventListeners = () => {
        this.connectServerButton.addEventListener('click', () => {
            const address = `ws://alakazam.enklawa-tworcza.pl:1337`; 
            // const address = `ws://localhost:1337`;
            this.chamberName = this.chamberNameText.value;
            //this.serverAddressText.value;
            console.log(`Connecting to: ${address}`);
            if (address) {
                this.ws = new WebSocket(address);
                this.ws.addEventListener('open', () =>{
                    console.log(`Connected to ${address}`);
                    const chamberJoinData = {
                        command: 'join',
                        chamber: this.chamberName,
                        flowchart: this.flowchart.serializeBase64()
                    };

                    this.ws.send(JSON.stringify(chamberJoinData));
                });

                this.ws.addEventListener('close', () =>{
                    console.log(`Connection to ${address} closed`);
                });

                this.ws.addEventListener('message', (message) => {
                    console.log(`Message incoming:`, message);
                    const jsonMessage = JSON.parse(message.data);

                    if (jsonMessage.command == 'update') {
                        this.flowchart.deserializeBase64(jsonMessage.flowchart);
                        this.draw(true);
                    }
                });
            }
        });

        this.serializeBase64Button.addEventListener('click', () => {
            const serializedContent = this.flowchart.serializeBase64();
            this.serializedData.value = serializedContent;
        });

        this.deserializeBase64Button.addEventListener('click', () => {
            const serializedContent = this.serializedData.value;
            this.flowchart.deserializeBase64(serializedContent);
            this.draw();
        });

        this.serializeJsonButton.addEventListener('click', () => {
            const serializedContent = this.flowchart.serializeJson();
            this.serializedData.value = serializedContent;
        });

        this.deserializeJsonButton.addEventListener('click', () => {
            const serializedContent = this.serializedData.value;
            this.flowchart.deserializeJson(serializedContent);
            this.draw();
        });

        this.loadExampleButton.addEventListener('click', () => {
            this.flowchart.prepare();
            this.draw();
            this.setMenuStartingPosition();
        });

        this.resetButton.addEventListener('click', () => {
            this.flowchart.reset();
            this.draw();
            this.setMenuStartingPosition();
        });

        document.oncontextmenu = function () {
            return false;
        }

        document.addEventListener('keyup', event => {
            if (event.key == "Enter" && event.getModifierState('Control')) {
                this.flowchart.alakazam();
            }
            else if (event.key == "Escape" && this.isLinking) {
                this.isLinking = false;
                this.draw();
            }
        });

        this.workspace.addEventListener('click', (event) => {   
            if (!event.target.closest('.node')) {
                this.nodeMenu.hide();
                return;
            }

            this.previousNodeElement = this.currentNodeElement;
            this.currentNodeElement = event.target.closest('.node');

            if (this.isLinking) {
                this.finalizeLinkingNode();
            }
            else {
                this.nodeMenu.show(event.clientX, event.clientY, this.currentNodeElement);
            }
        });



        this.saveSvgButton.addEventListener('click', event => {
            const fileName = prompt('Choose file name', 'alakazam');
            if (fileName == null) {
                return;
            }

            saveSvg(this.svgElement, `${fileName}_${Date.now()}.svg`);
        });

        this.runButton.addEventListener('click', e => {
            this.flowchart.alakazam();
        });
    }

    draw = (blockBroadcast) => {
        const flowchartCode = this.flowchart.generateCode();
        this.previewContainer.innerText = flowchartCode;
        
        mermaid.render('theGraph', flowchartCode, (svgCode) => {
            this.output.innerHTML = svgCode;

            // const svgNodes = Array.from(output.getElementsByClassName('node'));
            // svgNodes.forEach((n, i) => {
            //     const flowchartNode = this.flowchart.findNodeByMermaidId(n.id);
            //     // UIHelper.addButtonContainer(n);
            //     const uiContainer = n;//n.querySelector('.flowchart-ui-inner-container');

            //     if (flowchartNode.type != 'stop') {
            //         UIHelper.addPlusButton(uiContainer);
            //     }

            //     if (flowchartNode.type == 'decision') {
            //         UIHelper.addAlternatePlusButton(uiContainer);
            //         UIHelper.addAlternateLinkButton(uiContainer);
            //     }

            //     if (i != 0) {
            //         UIHelper.addRemoveNodeButton(uiContainer);
            //     }
            //     if (svgNodes.length > 1 && flowchartNode.type != 'stop') {
            //         UIHelper.addLinkButton(uiContainer);
            //     }
            // });
        });

        const serializedData = this.flowchart.serializeBase64();
        this.sharingLink.href = `?data=${serializedData}`;
        this.sharingLink.target = '_blank';

        if (!blockBroadcast && this.isConnectedToServer()) {
            const broadcastData = {
                command: 'update',
                chamber: this.chamberName,
                flowchart: serializedData
            }
            this.ws.send(JSON.stringify(broadcastData));
        }
    }

    // https://stackoverflow.com/questions/4777077/removing-elements-by-class-name
    removeElementsByClass(target, className) {
        const elements = target.getElementsByClassName(className);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    saveSvg(svgEl, name) {
        this.removeElementsByClass(svgElement, 'flowchart-ui');
        svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        var svgData = svgEl.outerHTML;
        var preface = '<?xml version="1.0" standalone="no"?>\r\n';
        var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}




