import { Node } from "./Node.js";

export class DecisionNode extends Node {
    constructor(condition, type) {
        const description = DecisionNode.getDescription(condition)
        super(description, type);

        this.condition = condition;
    }

    perform(state, nextConnection) {
        const currentCondition = this.condition;
        const result = this.getPartialResult(state, currentCondition);

        console.log("Decision result: ", result);
        if (result) {
            super.perform(state, 'Yes');
        }
        else {
            super.perform(state, 'No');
        }
    }
    
    getEditInfo() {
        return {
            title: 'Update node\'s condition',
            content: this.condition
        }
    }

    update(condition) {
        this.condition = condition;
        this.description = DecisionNode.getDescription(condition);
    }

    refreshDescription() {
        this.description = DecisionNode.getDescription(this.condition)
    }

    static getDescription(condition) {
        let opening = Node.highlightLanguage ? '<pre>' : '';
        let closing = Node.highlightLanguage ? '</pre>' : '';
        return `${opening}${Node.getHighlightTagOpening()}` 
            + (condition || '').replaceAll(') OR (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} OR (`)
            .replaceAll(') || (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} || (`)
            .replaceAll(') AND (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} AND (`)
            .replaceAll(') && (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} && (`)
            + `${Node.getHighlightTagClosing()}${closing}`;
    }
}