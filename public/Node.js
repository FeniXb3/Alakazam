import { Connection } from './Connection.js';
import * as TWEEN from './libs/tween.esm.js';

export class Node {
    static ids = [];
    static typeSigns = {
        "start": {
            opening: "([",
            closing: "])"
        },
        "stop": {
            opening: "([",
            closing: "])"
        },
        "operation": {
            opening: "[",
            closing: "]"
        },
        "input": {
            opening: "[/",
            closing: "/]"
        },
        "output": {
            opening: "[\\",
            closing: "\\]"
        },
        "decision": {
            opening: "{{",
            closing: "}}"
        }
    };

    constructor(description, type) {
        this.dirty = false;
        this.type = type;
        this.connections = [];
        this.description = description;
        this.id = `node${Date.now()}_${Node.ids.length}`;
        Node.ids.push(this.id);
    }

    connect(node, description) {
        description = description || "";
        this.connections.push(new Connection(node, description));
        this.connections = this.connections.sort((a, b) => -a.description.localeCompare(b.description));

        return node;
    }

    getEditInfo() {
        return {
            title: 'Update node\'s description',
            content: this.description
        }
    }

    update(description) {
        this.description = description;
    }

    disconnect(node) {
        this.connections = this.connections.filter(c => c.target != node);
    }

    getNodeText() {
        const brackets = Node.typeSigns[this.type]
        const escapedDescription = this.description.replaceAll('"', "#quot;");
        return `${this.id}${brackets.opening}"${escapedDescription}"${brackets.closing}`;
    }

    getConnectionText() {
        if (this.dirty) {
            return '';
        }
        this.dirty = true;
        const result = this.connections.length > 0
            ? this.connections.map(c =>
                `${this.getNodeText()} ${c.getConnectionText()}`)
                .reduce((previous, current) => `${previous} \n ${current}`)
            : this.getNodeText();
        return result
    }

    init(current, target, state, nextConnection, callback) {
        const currentNodeElement = document.querySelector(`[id*=flowchart-${current.id}]`);

        const targetNodeElement = document.querySelector(`[id*=flowchart-${target.id}]`);
        const nodeWidth = targetNodeElement.getBoundingClientRect().width;
        const graphWidth = document.querySelector('#theGraph').getAttribute('width');
        const outputContainerWidth = document.querySelector("#output-container").clientWidth ;
        const desiredElementhWidth = outputContainerWidth * 0.9;

        const desiredGraphWidth = (desiredElementhWidth / nodeWidth) * graphWidth;
        // alert(`Nodw width: ${nodeWidth} Graph width: ${graphWidth}`);

        const currentNode = this; 
        var tween = new TWEEN.Tween({width: graphWidth, nodeElement: currentNodeElement})
        .to({width: desiredGraphWidth}, 500)
        .easing(TWEEN.Easing.Exponential.InOut)
        .onUpdate((tmp) => {
            console.log(tmp);
            document.querySelector("#theGraph").setAttribute("width", tmp.width);
            tmp.nodeElement.scrollIntoView({behavior: "instant", block: "center", inline: "center"});
        })
        .onComplete(() => {
            callback(state, nextConnection);
            // currentNode.markAsActive();
            // console.log(`Performing action of ${currentNode.type} node ${currentNode.id}(${currentNode.description})\nCurrent state:`);
            // console.log(state);
            // setTimeout(() => {
            //     currentNode.markAsUsed();
            //     currentNode.connections.forEach(c => {
            //         if (!nextConnection || c.description == nextConnection) {
            //             c.target.perform(state);
            //         }
            //     });
            // }, 500);
        })
        .start();
    }

    animate(time) {
        const currentNode = this; 

        requestAnimationFrame((value) => {currentNode.animate(value)});
        TWEEN.update(time);
    }

    perform(state, nextConnection) {
        this.markAsActive();
        console.log(`Performing action of ${this.type} node ${this.id}(${this.description})\nCurrent state:`);
        console.log(state);
        setTimeout(() => {
            this.markAsUsed();
            this.connections.forEach(c => {
                if (!nextConnection || c.description == nextConnection) {
                    this.init(this, c.target, state, nextConnection, (state, nextConnection) => {
                        c.target.perform(state);
                    });
                    this.animate();
                }
            });
        }, 500);
        // this.init(state, nextConnection);
        // this.animate();
    }

    refreshDescription() {
        
    }

    scrollTo() {
        const nodeElement = document.querySelector(`[id*=flowchart-${this.id}]`);
        nodeElement.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    }

    markAsActive() {
        const nodeElement = document.querySelector(`[id*=flowchart-${this.id}]`);
        nodeElement.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        nodeElement.classList.add('active-node');
    }

    markAsUsed() {
        const nodeElement = document.querySelector(`[id*=flowchart-${this.id}]`);
        nodeElement.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        nodeElement.classList.remove('active-node');
        nodeElement.classList.add('used-node');
    }
    static highlightLanguage = "csharp";

    static getHighlightTagOpening() {
        return Node.highlightLanguage 
            ? `<code class='language-${Node.highlightLanguage}'>`
            : '';
    } 

    static getHighlightTagClosing() {
        return Node.highlightLanguage 
            ? `</code>`
            : '';
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
                    const leftSidePattern = /(?:"([^"]+)"|([a-zA-Z_żźćńółęąśŻŹĆĄŚĘŁÓŃ][a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)|(-?[\d]+\.?[\d]+)|(-?[\d]+))/gm;
                    const rightSidePattern = /(?:"([^"]+)"|([a-zA-Z_żźćńółęąśŻŹĆĄŚĘŁÓŃ][a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)|(-?[\d]+\.?[\d]+)|(-?[\d]+))/gm;
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
                        localResult = Node.operatorFunctions[operator](leftSide, rightSide);
                    }
                    else {
                        console.log(`Left side: ${leftSide} | Right side: NOTHING`);
                        localResult = leftSide;
                    }
                }

                result = result == null ? localResult
                    : Node.logicalOperatorFunctions[currentLogicalOperator](result, localResult);
            }
        });

        return result;
    }
}
