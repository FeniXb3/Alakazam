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

        let currentLogicalOperator = null;
        let lo = assignmentOperands[2];
        // assignmentOperands.forEach((lo, index) => {
            // if (index % 2) {
            //     currentLogicalOperator = lo;
            // }
            // else {
                const operatorPattern = /(?:\s(\+|-|\*|\/|)\s)/gm;
                const leftSidePattern = /(?:"([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+)"|([a-zA-Z_żźćńółęąśŻŹĆĄŚĘŁÓŃ][a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)|(-?[\d]+\.?[\d]+)|(-?[\d]+))/gm;
                const rightSidePattern = /(?:"([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+)"|([a-zA-Z_żźćńółęąśŻŹĆĄŚĘŁÓŃ][a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)|(-?[\d]+\.?[\d]+)|(-?[\d]+))/gm;
                const intPattern = /^(-?[\d]+)$/gm;
                const floatPattern = /^(-?[\d]+\.?[\d]+)$/gm;
                
                console.log(lo);
                const operator = operatorPattern.exec(lo)[1];//.trim();
                console.log('operator ', operator);
                const sides = lo.split(operator).map(s => s.trim());
                console.log(sides);
                const leftSideMatch = leftSidePattern.exec(sides[0]);
                console.log('leftSideMatch ', leftSideMatch);

                const rightSideMatch = rightSidePattern.exec(sides[1]);
                console.log('rightSideMatch ', rightSideMatch);

                let leftSide = leftSideMatch[1] || state[leftSideMatch[2]] || parseFloat(leftSideMatch[3]) ||  parseInt(leftSideMatch[4], 10) ;
                intPattern.lastIndex = 0;
                floatPattern.lastIndex = 0;
                if (intPattern.test(leftSide)) {
                    leftSide = parseInt(leftSide, 10);
                }
                else if (floatPattern.test(leftSide)) {
                    leftSide = parseFloat(leftSide);
                }

                intPattern.lastIndex = 0;
                floatPattern.lastIndex = 0;
                let rightSide = rightSideMatch[1] || state[rightSideMatch[2]] || parseFloat(rightSideMatch[3]) ||  parseInt(rightSideMatch[4], 10);
                if (intPattern.test(rightSide)) {
                    rightSide = parseInt(rightSide, 10);
                }
                else if (floatPattern.test(rightSide)) {
                    rightSide = parseFloat(rightSide);
                }

                console.log(`Left side: ${leftSide} | Right side: ${rightSide}`);
                const localResult = OperationNode.operatorFunctions[operator](leftSide, rightSide);
                result = localResult; 
                console.log(result);
                //result == null ? localResult
                    // : OperationNode.logicalOperatorFunctions[currentLogicalOperator](result, localResult);
        //     }
        // });
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
        this.description = DecisionNode.getDescription(this.expression)
    }
    
    static getDescription(expression) {
        return `<pre>${Node.getHighlightTagOpening()}${expression}${Node.getHighlightTagClosing()}</pre>`;
    }
}