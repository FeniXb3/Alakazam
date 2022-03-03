class ModalHandler {
    constructor(modalIdentifier, title, label, type) {
        this.container = document.getElementById('modals-container');
        
        this.id = modalIdentifier;
        this.titleText = title;
        this.labelText = label;
        if (!document.getElementById(`${this.id}-modal`)) {
            switch(type) {
                case 'input':
                    this.container.innerHTML += this.getInputHTML();
                    break;
                case 'output':
                    this.container.innerHTML += this.getOutputHTML();
                    break;
            }
        }

        this.type = type;
        this.modalTrigger = document.getElementById(`${this.id}-modal-trigger`);
        this.modal = document.getElementById(`${this.id}-modal`);
        this.saveButton = document.getElementById(`save-${this.id}`);
        this.input = this.modal.querySelector('.modal-body input');
        this.output = this.modal.querySelector('.modal-body p');
        this.title = this.modal.querySelector('.modal-title');
        const form = this.modal.querySelector('form');
        this.jqueryModal = $(`#${this.id}-modal`);
        
        this.jqueryModal.on('shown.bs.modal', () => {
            if (this.input) {
                this.input.focus();
            }
            else {
                this.saveButton.focus();
            }
            this.state = '';
        });

        this.jqueryModal.on('hidden.bs.modal', () => {
            if (this.state == 'saved') {
                const content = this.input ? this.input.value : '';

                if (this.currentCallback) {
                    this.currentCallback(content);
                }
            }
        });

        if (form) {
            form.addEventListener('submit', (event) => {
                console.log(`Submitting form ${this.id}`);
                event.preventDefault();
                this.saveButton.click();
            });
        }

        this.saveButton.addEventListener('click', () => {
            console.log(`Saving modal data ${this.id}`);
            this.state = 'saved';
            // this.modal.querySelector('.close').click();

            this.jqueryModal.modal('hide');
            // this.modal.style = "";
        });
    }
    
    getAttribute = (attributeName) => {
        return this.modal.getAttribute(attributeName);
    }

    show = (titleText, data, contentText, callback) => {
        this.currentCallback = callback;
        this.title.textContent = titleText;
        if (this.type == 'input') {
            if (contentText) {
                this.input.value = contentText;
            }
            else {
                this.input.value = '';
            }
        }
        else if (this.type == 'output') {
            this.output.textContent = contentText;
        }
        
        Object.entries(data).forEach(([key, value]) => {
            this.modal.setAttribute(key, value);
        });
        this.jqueryModal.modal('show');
        // this.modalTrigger.click();
    }

    getInputHTML = () => {
        return `

    <button type="button" id="${this.id}-modal-trigger" class="btn btn-primary" data-toggle="modal"
    data-target="#${this.id}-modal" hidden>Open input modal</button>

    <div class="modal fade" id="${this.id}-modal" tabindex="-1" role="dialog" aria-labelledby="${this.id}-modal-label"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="${this.id}-modal-label">${this.titleText}</h5>
                    <button type="button" class="btn close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p hidden>Modal body text goes here.</p>
                    <form>
                        <div class="form-group">
                            <label for="${this.id}" class="col-form-label">${this.labelText}</label>
                            <input type="text" class="form-control" id="${this.id}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" id='save-${this.id}' name='save-${this.id}' class="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    getOutputHTML = () => {
        return `

    <button type="button" id="${this.id}-modal-trigger" class="btn btn-primary" data-toggle="modal"
    data-target="#${this.id}-modal" hidden>Open input modal</button>

    <div class="modal fade" id="${this.id}-modal" tabindex="-1" role="dialog" aria-labelledby="${this.id}-modal-label"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="${this.id}-modal-label">${this.titleText}</h5>
                    <button type="button" class="btn close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <p>Modal body text goes here.</p>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" id='save-${this.id}'  name='save-${this.id}' class="btn btn-primary">Ok</button>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }
}

export const modal = new ModalHandler('input-data', 'Title', 'Data', 'input');
export const outputModal = new ModalHandler('output-data', 'Output', 'Output data', 'output');