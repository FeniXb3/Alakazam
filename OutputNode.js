import { Node } from "./Node.js";
import { modal, outputModal } from "./ModalHandler.js";
import { Alakazam } from "./Alakazam.js";

export class OutputNode extends Node {
    constructor(expression, type) {
        const description =  OutputNode.getDescription(expression);
        super(description, type);

        this.expression = expression;
    }

    perform(state, nextConnection) {
        const operationPattern = /(?:{([^{}]+)})/gm;
        let parsedText = this.expression;
        if (parsedText.startsWith('$')) {
            parsedText = parsedText.substring(1);
            let match;
            do {
                match = operationPattern.exec(parsedText);
                if (match) {
                    console.log('Parsing ' + match[0]);
                    parsedText = parsedText.replace(match[0], this.getPartialResult(state, match[1]));
                }
            } while (match);
        }

        // outputModal.show('Output', {}, parsedText, () => {
        //     super.perform(state, nextConnection);
        // });

        Alakazam.appendExecutionLog(parsedText);
        super.perform(state, nextConnection);

        // alert(parsedText);
        // super.perform(state, nextConnection);
    }

    getEditInfo() {
        return {
            title: 'Update node\'s expression',
            content: this.expression
        }
    }

    update(expression) {
        this.expression = expression;
        this.description = OutputNode.getDescription(expression);
    }
    refreshDescription() {
        this.description = OutputNode.getDescription(this.expression)
    }

    static getDescription(expression) {
        return `<pre>${Node.getHighlightTagOpening()}${expression}${Node.getHighlightTagClosing()}</pre>`;
    }
}
