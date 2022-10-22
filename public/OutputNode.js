import { Node } from "./Node.js";
import { modal, outputModal } from "./ModalHandler.js";

export class OutputNode extends Node {
    perform(state, nextConnection) {
        const pattern = /(?:\${(\w+)})/gm;
        let parsedText = this.description;
        let match;
        do {
            match = pattern.exec(this.description);
            if (match) {
                parsedText = parsedText.replace(match[0], state[match[1]]);
            }
        } while (match);

        // outputModal.show('Output', {}, parsedText, () => {
        //     super.perform(state, nextConnection);
        // });

        const executionLog = document.querySelector('#execution-panel .content');
        const section = document.createElement('section')
        section.innerHTML = parsedText;
        executionLog.appendChild(section);
        super.perform(state, nextConnection);

        // alert(parsedText);
        // super.perform(state, nextConnection);
    }
}
