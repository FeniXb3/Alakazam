import { Node } from "./Node.js";

export class DecisionNode extends Node {
    constructor(condition, type) {
        const description = `Is ${condition} ?`;
        super(description, type);

        this.condition = condition;
    }

    static operatorFunctions = {
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
        const logicalOperatorPattern = /(?:\s(OR|\|\||AND|&&)\s)/gm
        const logicalOperators = [];

        let logicalOperatorMatch;
        do {
            logicalOperatorMatch = logicalOperatorPattern.exec(this.condition);
            if (logicalOperatorMatch) {
                logicalOperators.push(logicalOperatorMatch[0].trim());
            }
        } while (logicalOperatorMatch);

        const logicalOperands = this.condition.split(logicalOperatorPattern).map(o => o.trim());
        let result = null;
        console.log(logicalOperands);

        let currentLogicalOperator = null;
        logicalOperands.forEach((lo, index) => {
            if (index % 2) {
                currentLogicalOperator = lo;
            }
            else {
                const operatorPattern = /(?:==|!=|>|<|>=|<=)/gm;
                const leftSidePattern = /(?:%([a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)%|([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+))/gm;
                const rightSidePattern = /(?:%([a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)%|([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+))/gm;
                console.log(lo);
                const operator = operatorPattern.exec(lo)[0];
                const sides = lo.split(operator).map(s => s.trim());
                console.log(sides);
                const leftSideMatch = leftSidePattern.exec(sides[0]);

                const rightSideMatch = rightSidePattern.exec(sides[1]);

                const leftSide = leftSideMatch[2] || state[leftSideMatch[1]];
                const rightSide = rightSideMatch[2] || state[rightSideMatch[1]];

                const localResult = DecisionNode.operatorFunctions[operator](leftSide, rightSide);
                result = result == null ? localResult
                    : DecisionNode.logicalOperatorFunctions[currentLogicalOperator](result, localResult);
            }
        });


        if (result) {
            super.perform(state, 'Yes');
        }
        else {
            super.perform(state, 'No');
        }
        // let parsedText = this.description;
        // let match;
        // do {
        //     match = pattern.exec(this.description);
        //     if (match) {
        //         parsedText = parsedText.replace(match[0], state[match[1]]);
        //     }
        // } while(match);

        // alert(parsedText);
    }
}