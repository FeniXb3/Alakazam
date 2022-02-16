export class Flowchart {
    constructor() {
        this.entryNode = null;
    }
    
    prepare() {
        const firstNode = new Node("First node");
        const secondNode = new Node("Second node");
        const thirdNode = new Node("Third node");
        const fourthNode = new Node("Fourth node");

        this.entryNode = firstNode;

        firstNode.connect(secondNode);
        firstNode.connect(thirdNode);
        secondNode.connect(thirdNode);
        thirdNode.connect(fourthNode);
        fourthNode.connect(firstNode);
    }

    generateCode() {
        return `graph TD
        ${this.entryNode.getConnectionText()}`;
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
        return `-->  ${this.target.getNodeText()}\n${this.target.getConnectionText()}`;
    }
}