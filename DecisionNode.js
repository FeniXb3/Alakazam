import { Node } from "./Node.js";

export class DecisionNode extends Node {
    constructor(condition, type) {
        const description = DecisionNode.getDescription(condition)
        super(description, type);

        this.condition = condition;
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
                    const operatorPattern = /(?:\s(\+|-|\*|\/|==|!=|>|<|>=|<=)\s)/gm;
                    const leftSidePattern = /(?:"([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+)"|([a-zA-Z_żźćńółęąśŻŹĆĄŚĘŁÓŃ][a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)|(-?[\d]+\.?[\d]+)|(-?[\d]+))/gm;
                    const rightSidePattern = /(?:"([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+)"|([a-zA-Z_żźćńółęąśŻŹĆĄŚĘŁÓŃ][a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)|(-?[\d]+\.?[\d]+)|(-?[\d]+))/gm;
                    const intPattern = /^(-?[\d]+)$/gm;
                    const floatPattern = /^(-?[\d]+\.?[\d]+)$/gm;
                    let sides = [];
                    console.log(lo);
                    
                    const operatorExecResult = operatorPattern.exec(lo);
                    let operator;
                    if (operatorExecResult == null) {
                        console.log('Handling no operator');
                        sides.push(lo);
                    }
                    else {
                        operator = operatorExecResult[1];//.trim();
                        console.log('operator ', operator);
                        sides = lo.split(operator).map(s => s.trim());
                    }
                    console.log(sides);
                    const leftSideMatch = leftSidePattern.exec(sides[0]);
                    console.log('leftSideMatch ', leftSideMatch);

                    
                    let leftSide = leftSideMatch[1] || state[leftSideMatch[2]] || parseFloat(leftSideMatch[3]) ||  parseInt(leftSideMatch[4], 10) ;
                    intPattern.lastIndex = 0;
                    floatPattern.lastIndex = 0;
                    if (intPattern.test(leftSide)) {
                        leftSide = parseInt(leftSide, 10);
                    }
                    else if (floatPattern.test(leftSide)) {
                        leftSide = parseFloat(leftSide);
                    }
                    // let localResult;
                    if (sides.length > 1) {
                        const rightSideMatch = rightSidePattern.exec(sides[1]);
                        console.log('rightSideMatch ', rightSideMatch);
                        
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
                        localResult = DecisionNode.operatorFunctions[operator](leftSide, rightSide);
                    }
                    else {
                        console.log(`Left side: ${leftSide} | Right side: NOTHING`);
                        localResult = leftSide;
                    }
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

    refreshDescription() {
        this.description = DecisionNode.getDescription(this.condition)
    }

    static getDescription(condition) {
        return `<pre>${Node.getHighlightTagOpening()}` 
            + (condition || '').replaceAll(') OR (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} OR (`)
            .replaceAll(') || (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} || (`)
            .replaceAll(') AND (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} AND (`)
            .replaceAll(') && (', `) ${Node.getHighlightTagClosing()}\n${Node.getHighlightTagOpening()} && (`)
            + `${Node.getHighlightTagClosing()}</pre>`;
    }
}