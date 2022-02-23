import { Node } from "./Node.js";

export class OutputNode extends Node {
    perform(state, nextConnection) {
        const pattern = /(?:%(\w+)%)/gm;
        let parsedText = this.description;
        let match;
        do {
            match = pattern.exec(this.description);
            if (match) {
                parsedText = parsedText.replace(match[0], state[match[1]]);
            }
        } while (match);

        alert(parsedText);
        super.perform(state, nextConnection);
    }
}
