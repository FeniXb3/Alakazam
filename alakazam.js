export class Flowchart {
    constructor() {
        this.nodes = [];
    }

    addNode(description, type) {
        let newNode;
        switch(type) {
            case 'input':
                newNode = new InputNode(description, type);
                break;
            case 'output':
                newNode = new OutputNode(description, type);
                break;
            case 'decision':
                newNode = new DecisionNode(description, type);
                break;
            default:
                newNode = new Node(description, type);
        }
        
        this.nodes.push(newNode);

        return newNode;
    }
    
    prepare() {
        this.nodes = [];
        const firstNode = this.addNode("Start", "start");
        const lastNode = this.addNode("Stop", "stop");

        const nameQueryNode = this.addNode("What's your name?", "output");
        const nameGettingNode = this.addNode("name", "input");
        const nameDisplayingNode = this.addNode("Ahoy, %name%!", "output");
        const championDisplayinNode = this.addNode("You are the champion!", "output");
        const decisionNode = this.addNode("%name% == Champion || %name% == champion OR %name% == CHAMPION", "decision");
        
        firstNode.connect(nameQueryNode);
        nameQueryNode.connect(nameGettingNode);
        nameGettingNode.connect(decisionNode);
        decisionNode.connect(championDisplayinNode, 'Yes');
        decisionNode.connect(nameDisplayingNode, 'No');
        championDisplayinNode.connect(lastNode);
        nameDisplayingNode.connect(lastNode);
    }

    reset() {
        this.nodes = [];
        this.addNode("Start", "start");
    }


    alakazam() {
        const startingNodes = this.nodes.filter(n => n.type == 'start');

        startingNodes.forEach(n => {
            const state = {};
            n.perform(state);
        });
    }

    generateCode() {
        
        // const code =  `graph TD
        // ${this.entryNode.getConnectionText()}`;

        const code = this.nodes.map(n => n.getConnectionText())
            .reduce((acc, curr) => `${acc}\n${curr}`, 'graph TD');

        this.nodes.forEach(n => n.dirty = false);

        return code;
    }

    addNodeTo(mermaidNodeId, shouldReattachConnected, nodeDescription, nodeType, connectionDescription) {
        const currentNode = this.findNodeByMermaidId(mermaidNodeId);
        
        if (!currentNode) {
            return;
        }

        const newNode = this.addNode(nodeDescription, nodeType);

        const currentConnection = currentNode.connections.find(c => c.description == connectionDescription);

        if (currentConnection) {
            newNode.connect(currentConnection.target);
            currentConnection.target = newNode;
        }
        else {
            currentNode.connect(newNode, connectionDescription);
        }
       // this.reconnectNodes(currentNode, newNode, shouldReattachConnected, connectionDescription);
    }

    addAlternateNode(startingMermaidId,nodeDescription, nodeType, connectionDescription) {
        const currentNode = this.findNodeByMermaidId(startingMermaidId);
        
        if (!currentNode) {
            return;
        }

        const newNode = this.addNode(nodeDescription, nodeType);
        currentNode.connect(newNode, connectionDescription)
    }
    
    connectAlternateNode(startingMermaidId, finishingMermaidId, connectionDescription) {
        const startingNode = this.findNodeByMermaidId(startingMermaidId);
        const finishingNode = this.findNodeByMermaidId(finishingMermaidId);

        if (!startingNode || !finishingNode) {
            return;
        }

        startingNode.connections = startingNode.connections.filter(c => c.description != connectionDescription);
        startingNode.connect(finishingNode, connectionDescription)
    }

    reconnectNodes(currentNode, newNode, shouldReattachConnected, connectionDescription) {
        if (shouldReattachConnected) {
            currentNode.connections.forEach(c => {
                if (c.target != currentNode && c.target != newNode) {
                    newNode.connect(c.target, c.description);
                }
            });

        }
        currentNode.connections = [];

        currentNode.connect(newNode, connectionDescription)
    }

    removeNode(node) {
        this.nodes.forEach(n => {
            n.connections = n.connections.filter(c => c.target != node);
        });

        this.nodes = this.nodes.filter(n => n != node);
    }

    removeConnection(startingNode, finishingNode) {
        startingNode.connections = startingNode.connections.filter(c => c.target != finishingNode);
    }

    connectNodes(startingMermaidId, finishingMermaidId, shouldReattachConnected, connectionDescription) {
        const startingNode = this.findNodeByMermaidId(startingMermaidId);
        const finishingNode = this.findNodeByMermaidId(finishingMermaidId);

        if (!startingNode || !finishingNode) {
            return;
        }

        // startingNode.connect(finishingNode, connectionDescription);
        this.reconnectNodes(startingNode, finishingNode, shouldReattachConnected, connectionDescription);
    }

    findNodeByMermaidId(mermaidId) {
        const pattern = /^flowchart-(\w+)-/gm;
        const matches = pattern.exec(mermaidId);
        const nodeId = matches[1];
        return this.nodes.find(n => n.id == nodeId);
    }

    serialize() {
        return JSON.stringify(this);
    }

    deserialize(jsonString) {
        Object.assign(this, JSON.parse(jsonString));

        this.nodes = this.nodes.map(n => {
            let nodeInstance;
            switch(n.type) {
                case "input":
                    nodeInstance = new InputNode()
                    break;
                case "output":
                    nodeInstance = new OutputNode()
                    break;
                case "decision":
                    nodeInstance = new DecisionNode()
                    break;
                default:
                    nodeInstance = new Node();
            }
            Object.assign(nodeInstance, n);

            return nodeInstance;
        });

        const thisFlowchart = this;
        this.nodes = this.nodes.map(n => {
            n.connections = n.connections.map(c => {
                let connectionInstance = new Connection();
                Object.assign(connectionInstance, c);

                connectionInstance.target = thisFlowchart.nodes.find(x => x.id == c.target);

                return connectionInstance;
            });

            return n;
        });


        console.log(this);
    }

    static getNodeType() {
        const availableTypes = Object.keys(Node.typeSigns);
        const availableTypesText = availableTypes.reduce((accumulator, curr, index) => 
            `${accumulator}\n${index}: ${curr}`, '');
        const answer = prompt(`Node type (default: operation)\n${availableTypesText}`, '2');
        if (answer == null) {
            return null;
        }

        let nodeTypeIndex = parseInt(answer);
        let nodeType = 'operation';
        if(nodeTypeIndex != NaN && nodeTypeIndex >= 0 && nodeTypeIndex < availableTypes.length) {
            nodeType = availableTypes[nodeTypeIndex];
        }

        return nodeType;
    }

    static getNodeDescription() {
        return prompt('Node description (default: Node)', 'Node');
    }

    static getConnectionDescription() {
        return  prompt('Connection description (press Enter to leave empty)');
    }
}

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
        "operation":{
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
            opening: "{",
            closing: "}"
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
        this.connections.push(new Connection(node, description));
    }

    disconnect(node) {
        this.connections = this.connections.filter(c => c.target != node);
    }

    getNodeText() {
        const brackets = Node.typeSigns[this.type]
        return `${this.id}${brackets.opening}"${this.description}"${brackets.closing}`;
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

    perform(state, nextConnection) {
        console.log(`Performing action of ${this.type} node ${this.id}(${this.description})\nCurrent state:`);
        console.log(state);

        this.connections.forEach(c => {
            if (!nextConnection || c.description == nextConnection) {
                c.target.perform(state);
            }
        });
    }
}

class OutputNode extends Node {
    perform(state, nextConnection) {
        const pattern = /(?:%(\w+)%)/gm;
        let parsedText = this.description;
        let match;
        do {
            match = pattern.exec(this.description);
            if (match) {
                parsedText = parsedText.replace(match[0], state[match[1]]);
            }
        } while(match);
        
        alert(parsedText);
        super.perform(state, nextConnection);
    }
}

class InputNode extends Node {
    constructor(variableName, type) {
        const description = `Read ${variableName}`;
        super(description, type);

        this.variableName = variableName;
    }
    
    perform(state, nextConnection) {
        const value = prompt(this.description);
        //TODO: handle stopping the run if user cancelled
        state[this.variableName] = value;
        super.perform(state, nextConnection);
    }
}

class DecisionNode extends Node {
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
            logicalOperatorMatch =  logicalOperatorPattern.exec(this.condition);
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
                const rightSidePattern =/(?:%([a-zA-Z0-9_żźćńółęąśŻŹĆĄŚĘŁÓŃ]+)%|([ a-zA-Z0-9_zżźćńółęąśŻŹĆĄŚĘŁÓŃ]+))/gm;
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

class Connection {
    constructor (target, description) {
        this.target = target;
        this.description = description;
    }

    getConnectionText() {
        return `${this.getArrowText()} ${this.target.getNodeText()}\n${this.target.getConnectionText()}`;
    }

    getArrowText() {
        return this.description
            ? `-->|${this.description}|`
            : `-->`;
    }

    toJSON() {
        return {
            "description": this.description,
            "target": this.target.id
        }
    }
}