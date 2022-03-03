import { Node } from "./Node.js";
import { modal } from "./ModalHandler.js";

export class InputNode extends Node {
    constructor(variableName, type) {
        const description = `Read ${variableName}`;
        super(description, type);

        this.variableName = variableName;
    }

    perform(state, nextConnection) {
        console.log(`[IN] Petfotming input node "${this.description}"`);
        modal.show('Input', {}, '', value => {
            state[this.variableName] = value;
            console.log('go to next');
            super.perform(state, nextConnection);
        });

        //TODO: handle stopping the run if user cancelled
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
