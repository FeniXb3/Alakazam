import { Flowchart } from './Flowchart.js';
import { Node } from './Node.js';
import { UIHelper } from './uihelper.js';

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

        this.startingNodeElement;
        this.finishingNodeElement;
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

    }

    setupEventListeners = () => {
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
        });

        this.resetButton.addEventListener('click', () => {
            this.flowchart.reset();
            this.draw();
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
            const addButton = event.target.closest('.add-node');
            const addAlternateButton = event.target.closest('.add-alternate-node');
            const linkButton = event.target.closest('.link-node');
            const linkAlternateButton = event.target.closest('.link-alternate-node');
            const removeNodeButton = event.target.closest('.remove-node');

            if (addButton || addAlternateButton) {
                this.startingNodeElement = event.target.closest('.node');
                const startingNode = this.flowchart.findNodeByMermaidId(this.startingNodeElement.id);

                const nodeType = Flowchart.getNodeType();
                if (nodeType == null) {
                    return;
                }
                const nodeDescription = Flowchart.getNodeDescription();
                if (nodeDescription == null) {
                    return;
                }
                let connectionDescription = '';

                if (startingNode.type == 'decision') {
                    if (addAlternateButton) {
                        connectionDescription = 'No'
                        this.flowchart.addNodeTo(this.startingNodeElement.id, false, nodeDescription, nodeType, connectionDescription);
                    }
                    else {
                        connectionDescription = 'Yes'
                        this.flowchart.addNodeTo(this.startingNodeElement.id, false, nodeDescription, nodeType, connectionDescription);
                    }
                }
                else {
                    this.flowchart.addNodeTo(this.startingNodeElement.id, false, nodeDescription, nodeType, connectionDescription);
                }

            }
            else if (removeNodeButton) {
                if (!this.isLinking) {
                    console.log('Removing node!');
                    this.startingNodeElement = event.target.closest('.node');
                    const startingNode = this.flowchart.findNodeByMermaidId(this.startingNodeElement.id);
                    console.log(startingNode);
                    if (startingNode) {
                        this.flowchart.removeNode(startingNode);
                    }
                }
                else {
                    console.log('Removing connnection');
                    this.finishingNodeElement = event.target.closest('.node');
                    const startingNode = this.flowchart.findNodeByMermaidId(this.startingNodeElement.id);
                    const finishingNode = this.flowchart.findNodeByMermaidId(this.finishingNodeElement.id);

                    this.flowchart.removeConnection(startingNode, finishingNode);
                    this.isLinking = false;
                }
            }
            else if (linkButton || linkAlternateButton) {
                if (!this.isLinking) {
                    this.isLinking = true;

                    this.startingNodeElement = event.target.closest('.node');
                    const startingNode = this.flowchart.findNodeByMermaidId(this.startingNodeElement.id);

                    this.isAlternate = linkAlternateButton != null;

                    (linkButton || linkAlternateButton).classList.toggle('active-button');

                    return;
                }
                else {
                    this.finishingNodeElement = event.target.closest('.node');
                    const startingNode = this.flowchart.findNodeByMermaidId(this.startingNodeElement.id);
                    const finishingNode = this.flowchart.findNodeByMermaidId(this.finishingNodeElement.id);
                    let connectionDescription = '';

                    if (startingNode.type == 'decision') {
                        if (this.isAlternate) {
                            connectionDescription = 'No'
                            this.flowchart.connectAlternateNode(this.startingNodeElement.id, this.finishingNodeElement.id, connectionDescription);
                        }
                        else {
                            connectionDescription = 'Yes'
                            this.flowchart.connectAlternateNode(this.startingNodeElement.id, this.finishingNodeElement.id, connectionDescription);
                            // flowchart.connectNodes(startingNodeElement.id, finishingNodeElement.id, false, connectionDescription);
                        }

                        this.isAlternate = false;
                    }
                    else {
                        this.flowchart.connectNodes(this.startingNodeElement.id, this.finishingNodeElement.id, false, connectionDescription);
                    }

                    this.isLinking = false;
                }
            }
            else {
                this.startingNodeElement = null;
                this.isLinking = false;
            }

            this.draw();
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

    draw = () => {
        const flowchartCode = this.flowchart.generateCode();
        this.previewContainer.innerText = flowchartCode;
        
        mermaid.render('theGraph', flowchartCode, (svgCode) => {
            this.output.innerHTML = svgCode;

            const svgNodes = Array.from(output.getElementsByClassName('node'));
            svgNodes.forEach((n, i) => {
                const flowchartNode = this.flowchart.findNodeByMermaidId(n.id);
                // UIHelper.addButtonContainer(n);
                const uiContainer = n;//n.querySelector('.flowchart-ui-inner-container');

                if (flowchartNode.type != 'stop') {
                    UIHelper.addPlusButton(uiContainer);
                }

                if (flowchartNode.type == 'decision') {
                    UIHelper.addAlternatePlusButton(uiContainer);
                    UIHelper.addAlternateLinkButton(uiContainer);
                }

                if (i != 0) {
                    UIHelper.addRemoveNodeButton(uiContainer);
                }
                if (svgNodes.length > 1 && flowchartNode.type != 'stop') {
                    UIHelper.addLinkButton(uiContainer);
                }
            });
        });

        const serializedData = this.flowchart.serializeBase64();
        this.sharingLink.href = `?data=${serializedData}`;
        this.sharingLink.target = '_blank';
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




