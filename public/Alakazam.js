import { Flowchart } from './Flowchart.js';
import { modal } from './ModalHandler.js';
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
        this.zoomSlider = document.querySelector("#zoom-range");
        this.alertContainer = document.getElementById('alert-container');
        this.alertElement = document.getElementById('alert');

        this.moveLeftButton = document.getElementById('move-left');
        this.moveRightButton = document.getElementById('move-right');
        this.moveUpButton = document.getElementById('move-up');
        this.moveDownButton = document.getElementById('move-down');
        this.zoomInViewBoxButton = document.getElementById('zoom-in-viewbox');
        this.zoomOutViewBoxButton = document.getElementById('zoom-out-viewbox');
        // this.moveButtonDownInterval

        this.serializeBase64Button = document.getElementById('serialize-base64');
        this.deserializeBase64Button = document.getElementById('deserialize-base64');
        this.serializeJsonButton = document.getElementById('serialize-json');
        this.deserializeJsonButton = document.getElementById('deserialize-json');
        this.serializedData = document.getElementById('serialized-data');
        this.sharingLink = document.getElementById('sharing-link');
        this.fileInput = document.getElementById('load-zam');

        // this.nodeDataModalObject = new ModalHandler('input-data', 'Node data', 'Data:');

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

        const params = this.getQueryParams();
        if (params && params.data) {
            this.flowchart.deserializeBase64(decodeURIComponent(unescape(params.data)));
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
            this.handleRemovingNode();
        });

        this.nodeMenu.setupHandler(icon.connect, () => {
            this.initializeLinkingNode();
        });

        this.nodeMenu.setupHandler(icon.disconnect, () => {
            this.removeConnection();
        });

        this.nodeMenu.setupHandler(icon.edit, () => {
            this.handleEditingNode();
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
            this.handleAddingOutputNode();
        });
        
        this.nodeTypeMenu.setupHandler(icon.import, () => {           
            this.handleAddingInputNode();
        });
        
        this.nodeTypeMenu.setupHandler(icon.smallgear, () => {           
            this.handleAddingVariableOperationNode();
        });
        
        this.nodeTypeMenu.setupHandler(icon.stop, () => {
            this.handleAddingStopNode();
        });

        this.nodeTypeMenu.setupHandler(icon.split, () => {  
            this.handleAddingDecisionNode();
        });
        
        // this.centerView();
    }

    nodeAddingModalCallback = (content, type) => {
        const nodeType = type || modal.getAttribute('data-node-type');

        if (this.isEditing) {
            const currentNode = this.flowchart.findNodeByMermaidId(this.currentNodeElement.id);
            this.flowchart.editNode(currentNode, content);
            this.draw();
        }
        else {
            this.endAddingNode(nodeType, content);
        }
        this.isEditing = false;
    }

    // source - https://stackoverflow.com/a/21152762/1816426
    getQueryParams = () => {
        return location.search
          ? location.search.substr(1).split`&`.reduce((qd, item) => {let [k,v] = item.split`=`; v = v && decodeURIComponent(v); (qd[k] = qd[k] || []).push(v); return qd}, {})
          : {}
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
        this.isDeciding = false;
        this.nodeTypeMenu.show(rect.x + (rect.width/2), rect.y + rect.height, this.currentNodeElement)
    }

    endAddingNode = (nodeType, nodeDescription) => {
        const newNode = this.flowchart.addNodeTo(this.currentNodeElement.id, false, nodeDescription, nodeType, this.targetConnectionDescription);
        this.draw();

        if (newNode) {
            newNode.scrollTo();
        }
        
        this.targetConnectionDescription = '';
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
            modal.show(editModalInfo.title, {}, editModalInfo.content, this.nodeAddingModalCallback);
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
    }

    moveGraph = (byX, byY) => {
        const multiplier = 10;
        let viewBoxData = document.querySelector('#theGraph').getAttribute('viewBox');
        
        let values = viewBoxData.split(' ').map(v => parseFloat(v))
        //   alert(values.join(' '))
        values[0] += byX * multiplier;
        values[1] += byY * multiplier;
        document.querySelector('#theGraph').setAttribute('viewBox',values.join(' '));
    }

    zoomGraphViewBox = (byX, byY) => {
        const multiplier = 10;
        let viewBoxData = document.querySelector('#theGraph').getAttribute('viewBox');
        
        let values = viewBoxData.split(' ').map(v => parseFloat(v))
        //   alert(values.join(' '))
        values[0] -= byX * multiplier/2;
        values[1] -= byY * multiplier/2;
        values[2] += byX * multiplier;
        values[3] += byY * multiplier;

        if (values[2] > 0 && values[3] > 0) {
            document.querySelector('#theGraph').setAttribute('viewBox',values.join(' '));
        }
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
            this.handleSavingZam();
        });

        this.deserializeBase64Button.addEventListener('click', () => {
            this.handleOpeningZam();
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

        this.loadExampleButton.addEventListener('click', () => {
            this.handleLoadingExample();
        });

        this.resetButton.addEventListener('click', () => {
            this.handleFlowchartReseting();
        });

        this.zoomSlider.oninput = function() {
            document.querySelector("#theGraph").setAttribute("width", this.value);
        }

        this.moveLeftButton.addEventListener('mousedown', () => {
            clearInterval(this.moveButtonDownInterval)
            this.moveButtonDownInterval = setInterval(() => {
                this.moveGraph(-1, 0);
            }, 0);
        });
        this.moveLeftButton.addEventListener('mouseup', () => {
            clearInterval(this.moveButtonDownInterval)
        });

        this.moveRightButton.addEventListener('mousedown', () => {
            clearInterval(this.moveButtonDownInterval)
            this.moveButtonDownInterval = setInterval(() => {
                this.moveGraph(1, 0);
            }, 0);
        });
        this.moveRightButton.addEventListener('mouseup', () => {
            clearInterval(this.moveButtonDownInterval)
        });

        this.moveUpButton.addEventListener('mousedown', () => {
            clearInterval(this.moveButtonDownInterval)
            this.moveButtonDownInterval = setInterval(() => {
                this.moveGraph(0, -1);
            }, 0);
        });
        this.moveUpButton.addEventListener('mouseup', () => {
            clearInterval(this.moveButtonDownInterval)
        });

        this.moveDownButton.addEventListener('mousedown', () => {
            clearInterval(this.moveButtonDownInterval)
            this.moveButtonDownInterval = setInterval(() => {
                this.moveGraph(0, 1);
            }, 0);
        });
        this.moveDownButton.addEventListener('mouseup', () => {
            clearInterval(this.moveButtonDownInterval)
        });

        this.zoomInViewBoxButton.addEventListener('mousedown', () => {
            clearInterval(this.moveButtonDownInterval)
            this.moveButtonDownInterval = setInterval(() => {
                this.zoomGraphViewBox(-1, -1);
            }, 0);
        });
        this.zoomInViewBoxButton.addEventListener('mouseup', () => {
            clearInterval(this.moveButtonDownInterval)
        });

        this.zoomOutViewBoxButton.addEventListener('mousedown', () => {
            clearInterval(this.moveButtonDownInterval)
            this.moveButtonDownInterval = setInterval(() => {
                this.zoomGraphViewBox(1, 1);
            }, 0);
        });
        this.zoomOutViewBoxButton.addEventListener('mouseup', () => {
            clearInterval(this.moveButtonDownInterval)
        });

        document.addEventListener('keydown', event => {
            if (!event.getModifierState('Shift')) {
                return;
            }

            if (event.key == "ArrowDown") {
                this.moveGraph(0, 1);
            }
            else if (event.key == "ArrowLeft") {
                this.moveGraph(-1, 0);
            }
            else if (event.key == "ArrowRight") {
                this.moveGraph(1, 0);
            }
            else if (event.key == "ArrowUp") {
                this.moveGraph(0, -1);
            }
            else if (event.key == "+") {
                this.zoomGraphViewBox(-1, -1);
            }
            else if (event.key == "_") {
                this.zoomGraphViewBox(1, 1);
            }
        });
        
        document.addEventListener('keyup', event => {
            if (event.key == "Enter" && event.getModifierState('Control')) {
                this.alakazam();
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
            else if (!modal.isVisible && !this.flowchart.isMagicHappening && event.getModifierState('Shift')) {
                if (event.key == 'L') {
                    this.handleLoadingExample();
                }
                else if (event.key == 'R') {
                    this.handleFlowchartReseting();
                }
                else if (event.key == 'E') {
                    this.handleSVGExporting();
                }
                else if (event.key == 'S') {
                    this.handleSavingZam();
                }
                else if (event.key == 'O') {
                    this.handleOpeningZam();
                }
                else if (event.key == 'H') {
                    this.sharingLink.click();
                }
            }
            else if (!modal.isVisible && !this.flowchart.isMagicHappening && !event.getModifierState('Shift')) {
                if (event.key == "ArrowDown") {
                    this.targetConnectionDescription = '';
                    this.flowchart.selectNextNode();
                }
                else if (event.key == "ArrowLeft") {
                    this.targetConnectionDescription = '';
                    this.flowchart.selectNextNode("left");
                }
                else if (event.key == "ArrowRight") {
                    this.targetConnectionDescription = '';
                    this.flowchart.selectNextNode("right");
                }
                else if (event.key == "ArrowUp") {
                    this.targetConnectionDescription = '';
                    this.flowchart.selectPreviousNode();
                }
                else if (this.flowchart.selectedNode) {
                    this.currentNodeElement = this.flowchart.selectedNode.getNodeElement();
                    if (event.key == "Delete") {
                        this.handleRemovingNode();
                        // this.flowchart.selectPreviousNode();
                    }
                    else if (event.key == "F2") {
                        this.handleEditingNode();
                    }
                    else if (this.flowchart.selectedNode.type == "decision" && this.targetConnectionDescription == '') {
                        
                        if (event.key == "y") {
                            // this.performDecisionAction('Yes');
                            this.targetConnectionDescription = 'Yes';
                        }
                        else if (event.key == "n") {
                            this.targetConnectionDescription = 'No';
                            // this.performDecisionAction('No');
                        }
                    }
                    else {
                        if (event.key == "i") {
                            this.handleAddingInputNode();
                        }
                        else if (event.key == "o") {
                            this.handleAddingOutputNode();
                        }
                        else if (event.key == "s") {
                            this.handleAddingStopNode();
                        }
                        else if (event.key == "d") {
                            this.handleAddingDecisionNode();
                        }
                        else if (event.key == "v") {
                            this.handleAddingVariableOperationNode();
                        }
                    }
                }
            }
        });

        // this.workspace.addEventListener('mousedown', event => {
        //     if (event.button != 0) {
        //         return;
        //     }
        //     this.tryShowingNodeActionMenu(event);
        // });

        this.output.addEventListener('mouseup', event => {
            if (event.button != 0) {
                return;
            }
            this.tryLinkingOrShowingAddingNodeMenu(event);
        });

        // this.workspace.addEventListener('mousemove', event => {
        //     if (this.mouseIsDown) {
        //         clearTimeout(this.longPressTiemeout);
        //         this.cancelMouseUp = true;
        //     }
        // });


        this.tryLinkingOrShowingAddingNodeMenu = event => {
            const target = event.target;
            this.mouseIsDown = false;
            clearTimeout(this.longPressTiemeout);
            if (this.cancelMouseUp) {
                this.cancelMouseUp = false;
                return;
            }

            this.decisionMenu.hide();
            this.nodeTypeMenu.hide();
            if (!target.closest('.node')) {
                this.isDeciding = false;
                this.isLinking = false;
                this.targetConnectionDescription = '';
                this.nodeMenu.hide();
                this.hideAlert();
                return;
            }

            this.previousNodeElement = this.currentNodeElement;
            this.currentNodeElement = target.closest('.node');

            console.log('Deciding: ', this.isDeciding);
            if (this.isLinking && !this.isDeciding) {
                this.finalizeLinkingNode(this.targetConnectionDescription);
                this.targetConnectionDescription = '';
            }
            else if (event.altKey) {
                this.nodeMenu.show(event.clientX, event.clientY, this.currentNodeElement);
            }
            else {
                this.addNode();
            }
        }

        this.tryShowingNodeActionMenu = event => {
            this.mouseIsDown = true;
            this.pressStartTime = Date.now();
            const target = event.target;
            
            this.decisionMenu.hide();
            this.nodeTypeMenu.hide();
            if (!target.closest('.node')) {
                this.isDeciding = false;
                this.isLinking = false;
                this.targetConnectionDescription = '';
                this.nodeMenu.hide();
                this.hideAlert();
                return;
            }
            
            this.previousNodeElement = this.currentNodeElement;
            this.currentNodeElement = target.closest('.node');
            
            this.longPressTiemeout = setTimeout(() => {
                this.cancelMouseUp = true;
                this.nodeMenu.show(event.clientX, event.clientY, this.currentNodeElement);
            }, 500);
        }

        this.saveSvgButton.addEventListener('click', event => {
            this.handleSVGExporting();
        });

        this.runButton.addEventListener('click', e => {
            this.alakazam();
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
        Prism.highlightAll();

        const serializedData = this.flowchart.serializeBase64();
        this.sharingLink.href = `?data=${encodeURIComponent(escape(serializedData))}`;
        this.sharingLink.target = '_blank';

        if (!blockBroadcast && this.isConnectedToServer()) {
            const broadcastData = {
                command: 'update',
                chamber: this.chamberName,
                flowchart: serializedData
            }
            this.ws.send(JSON.stringify(broadcastData));
        }
        
        document.querySelector("#theGraph").setAttribute("width", this.zoomSlider.value);
        const nodeElements = document.querySelectorAll(`.node`);
        let maximumWidth = 0;
        let maximumHeight = 0;
        nodeElements.forEach((element) => {
            const width = element.getBoundingClientRect().width;
            if (width > maximumWidth) {
                maximumWidth = width;
            }

            const height = element.getBoundingClientRect().height;
            if (height > maximumHeight) {
                maximumHeight = height;
            }
        });

        const graphWidth = document.querySelector('#theGraph').getAttribute('width');
        const outputContainerWidth = document.querySelector('#theGraph').parentElement.clientWidth;
        const outputContainerHeight = document.querySelector('#theGraph').parentElement.clientHeight;
        const desiredElementhWidth = outputContainerWidth * 0.9;
        const widthMultiplier = (desiredElementhWidth / maximumWidth);
        const possibleElementHeight = (desiredElementhWidth / maximumWidth) * maximumHeight;
        const heightLimit = outputContainerHeight / 3;
        const heightModificator = (possibleElementHeight <= heightLimit) ? 1 : heightLimit/possibleElementHeight;

        const desiredGraphWidth = widthMultiplier * graphWidth * heightModificator;
        this.zoomSlider.value = desiredGraphWidth;

        document.querySelector("#theGraph").setAttribute("width", this.zoomSlider.value);
        this.startingViewBoxData = document.querySelector('#theGraph').getAttribute('viewBox');
    }

    handleOpeningZam() {
        this.fileInput.click();
    }

    handleSavingZam() {
        modal.show('Provide flowchart Zam file name', {}, `flowchart_${Date.now()}`, fileName => {
            if (fileName == null) {
                return;
            }

            const serializedContent = this.flowchart.serializeBase64();
            this.serializedData.value = serializedContent;

            this.saveLinkHelper = this.saveLinkHelper || document.createElement("a");
            this.saveLinkHelper.href = window.URL.createObjectURL(new Blob([serializedContent], { type: "text/plain" }));
            this.saveLinkHelper.download = `${fileName}.zam`;
            this.saveLinkHelper.click();
        });
    }

    handleSVGExporting() {
        modal.show('Choose file name', {}, 'alakazam', fileName => {
            if (fileName == null) {
                return;
            }
            this.svgElement = document.getElementById('theGraph');
            this.saveSvg(this.svgElement, `${fileName}_${Date.now()}.svg`);
        });
    }

    handleFlowchartReseting() {
        this.flowchart.reset();
        this.draw();

        this.currentNodeElement = this.output.querySelector('.node');
        this.currentNodeElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        this.setMenuStartingPosition(this.nodeMenu, this.currentNodeElement);
    }

    handleLoadingExample() {
        Alakazam.clearExecutionLog();
        this.flowchart.prepare();
        this.draw();

        this.currentNodeElement = this.output.querySelector('.node');
        this.currentNodeElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

        this.setMenuStartingPosition(this.nodeMenu, this.currentNodeElement);
    }

    handleEditingNode() {
        this.editNode();
        this.draw();
    }

    handleRemovingNode() {
        this.removeNode();
        this.draw();
    }

    alakazam() {
        clearInterval(this.moveButtonDownInterval);
        document.querySelector('#theGraph').setAttribute('viewBox', this.startingViewBoxData);
        this.flowchart.alakazam();
    }

    handleAddingDecisionNode() {
        const titleText = 'Provide condition to be checked';
        const data = { 'data-node-type': 'decision' };

        modal.show(titleText, data, '', this.nodeAddingModalCallback);
    }

    handleAddingOutputNode() {
        const titleText = 'Provide text to display';
        const data = { 'data-node-type': 'output' };

        modal.show(titleText, data, '', this.nodeAddingModalCallback);
    }

    handleAddingStopNode() {
        this.nodeAddingModalCallback('Stop', 'stop');
    }

    handleAddingVariableOperationNode() {
        const titleText = 'Provide operation';
        const data = { 'data-node-type': 'operation' };

        modal.show(titleText, data, '', this.nodeAddingModalCallback);
    }

    handleAddingInputNode() {
        const titleText = 'Provide variable name to store input data';
        const data = { 'data-node-type': 'input' };

        modal.show(titleText, data, '', this.nodeAddingModalCallback);
    }

    // https://stackoverflow.com/questions/4777077/removing-elements-by-class-name
    removeElementsByClass(target, className) {
        const elements = target.getElementsByClassName(className);
        while (elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    async saveSvg(svgEl, name) {
        // this.removeElementsByClass(this.svgElement, 'flowchart-ui');
        svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        let response = await fetch('libs/prism/prism.css');
        let prismStyle = '';
        if (response.ok) {
            const blockCommentPattern = /\/\*[\s\S]*?\*\//gm
            prismStyle = await response.text();
            console.log(prismStyle);
            prismStyle = prismStyle.replace(blockCommentPattern, '');
            console.log(prismStyle);

        } else {
            alert("HTTP-Error: " + response.status);
        }
        let response2 = await fetch('export.css');
        let myStyle = '';
        if (response2.ok) {
            const blockCommentPattern = /\/\*[\s\S]*?\*\//gm
            myStyle = await response2.text();
            console.log(myStyle);
            myStyle = myStyle.replace(blockCommentPattern, '');
            console.log(myStyle);

        } else {
            alert("HTTP-Error: " + response2.status);
        }
        var svgData = svgEl.outerHTML.replace('</style>', `${prismStyle} ${myStyle}</style>`);
        var preface = '<?xml version="1.0" standalone="no"?>\r\n';
        var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
        var svgUrl = URL.createObjectURL(svgBlob);
        console.log(svgData);
        
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    static appendExecutionLog(text) {
        const executionLog = document.querySelector('#execution-panel .content');
        const section = document.createElement('section')
        section.innerHTML = text;
        executionLog.appendChild(section);
    }
    
    static clearExecutionLog() {
        const executionLog = document.querySelector('#execution-panel .content');
        executionLog.innerHTML = '';
    }
}




