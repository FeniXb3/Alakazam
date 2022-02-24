import { Node } from "./Node.js";

export class OperationNode extends Node {
    constructor(expression, type) {
        const description = expression;
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
                const leftSidePattern = /(?:%([a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)%|([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+))/gm;
                const rightSidePattern = /(?:%([a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)%|([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+))/gm;
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

                let leftSide = leftSideMatch[2] || state[leftSideMatch[1]];
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
                let rightSide = rightSideMatch[2] || state[rightSideMatch[1]];
                if (intPattern.test(rightSide)) {
                    rightSide = parseInt(rightSide, 10);
                }
                else if (floatPattern.test(rightSide)) {
                    rightSide = parseFloat(rightSide);
                }
                const localResult = OperationNode.operatorFunctions[operator](leftSide, rightSide);
                result = localResult; 
                console.log(result);
                //result == null ? localResult
                    // : OperationNode.logicalOperatorFunctions[currentLogicalOperator](result, localResult);
        //     }
        // });
        leftSidePattern.lastIndex = 0;
        const variableName = leftSidePattern.exec(assignmentOperands[0])[1];
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
        this.description = expression;
    }
}