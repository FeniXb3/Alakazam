class ModalHandler {
    constructor(modalIdentifier, title, label, callback) {
        this.container = document.getElementById('modals-container');
        
        this.id = modalIdentifier;
        this.titleText = title;
        this.labelText = label;
        if (!document.getElementById(`${this.id}-modal`)) {
            this.container.innerHTML += this.getHTML();
        }

        this.modalTrigger = document.getElementById(`${this.id}-modal-trigger`);
        this.modal = document.getElementById(`${this.id}-modal`);
        this.saveButton = document.getElementById(`save-${this.id}`);
        this.input = this.modal.querySelector('.modal-body input');
        this.title = this.modal.querySelector('.modal-title');

        
        $(`#${this.id}-modal`).on('shown.bs.modal', () => {
            this.input.focus();
            this.state = '';
        });

        $(`#${this.id}-modal`).on('hidden.bs.modal', () => {
            if (this.state == 'saved') {
                const content = this.input.value;
                if (callback) {
                    callback(content);
                }

                if (this.currentCallback) {
                    this.currentCallback(content);
                    this.currentCallback = null;
                }
            }
        });

        this.modal.querySelector('form').addEventListener('submit', (event) => {
            event.preventDefault();
            this.saveButton.click();
        });

        this.saveButton.addEventListener('click', () => {
            this.state = 'saved';
            // this.modal.querySelector('.close').click();

            $(`#${this.id}-modal`).modal('hide');
            // this.modal.style = "";
        });
    }
    
    getAttribute = (attributeName) => {
        return this.modal.getAttribute(attributeName);
    }

    show = (titleText, data, contentText, callback) => {
        this.currentCallback = callback;
        this.title.textContent = titleText;
        if (contentText) {
            this.input.value = contentText;
        }
        else {
            this.input.value = '';
        }
        
        Object.entries(data).forEach(([key, value]) => {
            this.modal.setAttribute(key, value);
        });
        $(`#${this.id}-modal`).modal('show');
        // this.modalTrigger.click();
    }

    getHTML = () => {
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
                        <div class="form-group">
                            <label for="${this.id}" class="col-form-label">${this.labelText}</label>
                            <input type="text" class="form-control" id="${this.id}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" id='save-${this.id}' class="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    </div>
</div>`;
    }
}

export const modal = new ModalHandler('input-data', 'Title', 'Data', null);