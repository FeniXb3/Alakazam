import { Node } from "./Node.js";

export class InputNode extends Node {
    constructor(variableName, type) {
        const description = `Read ${variableName}`;
        super(description, type);

        this.variableName = variableName;
    }

    perform(state, nextConnection) {
        const value = prompt(this.description);
        //TODO: handle stopping the run if user cancelled
        state[this.variableName] = value;
        super.perform(state, nextConnection);
    }

    getEditInfo() {
        return {
            title: 'Update variable name',
            content: this.variableName
        }
    }

    update(variableName) {
        this.variableName = variableName;
        this.description = `Read ${this.variableName}`;
    }
}
