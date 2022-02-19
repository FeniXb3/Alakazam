export class UIHelper {
       
    static addButtonContainer(element, innerContent) {
        innerContent = innerContent || '';
        const container = `
        <svg x="-50%" y="-50%">
        <g class="flowchart-ui" transform="translate(0,0)"><g><foreignObject width="100%" height="100%">
        <div class="flowchart-ui-inner-container" xmlns="http://www.w3.org/1999/xhtml">
        ${innerContent}
        </div></foreignObject></g></g>
        </svg>
        `;
        element.innerHTML += container;
    }

    static getButtonHtml(icon, className) {
        return `
        <span class="fa-stack ${className}" style="vertical-align: top;">
            <i class="fa-solid fa-circle fa-stack-2x icon-background"></i>
            <i class="fa-solid fa-${icon} fa-xs fa-stack-1x fa-inverse"></i>
        </span>
        `;
    }
    static addButtonWithIcon(element, icon, className) {
        const buttonHtml = `
        <span class="fa-stack ${className}" style="vertical-align: top;">
            <i class="fa-solid fa-circle fa-stack-2x icon-background"></i>
            <i class="fa-solid fa-${icon} fa-xs fa-stack-1x fa-inverse"></i>
        </span>
        `;
        element.innerHTML += buttonHtml;
    }

    static addPlusButton(element) {
        UIHelper.addButtonContainer(element, UIHelper.getButtonHtml('plus', 'add-node'));
        // UIHelper.addButtonWithIcon(element, 'plus', 'add-node');
    }

    static addAlternatePlusButton(element) {
        UIHelper.addButtonContainer(element, UIHelper.getButtonHtml('plus', 'add-alternate-node'));
        // UIHelper.addButtonWithIcon(element, 'plus', 'add-alternate-node');
    }

    static addLinkButton(element) {
        UIHelper.addButtonContainer(element, UIHelper.getButtonHtml('link', 'link-node'));
        // UIHelper.addButtonWithIcon(element, 'link', 'link-node');
    }
    
    static addAlternateLinkButton(element) {
        UIHelper.addButtonContainer(element, UIHelper.getButtonHtml('link', 'link-alternate-node'));
        // UIHelper.addButtonWithIcon(element, 'link', 'link-alternate-node');
    }

    
    static addRemoveNodeButton(element) {
        
        UIHelper.addButtonContainer(element, UIHelper.getButtonHtml('trash', 'remove-node'));
        // UIHelper.addButtonWithIcon(element, 'trash', 'remove-node');
    }

    
}