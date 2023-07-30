import { Node } from "./Node.js";
import { modal } from "./ModalHandler.js";
import { Alakazam } from "./Alakazam.js";

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
        executionInput.parentElement.classList.remove('hidden');
        executionInput.parentElement.removeAttribute("hidden");
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
        executionInput.parentElement.classList.add('hidden');
        executionInput.parentElement.setAttribute("hidden", "");
        
        Alakazam.appendExecutionLog(`> ${value}`);

        let nextConnection = this.tmpNextConnection;
        let state = this.tmpState;
        state[this.variableName] = value;
        console.log('go to next');
        super.perform(this.tmpState, nextConnection);
        this.tmpState = undefined;
        this.tmpNextConnection = undefined;
        // document.body.focus();
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
