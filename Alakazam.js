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
        this.outputContainer = document.getElementById("output-container");
        this.previewContainer = document.getElementById('flowchart-code-preview');
        this.alertContainer = document.getElementById('alert-container');
        this.alertElement = document.getElementById('alert');

        this.serializeBase64Button = document.getElementById('serialize-base64');
        this.deserializeBase64Button = document.getElementById('deserialize-base64');
        this.serializeJsonButton = document.getElementById('serialize-json');
        this.deserializeJsonButton = document.getElementById('deserialize-json');
        this.serializedData = document.getElementById('serialized-data');
        this.sharingLink = document.getElementById('sharing-link');
        this.fileInput = document.getElementById('load-zam');

        this.nodeDataModalTrigger = document.getElementById('node-data-modal-trigger');
        this.nodeDataModal = document.getElementById('nodeDescriptionModal');
        this.saveNodeDataButton = document.getElementById('save-node-data');

        this.connectServerButton = document.getElementById('connect-server');
        this.serverAddressText = document.getElementById('server-address');
        this.chamberNameText = document.getElementById('chamber-name');
        this.ws = null;

        this.currentNodeElement;
        this.previousNodeElement;
        this.isLinking = false;
        this.isAlternate = false;
        this.isRemovingConnection = false;

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

        const nodeMenuConfig = {
            slicePathFunction: slicePath().MenuSliceWithoutLine,
            spreaderEnable: true,
            clickModeSpreadOff: true,
            spreaderInTitle: icon.list,
            spreaderOutTitle: icon.contract,
            navAngle: 0,
            navItemsContinuous: false,
            sliceAngle: 0,
            wheelRadius: 95,
            colors: colorpalette.defaultpalette,
        }

        this.nodeMenu = new WheelMenu('node-wheel-menu', this.flowchart, nodeMenuConfig, [
            icon.plus,
            icon.connect,
            icon.disconnect,
            icon.trash,
            icon.edit
        ]);
        this.nodeMenu.setupHandler(icon.plus, () => {
            this.addNode();
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
        });

        this.nodeMenu.setupHandler(icon.edit, () => {
            this.editNode();
            this.draw();
        });
        
        const decisionMenuConfig = {
            slicePathFunction: slicePath().MenuSliceSelectedLine,
            spreaderEnable: false,
            navAngle: 147.5,
            navItemsContinuous: true,
            sliceAngle: -115,
            wheelRadius: 170,
            colors: new Array("#00A0B0", "#EB6841"),
        }
        
        this.decisionMenu = new WheelMenu('decision-wheel-menu', this.flowchart, decisionMenuConfig, [
            icon.check,
            icon.cross
        ]);
        this.decisionMenu.hide();
        this.decisionMenu.setupHandler(icon.check, () => {
            
            this.performDecisionAction('Yes');
        });
        this.decisionMenu.setupHandler(icon.cross, () => {
            this.performDecisionAction('No');
        });

        const nodeTypeMenuMenuConfig = {
            slicePathFunction: slicePath().MenuSliceSelectedLine,
            spreaderEnable: false,
            navAngle: 0,
            navItemsContinuous: false,
            sliceAngle: 0,
            wheelRadius: 95,
            colors: colorpalette.greensilver,
        }
        
        this.nodeTypeMenu = new WheelMenu('node-type-wheel-menu', this.flowchart, nodeTypeMenuMenuConfig, [
            icon.bubble,
            icon.import,
            icon.smallgear,
            icon.stop,
            icon.split,
        ]);
        this.nodeTypeMenu.hide();
        this.nodeTypeMenu.setupHandler(icon.bubble, () => {
            // this.nodeTypeToAdd = 'input';
            
            this.nodeDataModal.setAttribute('data-node-type', 'output');
            const modalTitle = this.nodeDataModal.querySelector('.modal-title');
            modalTitle.textContent = 'Provide text to display';
            this.nodeDataModalTrigger.click();
            // this.endAddingNode('output');
        });
        this.nodeTypeMenu.setupHandler(icon.import, () => {
            this.nodeDataModal.setAttribute('data-node-type', 'input');
            const modalTitle = this.nodeDataModal.querySelector('.modal-title');
            modalTitle.textContent = 'Provide variable name to store input data';
            this.nodeDataModalTrigger.click();
            // this.endAddingNode('input');
        });
        this.nodeTypeMenu.setupHandler(icon.smallgear, () => {
            this.nodeDataModal.setAttribute('data-node-type', 'operation');
            const modalTitle = this.nodeDataModal.querySelector('.modal-title');
            modalTitle.textContent = 'Provide operation';
            this.nodeDataModalTrigger.click();
            // this.endAddingNode('operation');
        });
        this.nodeTypeMenu.setupHandler(icon.stop, () => {
            this.nodeDataModal.setAttribute('data-node-type', 'stop');
            const modalTitle = this.nodeDataModal.querySelector('.modal-title');
            modalTitle.textContent = 'Just write Stop';
            this.nodeDataModalTrigger.click();
            // this.endAddingNode('stop');
        });
        this.nodeTypeMenu.setupHandler(icon.split, () => {
            this.nodeDataModal.setAttribute('data-node-type', 'decision');
            const modalTitle = this.nodeDataModal.querySelector('.modal-title');
            modalTitle.textContent = 'Provide condition to be checked';
            this.nodeDataModalTrigger.click();
            // this.endAddingNode('decision');
        });
        
        
        this.centerView();
    }

    performDecisionAction = (connectionDescription) => {
        this.targetConnectionDescription = connectionDescription;
        if (this.isLinking) {
            // this.finalizeLinkingNode(connectionDescription);
            this.showAlert('linking');
        }
        else if (this.isRemovingConnection) {
            const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);
            this.flowchart.removeConnectionByDescription(currentNode, connectionDescription);
            this.isRemovingConnection = false;
            this.draw();
        }
        else {
            this.finalizeAddingNode(connectionDescription);
        }

        this.isDeciding = false;
    }

    finalizeAddingNode = (connectionDescription) => {
        const rect = this.currentNodeElement.getBoundingClientRect();
        this.isDeciding = true;
        this.nodeTypeMenu.show(rect.x + (rect.width/2), rect.y + rect.height, this.currentNodeElement)
    }

    endAddingNode = (nodeType, nodeDescription) => {
//         this.nodeDataModalTrigger.click();
// return;

        // const nodeDescription = Flowchart.getNodeDescription();
        // if (nodeDescription == null) {
        //     return;
        // }
        this.flowchart.addNodeTo(this.currentNodeElement.id, false, nodeDescription, nodeType, this.targetConnectionDescription);
        this.draw();
    }

    centerView = () => {
        const outputRect = output.getBoundingClientRect();
        const outputContainerRect = this.outputContainer.getBoundingClientRect()
        this.outputContainer.scrollTop = 0;
        this.outputContainer.scrollLeft = outputRect.width/2 - outputContainerRect.width/2;
    }

    editNode = () => {
        const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);

        if (currentNode) {
            this.isEditing = true;
            const editModalInfo = currentNode.getEditInfo();
            // const newContent = prompt(editModalInfo.title, editModalInfo.content);
            const modalTitle = this.nodeDataModal.querySelector('.modal-title');
            modalTitle.textContent = editModalInfo.title;
            const nodeDescriptionInput = this.nodeDataModal.querySelector('.modal-body input');
            nodeDescriptionInput.value = editModalInfo.content;
            this.nodeDataModalTrigger.click();
        }
    }

    setMenuStartingPosition = (wheelMenu, targetNode) => {
        wheelMenu = wheelMenu || this.nodeMenu;
        if (!targetNode) {
            this.currentNodeElement = this.output.querySelector('.node');
            targetNode = this.currentNodeElement;
        }
        const rect = targetNode.getBoundingClientRect();
        wheelMenu.moveTo(rect.x + (rect.width/2), rect.y + rect.height);
        wheelMenu.prepareMenuItems(targetNode);
        
        setTimeout(() => {
            this.nodeMenu.hide();
        }, 300);
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
            this.isRemovingConnection = true;
            const rect = this.currentNodeElement.getBoundingClientRect();
            this.isDeciding = true;
            this.decisionMenu.show(rect.x + (rect.width/2), rect.y + rect.height, this.currentNodeElement)
            return;
        }

        this.flowchart.removeConnectionByDescription(currentNode, connectionDescription);
        
        this.isRemovingConnection = true;
        this.draw();
    }

    initializeLinkingNode = () => {
        const currentNodeMermaidId = this.currentNodeElement.id;
        
        const currentNode = this.flowchart.findNodeByMermaidId(currentNodeMermaidId);
        
        this.isLinking = true;
        if (currentNode.type == 'decision') {
            const rect = this.currentNodeElement.getBoundingClientRect();
            this.isDeciding = true;
            this.decisionMenu.show(rect.x + (rect.width/2), rect.y + rect.height, this.currentNodeElement)
        }
        else {        
            this.showAlert('linking');
        }
    }

    showAlert = (alertType, timeout) => {
        let alertText = '';
        let className = 'alert-info';
        switch(alertType) {
            case 'linking':
                alertText = 'Select node to link to...'
                className = 'alert-warning';
                break;
            case 'connecting':
                alertText = 'Connecting to server...'
                break;
            case 'connected':
                alertText = 'Connected!'
                break;
            case 'joining':
                alertText = 'Joining chamber...'
                break;
            case 'disconnected':
                alertText = 'Disconnected from the server'
                break;
            case 'remote update':
                alertText = 'Zam updated by other user'
                break;
        }

        this.alertElement.innerText = alertText;
        this.alertElement.classList.remove(...this.alertElement.classList);
        this.alertElement.classList.add('alert');
        this.alertElement.classList.add(className);
        this.alertContainer.classList.add('visible');

        if (timeout) {
            if (this.alertHidingTimeout) {
                clearTimeout(this.alertHidingTimeout);
                this.alertHidingTimeout = null;
            }
            this.alertHidingTimeout = setTimeout(() => {
               this.hideAlert(); 
            }, timeout).stop;
        }
    }

    hideAlert = () => {
        this.alertContainer.classList.remove('visible');
        this.alertContainer.classList.add('hidden');

        clearTimeout(this.alertHidingTimeout);
        this.alertHidingTimeout = null;
    }

    finalizeLinkingNode = (connectionDescription) => {
        console.log("------------------------")
        connectionDescription = connectionDescription || '';
        const currentNodeMermaidId = this.currentNodeElement.id;
        const previousNodeMermaidId = this.previousNodeElement.id;
        
        this.flowchart.connectAlternateNode(previousNodeMermaidId, currentNodeMermaidId, connectionDescription);
        // this.flowchart.connectNodes(previousNodeMermaidId, currentNodeMermaidId, false, connectionDescription);
        this.endLinkingNode();
        this.hideAlert();
    }
    
    endLinkingNode = () => {
        this.isLinking = false;
        this.draw();
    }

    addNode = () => {
        const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);
        
        let connectionDescription = '';

        if (currentNode.type == 'decision') {
            const rect = this.currentNodeElement.getBoundingClientRect();
            this.isDeciding = true;
            this.decisionMenu.show(rect.x + (rect.width/2), rect.y + rect.height, this.currentNodeElement)
            return;
        }

        this.finalizeAddingNode(connectionDescription);
        this.draw();
    }

    setupEventListeners = () => {
        this.connectServerButton.addEventListener('click', () => {
            const address = `wss://minefield.enklawa-tworcza.pl:1338`; 
            // const address = `ws://alakazam.enklawa-tworcza.pl:1337`; 
            // const address = `ws://localhost:1337`;
            this.chamberName = this.chamberNameText.value;
            //this.serverAddressText.value;
            console.log(`Connecting to: ${address}`);
            
            this.showAlert('connecting', 3000);
            if (address) {
                this.ws = new WebSocket(address);
                this.ws.addEventListener('open', () =>{
                    console.log(`Connected to ${address}`);
                    this.showAlert('connected', 3000);
                    
                    this.showAlert('joining', 3000);
                    const chamberJoinData = {
                        command: 'join',
                        chamber: this.chamberName,
                        flowchart: this.flowchart.serializeBase64()
                    };

                    this.ws.send(JSON.stringify(chamberJoinData));
                });

                this.ws.addEventListener('close', () =>{
                    console.log(`Connection to ${address} closed`);
                    this.showAlert('disconnected', 3000);
                });

                this.ws.addEventListener('message', (message) => {
                    console.log(`Message incoming:`, message);
                    const jsonMessage = JSON.parse(message.data);

                    if (jsonMessage.command == 'update') {
                        this.showAlert('remote update', 3000);
                        this.flowchart.deserializeBase64(jsonMessage.flowchart);
                        this.draw(true);
                    }
                });
            }
        });

        this.serializeBase64Button.addEventListener('click', () => {
            const fileName = prompt('Provide flowchart Zam file name', `flowchart_${Date.now()}`);
            if (fileName == null) {
                return;
            }

            const serializedContent = this.flowchart.serializeBase64();
            this.serializedData.value = serializedContent;
            
            this.saveLinkHelper = this.saveLinkHelper || document.createElement("a");
            this.saveLinkHelper.href = window.URL.createObjectURL(new Blob([serializedContent], {type: "text/plain"}));
            this.saveLinkHelper.download = `${fileName}.zam`;
            this.saveLinkHelper.click(); 
        });

        this.deserializeBase64Button.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (event) => {
            this.readFile(event.target.files[0], (serializedContent) => {
                this.flowchart.deserializeBase64(serializedContent);
                this.draw();
            });
            
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

        this.nodeDataModal.querySelector('form').addEventListener('submit', (event) => {
            this.saveNodeDataButton.click();
            event.preventDefault();
        });
        $('#nodeDescriptionModal').on('shown.bs.modal', () => {
            const nodeDescriptionInput = this.nodeDataModal.querySelector('.modal-body input');
            // nodeDescriptionInput.value = 'test';
            nodeDescriptionInput.focus();
        });
        this.saveNodeDataButton.addEventListener('click', () => {
            const nodeDescription = this.nodeDataModal.querySelector('.modal-body input').value;
            const nodeType = this.nodeDataModal.getAttribute('data-node-type');

            if (this.isEditing) {
                const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);
                this.flowchart.editNode(currentNode, nodeDescription);
                this.draw();
            }
            else {
                this.endAddingNode(nodeType, nodeDescription);
            }
            


            this.isEditing = false;
            $('.close').click(); 
        });


        this.loadExampleButton.addEventListener('click', () => {
            this.flowchart.prepare();
            this.draw();
            
            this.currentNodeElement = this.output.querySelector('.node');
            this.setMenuStartingPosition(this.nodeMenu, this.currentNodeElement);
        });

        this.resetButton.addEventListener('click', () => {
            this.flowchart.reset();
            this.draw();
    
            this.currentNodeElement = this.output.querySelector('.node');
            this.setMenuStartingPosition(this.nodeMenu, this.currentNodeElement);
        });

        document.addEventListener('keyup', event => {
            if (event.key == "Enter" && event.getModifierState('Control')) {
                this.flowchart.alakazam();
            }
            else if (event.key == "Escape") {
                this.isDeciding = false;
                this.isLinking = false;
                this.isEditing = false;
                this.targetConnectionDescription = '';
                this.decisionMenu.hide();
                this.nodeMenu.hide();
                this.nodeTypeMenu.hide();
                this.hideAlert();
            }
        });

        this.workspace.addEventListener('click', (event) => {
            this.decisionMenu.hide();
            this.nodeTypeMenu.hide();
            if (!event.target.closest('.node')) {
                this.isDeciding = false;
                this.isLinking = false;
                this.targetConnectionDescription = '';
                this.nodeMenu.hide();
                this.hideAlert();
                return;
            }

            this.previousNodeElement = this.currentNodeElement;
            this.currentNodeElement = event.target.closest('.node');

            console.log('Deciding: ', this.isDeciding);
            if (this.isLinking && !this.isDeciding) {
                console.log('==============asdfghjk');
                this.finalizeLinkingNode(this.targetConnectionDescription);
                this.targetConnectionDescription = '';
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
            this.svgElement = document.getElementById('theGraph');
            this.saveSvg(this.svgElement, `${fileName}_${Date.now()}.svg`);
        });

        this.runButton.addEventListener('click', e => {
            this.flowchart.alakazam();
        });
    }

    readFile = (file, callback) => {
        let reader = new FileReader();
    
        reader.onload = function() {
            callback(reader.result);
        };
    
        console.log(file.type);
        reader.readAsText(file);
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
        // this.removeElementsByClass(this.svgElement, 'flowchart-ui');
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




