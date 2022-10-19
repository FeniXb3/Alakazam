import { Node } from "./Node.js";

export class DecisionNode extends Node {
    constructor(condition, type) {
        const description = DecisionNode.getDescription(condition)
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

    getPartialResult(state, currentCondition) {
        let result = null;

        let lastOpeningParenthesisIndex = -1;
        
        do {
            lastOpeningParenthesisIndex = currentCondition.lastIndexOf("(");
            if (lastOpeningParenthesisIndex > -1) {
                const matchingClosingPaarenthesisIndex = lastOpeningParenthesisIndex + currentCondition.substring(lastOpeningParenthesisIndex).indexOf(")");
                const lastParenthesesContent = currentCondition.substring(lastOpeningParenthesisIndex + 1, matchingClosingPaarenthesisIndex);
                console.log("Content:", lastParenthesesContent);

                const boolValue = this.getPartialResult(state, lastParenthesesContent);

                currentCondition = currentCondition.replace(`(${lastParenthesesContent})`, boolValue);
                console.log("condition: ", currentCondition);
            }
        } while (lastOpeningParenthesisIndex > 0);

        const logicalOperatorPattern = /(?:\s(OR|\|\||AND|&&)\s)/gm
        const logicalOperators = [];

        let logicalOperatorMatch;
        do {
            logicalOperatorMatch = logicalOperatorPattern.exec(currentCondition);
            if (logicalOperatorMatch) {
                logicalOperators.push(logicalOperatorMatch[0].trim());
            }
        } while (logicalOperatorMatch);

        const logicalOperands = currentCondition.split(logicalOperatorPattern).map(o => o.trim());
        console.log(logicalOperands);

        let currentLogicalOperator = null;
        logicalOperands.forEach((lo, index) => {
            if (index % 2) {
                currentLogicalOperator = lo;
            }
            else {
                let localResult = null;
                if (lo === 'true') {
                    localResult = true
                }
                else if (lo === 'false') {
                    localResult = false;
                }
                else {
                    const operatorPattern = /(?:==|!=|>|<|>=|<=)/gm;
                    const leftSidePattern = /(?:"([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+)"|([a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+))/gm;
                    const rightSidePattern = /(?:"([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+)"|([a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+))/gm;
                
                    const operator = operatorPattern.exec(lo)[0];
                    const sides = lo.split(operator).map(s => s.trim());
                    const leftSideMatch = leftSidePattern.exec(sides[0]);
                    const rightSideMatch = rightSidePattern.exec(sides[1]);

                    const leftSide = leftSideMatch[1] || state[leftSideMatch[2]];
                    const rightSide = rightSideMatch[1] || state[rightSideMatch[2]];
                    console.log('Left side: ', leftSide, " | Right side: ", rightSide);

                    localResult = DecisionNode.operatorFunctions[operator](leftSide, rightSide);
                }

                result = result == null ? localResult
                    : DecisionNode.logicalOperatorFunctions[currentLogicalOperator](result, localResult);
            }
        });

        return result;
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

    static getDescription(condition) {
        return "<pre><code class='language-csharp'>" 
            + (condition || '').replaceAll(') OR (', ") </code><br/><code class='language-csharp'> OR (")
            .replaceAll(') || (', ") </code><br/><code class='language-csharp'> || (")
            .replaceAll(') AND (', ") </code><br/><code class='language-csharp'> AND (")
            .replaceAll(') && (', ") </code><br/><code class='language-csharp'> && (")
            + "</code></pre>";
    }
}