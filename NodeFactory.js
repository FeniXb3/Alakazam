import { Node } from "./Node.js";
import { InputNode } from "./InputNode.js";
import { OutputNode } from "./OutputNode.js";
import { DecisionNode } from "./DecisionNode.js";
import { OperationNode } from "./OperationNode.js";

export class NodeFactory {
    static makeNode(type, description) {
        let newNode;
        switch (type) {
            case 'input':
                newNode = new InputNode(description, type);
                break;
            case 'output':
                newNode = new OutputNode(description, type);
                break;
            case 'decision':
                newNode = new DecisionNode(description, type);
                break;
            case 'operation':
                newNode = new OperationNode(description, type);
                break;
            default:
                newNode = new Node(description, type);
        }

        return newNode;
    }
}