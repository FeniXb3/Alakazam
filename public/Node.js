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
            opening: "{{",
            closing: "}}"
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
        this.connections = this.connections.sort((a, b) => -a.description.localeCompare(b.description));
    }

    getEditInfo() {
        return {
            title: 'Update node\'s description',
            content: this.description
        }
    }

    update(description) {
        this.description = description;
    }

    disconnect(node) {
        this.connections = this.connections.filter(c => c.target != node);
    }

    getNodeText() {
        const brackets = Node.typeSigns[this.type]
        const escapedDescription = this.description.replaceAll('"', "#quot;");
        return `${this.id}${brackets.opening}"${escapedDescription}"${brackets.closing}`;
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
        this.markAsActive();
        console.log(`Performing action of ${this.type} node ${this.id}(${this.description})\nCurrent state:`);
        console.log(state);
        setTimeout(() => {
            this.markAsUsed();
            this.connections.forEach(c => {
                if (!nextConnection || c.description == nextConnection) {
                    c.target.perform(state);
                }
            });
        }, 500);
    }

    refreshDescription() {
        
    }

    markAsActive() {
        const nodeElement = document.querySelector(`[id*=flowchart-${this.id}]`);
        nodeElement.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        nodeElement.classList.add('active-node');
    }

    markAsUsed() {
        const nodeElement = document.querySelector(`[id*=flowchart-${this.id}]`);
        nodeElement.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        nodeElement.classList.remove('active-node');
        nodeElement.classList.add('used-node');
    }
    static highlightLanguage = "csharp";

    static getHighlightTagOpening() {
        return Node.highlightLanguage 
            ? `<code class='language-${Node.highlightLanguage}'>`
            : '';
    } 

    static getHighlightTagClosing() {
        return Node.highlightLanguage 
            ? `</code>`
            : '';
    } 
}
