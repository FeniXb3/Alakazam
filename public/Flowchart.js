import { Connection } from "./Connection.js";
import { NodeFactory } from "./NodeFactory.js";
import { Node } from "./Node.js";

export class Flowchart {
    constructor() {
        this.nodes = [];
    }

    addNode(description, type) {
        const newNode = NodeFactory.makeNode(type, description);
        this.nodes.push(newNode);

        return newNode;
    }

    prepare() {
        this.nodes = [];
        const firstNode = this.addNode("Start", "start");
        const lastNode = this.addNode("Stop", "stop");

        const nameQueryNode = this.addNode("What's your name?", "output");
        const nameGettingNode = this.addNode("name", "input");
        const nameDisplayingNode = this.addNode("Ahoy, %name%!", "output");
        const championDisplayinNode = this.addNode("You are the champion!", "output");
        const decisionNode = this.addNode("%name% == Champion || %name% == champion OR %name% == CHAMPION", "decision");

        firstNode.connect(nameQueryNode);
        nameQueryNode.connect(nameGettingNode);
        nameGettingNode.connect(decisionNode);
        decisionNode.connect(championDisplayinNode, 'Yes');
        decisionNode.connect(nameDisplayingNode, 'No');
        championDisplayinNode.connect(lastNode);
        nameDisplayingNode.connect(lastNode);
    }

    reset() {
        this.nodes = [];
        this.addNode("Start", "start");
    }


    alakazam() {
        const startingNodes = this.nodes.filter(n => n.type == 'start');

        startingNodes.forEach(n => {
            const state = {};
            n.perform(state);
        });
    }

    generateCode() {

        // const code =  `graph TD
        // ${this.entryNode.getConnectionText()}`;

        const code = this.nodes.map(n => n.getConnectionText())
            .reduce((acc, curr) => `${acc}\n${curr}`, 'graph TD');

        this.nodes.forEach(n => n.dirty = false);

        return code;
    }

    addNodeTo(mermaidNodeId, shouldReattachConnected, nodeDescription, nodeType, connectionDescription) {
        const currentNode = this.findNodeByMermaidId(mermaidNodeId);

        if (!currentNode) {
            return;
        }

        const newNode = this.addNode(nodeDescription, nodeType);

        const currentConnection = currentNode.connections.find(c => c.description == connectionDescription);

        if (currentConnection) {
            newNode.connect(currentConnection.target);
            currentConnection.target = newNode;
        }
        else {
            currentNode.connect(newNode, connectionDescription);
        }
        // this.reconnectNodes(currentNode, newNode, shouldReattachConnected, connectionDescription);
    }

    addAlternateNode(startingMermaidId, nodeDescription, nodeType, connectionDescription) {
        const currentNode = this.findNodeByMermaidId(startingMermaidId);

        if (!currentNode) {
            return;
        }

        const newNode = this.addNode(nodeDescription, nodeType);
        currentNode.connect(newNode, connectionDescription)
    }

    connectAlternateNode(startingMermaidId, finishingMermaidId, connectionDescription) {
        const startingNode = this.findNodeByMermaidId(startingMermaidId);
        const finishingNode = this.findNodeByMermaidId(finishingMermaidId);

        if (!startingNode || !finishingNode) {
            return;
        }

        startingNode.connections = startingNode.connections.filter(c => c.description != connectionDescription);
        startingNode.connect(finishingNode, connectionDescription)
    }

    reconnectNodes(currentNode, newNode, shouldReattachConnected, connectionDescription) {
        if (shouldReattachConnected) {
            currentNode.connections.forEach(c => {
                if (c.target != currentNode && c.target != newNode) {
                    newNode.connect(c.target, c.description);
                }
            });

        }
        currentNode.connections = [];

        currentNode.connect(newNode, connectionDescription)
    }

    removeNode(node) {
        this.nodes.forEach(n => {
            n.connections = n.connections.filter(c => c.target != node);
        });

        this.nodes = this.nodes.filter(n => n != node);
    }

    removeConnection(startingNode, finishingNode) {
        startingNode.connections = startingNode.connections.filter(c => c.target != finishingNode);
    }

    removeConnectionByDescription(startingNode, description) {
        description = description || "";
        startingNode.connections = startingNode.connections.filter(c => c.description != description);
    }
    connectNodes(startingMermaidId, finishingMermaidId, shouldReattachConnected, connectionDescription) {
        const startingNode = this.findNodeByMermaidId(startingMermaidId);
        const finishingNode = this.findNodeByMermaidId(finishingMermaidId);

        if (!startingNode || !finishingNode) {
            return;
        }

        // startingNode.connect(finishingNode, connectionDescription);
        this.reconnectNodes(startingNode, finishingNode, shouldReattachConnected, connectionDescription);
    }

    editNode(node) {
        const editPromptInfo = node.getEditInfo();
        const newContent = prompt(editPromptInfo.title, editPromptInfo.content);
        if (newContent !== null) {
            node.update(newContent);
        }
    }

    findNodeByMermaidId(mermaidId) {
        const pattern = /^flowchart-(\w+)-/gm;
        const matches = pattern.exec(mermaidId);
        const nodeId = matches[1];
        return this.nodes.find(n => n.id == nodeId);
    }

    serializeJson() {
        return JSON.stringify(this);
    }

    serializeBase64() {
        return btoa(unescape(encodeURIComponent(JSON.stringify(this))));
    }

    deserializeBase64(content) {
        this.deserializeJson(decodeURIComponent(escape(atob(content))));
    }


    deserializeJson(jsonString) {
        Object.assign(this, JSON.parse(jsonString));

        this.nodes = this.nodes.map(n => {
            const nodeInstance = NodeFactory.makeNode(n.type);
            Object.assign(nodeInstance, n);

            return nodeInstance;
        });

        const thisFlowchart = this;
        this.nodes = this.nodes.map(n => {
            n.connections = n.connections.map(c => {
                let connectionInstance = new Connection();
                Object.assign(connectionInstance, c);

                connectionInstance.target = thisFlowchart.nodes.find(x => x.id == c.target);

                return connectionInstance;
            });

            return n;
        });


        console.log(this);
    }

    static getNodeType() {
        const availableTypes = Object.keys(Node.typeSigns);
        const availableTypesText = availableTypes.reduce((accumulator, curr, index) =>
            `${accumulator}\n${index}: ${curr}`, '');
        const answer = prompt(`Node type (default: operation)\n${availableTypesText}`, '2');
        if (answer == null) {
            return null;
        }

        let nodeTypeIndex = parseInt(answer);
        let nodeType = 'operation';
        if (nodeTypeIndex != NaN && nodeTypeIndex >= 0 && nodeTypeIndex < availableTypes.length) {
            nodeType = availableTypes[nodeTypeIndex];
        }

        return nodeType;
    }

    static getNodeDescription() {
        return prompt('Node description (default: Node)', 'Node');
    }

    static getConnectionDescription() {
        return prompt('Connection description (press Enter to leave empty)');
    }
}

