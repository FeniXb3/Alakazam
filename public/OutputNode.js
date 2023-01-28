import { Node } from "./Node.js";
import { modal, outputModal } from "./ModalHandler.js";
import { Alakazam } from "./Alakazam.js";

export class OutputNode extends Node {
    perform(state, nextConnection) {
        const pattern = /(?:\${([^${}]+)})/gm;
        let parsedText = this.description;
        let match;
        do {
            match = pattern.exec(this.description);
            if (match) {
                console.log('Parsing ' + match[0]);
                parsedText = parsedText.replace(match[0], this.getPartialResult(state, match[1]));
            }
        } while (match);

        // outputModal.show('Output', {}, parsedText, () => {
        //     super.perform(state, nextConnection);
        // });

        Alakazam.appendExecutionLog(parsedText);
        super.perform(state, nextConnection);

        // alert(parsedText);
        // super.perform(state, nextConnection);
    }
}
