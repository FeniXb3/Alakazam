export class Flowchart {
    constructor() {
        this.entryNode = null;
        this.nodes = [];
    }

    addNode(description, type) {
        const newNode = new Node(description, type);
        this.nodes.push(newNode);

        return newNode;
    }
    
    prepare() {
        const firstNode = this.addNode("Start", "start");
        const lastNode = this.addNode("Stop", "stop");

        this.entryNode = firstNode;

        firstNode.connect(lastNode);
    }

    generateCode() {
        const code =  `graph TD
        ${this.entryNode.getConnectionText()}`;

        this.nodes.forEach(n => n.dirty = false);

        return code;
    }

    addNodeTo(mermaidNodeId, shouldReattachConnected, nodeDescription, nodeType, connectionDescription) {
        const currentNode = this.findNodeByMermaidId(mermaidNodeId);
        console.log(currentNode);
        if (!currentNode) {
            return;
        }

        const newNode = this.addNode(nodeDescription, nodeType);

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

export class Node {
    static ids = [];
    static typeSigns = {
        "start": {
            opening: "([",
            closing: "])"
        },
        "stop": {
            opening: "([",
            closing: "])"
        },
        "operation":{
            opening: "[",
            closing: "]"
        },
        "input": {
            opening: "[/",
            closing: "/]"
        },
        "output": {
            opening: "[\\",
            closing: "\\]"
        },
        "decision": {
            opening: "{",
            closing: "}"
        }
    };

    constructor(description, type) {
        this.dirty = false;
        this.type = type;
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
        const brackets = Node.typeSigns[this.type]
        return `${this.id}${brackets.opening}${this.description}${brackets.closing}`;
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