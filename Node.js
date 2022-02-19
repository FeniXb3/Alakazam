import { Connection } from './Connection.js';

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
        "operation": {
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
        this.id = `node${Date.now()}_${Node.ids.length}`;
        Node.ids.push(this.id);
    }

    connect(node, description) {
        description = description || "";
        this.connections.push(new Connection(node, description));
    }

    disconnect(node) {
        this.connections = this.connections.filter(c => c.target != node);
    }

    getNodeText() {
        const brackets = Node.typeSigns[this.type]
        return `${this.id}${brackets.opening}"${this.description}"${brackets.closing}`;
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
            : this.getNodeText();
        return result
    }

    perform(state, nextConnection) {
        console.log(`Performing action of ${this.type} node ${this.id}(${this.description})\nCurrent state:`);
        console.log(state);

        this.connections.forEach(c => {
            if (!nextConnection || c.description == nextConnection) {
                c.target.perform(state);
            }
        });
    }
}
