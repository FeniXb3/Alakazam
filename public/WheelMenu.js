export class WheelMenu {
    constructor(containerId, flowchart, config, titles) {
        this.flowchart = flowchart;
        this.containerDiv = document.getElementById(containerId);

        const wheel = new wheelnav(containerId);
        wheel.slicePathFunction = config.slicePathFunction;
        wheel.spreaderEnable = config.spreaderEnable;
        wheel.clickModeSpreadOff = config.clickModeSpreadOff;
        wheel.spreaderInTitle = config.spreaderInTitle;
        wheel.spreaderOutTitle = config.spreaderOutTitle;
        wheel.navAngle = config.navAngle;
        wheel.navItemsContinuous = config.navItemsContinuous;
        wheel.sliceAngle = config.sliceAngle;
        wheel.wheelRadius = config.wheelRadius;
        wheel.maxPercent = 1;
        wheel.clickModeRotate = false;
        
        wheel.animatetime = 300;
        wheel.animateeffect = 'linear';
        wheel.selectedNavItemIndex = null;
        wheel.createWheel(titles, true);
        
        
        wheel.spreadWheel();

        this.menu = wheel;
    }

    spread = () => {
        this.menu.spreadWheel();
    }

    moveTo = (x, y) => {
        this.containerDiv.style.left = `${x - this.containerDiv.clientWidth/2}px`;
        this.containerDiv.style.top = `${y - this.containerDiv.clientHeight/2}px`;
    }

    show = (x, y, targetNode) => {
        this.hide();

        this.containerDiv.style.display = 'block';
        this.containerDiv.style.position = 'absolute';
        this.moveTo(x, y);

        this.containerDiv.classList.remove('hidden');
        this.containerDiv.classList.add('visible');
        if (this.isCollapsed()) {
            this.menu.spreadWheel();
        }

        this.prepareMenuItems(targetNode);
    }

    prepareMenuItems = (targetNode) => {
        this.target = targetNode;
        const targetFlowchartNode = this.flowchart.findNodeByMermaidId(this.target.id);
        
        this.menu.navItems.forEach((item, index ) => {
            console.log(item);
            const itemElement = this.containerDiv.querySelector(`#wheelnav-${this.containerDiv.id}-slice-${index}`);
            
            if (this.getDisableRules(item, targetFlowchartNode)) {
                itemElement.classList.add('disabled');
            }
        });
    }

    getDisableRules(item, flowchartNode) {
        switch(item.title) {
            case icon.plus:
                return flowchartNode.type == 'stop';
            case icon.trash:
                return this.flowchart.nodes.indexOf(flowchartNode) == 0;
            case icon.connect:
                return this.flowchart.nodes.length == 1 || flowchartNode.type == 'stop';
            case icon.disconnect:
                return flowchartNode.connections.length == 0;
            case icon.edit:
                return this.flowchart.nodes.indexOf(flowchartNode) == 0;
            default:
                return false;
        }
    }

    isCollapsed = () => {
        return this.menu.currentPercent == this.menu.minPercent;
    }

    hide = () => {
        let hideTimeout = 0;
        if (!this.isCollapsed()) {
            // hideTimeout = 100;
            this.menu.spreadWheel();
        }
        
        this.containerDiv.classList.remove('visible');
        this.containerDiv.classList.add('hidden');
        
        // setTimeout(() => {
            // this.containerDiv.style.display = 'none';
            this.menu.selectedNavItemIndex = null;
        // }, hideTimeout);

        this.menu.navItems.forEach((item, index ) => {
            // item.navSlice.node.classList.remove('disabled');
            
            const itemElement = this.containerDiv.querySelector(`#wheelnav-${this.containerDiv.id}-slice-${index}`);
            itemElement.classList.remove('disabled');
        });
    }

    setupHandler = (title, handler) => {
        const navItem = this.menu.navItems.find(i => i.title == title);
        navItem.navigateFunction = () => {
            console.log(navItem);
            console.log(navItem.navSlice.node.classList);
            if (!navItem.navSlice.node.classList.contains('disabled')) {
                handler();
            }
            this.hide();
        };
    }
}
