import { Node } from "./Node.js";

export class OperationNode extends Node {
    constructor(expression, type) {
        const description =  OperationNode.getDescription(expression);
        super(description, type);

        this.expression = expression;
    }

    static operatorFunctions = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        '==': (a, b) => a === b,
        '!=': (a, b) => a !== b,
        '>': (a, b) => a > b,
        '<': (a, b) => a < b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
    }


    static logicalOperatorFunctions = {
        'OR': (a, b) => a || b,
        '||': (a, b) => a || b,
        'AND': (a, b) => a && b,
        '&&': (a, b) => a && b
    }

    perform(state, nextConnection) {
        const assignmentOperatorPattern = /(?:\s(=)\s)/gm
        const logicalOperators = [];

        let assignmentOperatorMatch;
        do {
            assignmentOperatorMatch = assignmentOperatorPattern.exec(this.expression);
            if (assignmentOperatorMatch) {
                logicalOperators.push(assignmentOperatorMatch[0].trim());
            }
        } while (assignmentOperatorMatch);

        const assignmentOperands = this.expression.split(assignmentOperatorPattern).map(o => o.trim());
        let result = null;
        console.log('assignmentOperands ', assignmentOperands);

        let lo = assignmentOperands[2];

        result = this.getPartialResult(state, lo);
        
        const leftSidePattern = /(?:"([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+)"|([a-zA-Z_żźćńółęąśŻŹĆĄŚĘŁÓŃ][a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)|(-?[\d]+\.?[\d]+)|(-?[\d]+))/gm;
        
        console.log(result);
        leftSidePattern.lastIndex = 0;
        const variableName = leftSidePattern.exec(assignmentOperands[0])[2];
        console.log('variable name ', variableName);
        state[variableName] = result;

        super.perform(state, nextConnection);
    }
    
    getEditInfo() {
        return {
            title: 'Update node\'s expression',
            content: this.expression
        }
    }

    update(expression) {
        this.expression = expression;
        this.description = OperationNode.getDescription(expression);
    }
    refreshDescription() {
        this.description = OperationNode.getDescription(this.expression)
    }
    
    static getDescription(expression) {
        return `<pre>${Node.getHighlightTagOpening()}${expression}${Node.getHighlightTagClosing()}</pre>`;
    }
}