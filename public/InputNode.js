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
        console.log(`#flowchart-${this.id}`);
        this.markAsActive();
        // modal.show('Input', {}, '', value => {
        //     state[this.variableName] = value;
        //     console.log('go to next');
        //     super.perform(state, nextConnection);
        // });

        const executionInput = document.querySelector('#execution-input');
        this.tmpState = state;
        this.tmpNextConnection = nextConnection;
        executionInput.addEventListener('keypress', this.enterListener)
        executionInput.disabled = false;
        executionInput.focus();
        
        //TODO: handle stopping the run if user cancelled
    }

    enterListener = (e) => {
        if (e.key != 'Enter') {
            return;
        } 

        const executionInput = document.querySelector('#execution-input');
        executionInput.removeEventListener('keypress', this.enterListener);
        const value = executionInput.value;
        executionInput.value = '';
        executionInput.disabled = true;
        
        const executionLog = document.querySelector('#execution-panel .content');
        const section = document.createElement('section')
        section.innerHTML = `> ${value}`;
        executionLog.appendChild(section);
        let nextConnection = this.tmpNextConnection;
        let state = this.tmpState;
        state[this.variableName] = value;
        console.log('go to next');
        super.perform(this.tmpState, nextConnection);
        this.tmpState = undefined;
        this.tmpNextConnection = undefined;
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
