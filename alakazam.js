export class Flowchart {
    constructor() {
        this.entryNode = null;
        this.nodes = [];
    }

    addNode(description) {
        const newNode = new Node(description);
        this.nodes.push(newNode);

        return newNode;
    }
    
    prepare() {
        const firstNode = this.addNode("First node");
        const secondNode = this.addNode("Second node");
        const thirdNode = this.addNode("Third node");
        const fourthNode = this.addNode("Fourth node");

        this.entryNode = firstNode;

        firstNode.connect(secondNode, "Description");
        firstNode.connect(thirdNode);
        secondNode.connect(thirdNode);
        thirdNode.connect(fourthNode);
        fourthNode.connect(firstNode);
    }

    generateCode() {
        const code =  `graph TD
        ${this.entryNode.getConnectionText()}`;

        this.nodes.forEach(n => n.dirty = false);

        return code;
    }

    addNodeTo(mermaidNodeId, shouldReattachConnected, nodeDescription, connectionDescription) {
        const currentNode = this.findNodeByMermaidId(mermaidNodeId);
        console.log(currentNode);
        if (!currentNode) {
            return;
        }

        const newNode = this.addNode(nodeDescription);

        if (shouldReattachConnected) {
            currentNode.connections.forEach(c => {
                newNode.connect(c.target, c.description);
            });

            currentNode.connections = [];
        }

        currentNode.connect(newNode, connectionDescription);
    }

    findNodeByMermaidId(mermaidId) {
        const pattern = /^flowchart-(\w+)-/gm;
        const matches = pattern.exec(mermaidId);
        console.log(matches);
        const nodeId = matches[1];
        console.log(nodeId);
        return this.nodes.find(n => n.id == nodeId);
    }
}

class Node {
    static ids = [];

    constructor(description) {
        this.dirty = false;
        this.connections = [];
        this.description = description;
        this.id = 'a' + Node.ids.length;
        Node.ids.push(this.id);
    }

    connect(node, description) {
        this.connections.push(new Connection(node, description));
    }

    disconnect(node) {
        this.connections = this.connections.filter(c => c.target != node);
    }

    getNodeText() {
        return `${this.id}[${this.description}]`;
    }

    getConnectionText() {
        if (this.dirty) {
            return '';
        }
        this.dirty = true;
        const result = this.connections.length > 0 
            ? this.connections.map(c => 
                `${this.getNodeText()} ${c.getConnectionText()}`)
                .reduce((previous, current) => `${previous} \n ${current}`)
            : '';
        return result
    }
}

class Connection {
    constructor (target, description) {
        this.target = target;
        this.description = description;
    }

    getConnectionText() {
        return `${this.getArrowText()} ${this.target.getNodeText()}\n${this.target.getConnectionText()}`;
    }

    getArrowText() {
        return this.description
            ? `-->|${this.description}|`
            : `-->`;
    }
}