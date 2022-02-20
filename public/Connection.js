export class Connection {
    constructor(target, description) {
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

    toJSON() {
        return {
            "description": this.description,
            "target": this.target.id
        }
    }
}