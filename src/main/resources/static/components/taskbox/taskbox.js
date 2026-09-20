const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css"
        href="${new URL('taskbox.css',import.meta.url)}">
    <dialog>
     <!-- Modal content -->
        <span class="close">&times;</span>
        <div>
            <div>Title:</div>
            <div>
                <input type="text" id="task-title" size="25" maxlength="80"
                    placeholder="Task title" autofocus/>
            </div>
            <div>Status:</div>
            <div><select id="task-status"></select></div>
        </div>
        <p><button type="submit">Add task</button></p>
    </dialog>
`;

export class TaskBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"}); //creates shadow that isolate the component
        //why: components css and html might mix with rest of page. keeps component self contained and reusable
        this.shadowRoot.appendChild(template.content.cloneNode(true)); //adds http template to shadow DOM
        this._dialog = this.shadowRoot.querySelector('dialog');
        this._input = this.shadowRoot.querySelector('#task-title');
        this._select = this.shadowRoot.querySelector('#task-status');
        this._submitBtn = this.shadowRoot.querySelector('button[type="submit"]');
        this._closeSpan = this.shadowRoot.querySelector('.close');
        
        this.newtaskCallback = null;   
    }

    connectedCallback() {
        this._submitBtn.addEventListener('click', () => this._handleSubmit());
        this._closeSpan.addEventListener('click', () => this.close());
    }

    _handleSubmit() {
        const newTask = {
            title: this._input.value,
            status: this._select.value
        };
        
        if (this.newtaskCallback) {
            this.newtaskCallback(newTask);
        }
        
        this.close();
    }

    /**
    * Opens (shows) the modal box in the browser view 
    * @public
    * 
    */
    show() {
        this._dialog.showModal();  
    }
    
    /**
    * Sets the list of possible task statuses
    * @public
    * @param {Array} list
    */
    setStatuseslist(list){
        this._select.innerHTML = ''; 
        for (let status of list){
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            this._select.appendChild(option); 
        }   
    }
    
    /**
    * Adds a callback to run at a click on the "add task" button
    * @public
    * @param {function} callback
    */
    addNewtaskCallback(callback){
        this.newtaskCallback = callback;
    }
    
    /**
    * Removes the modal box from the view
    * @public
    * 
    */
    close(){
        this._dialog.close();
    }
}
customElements.define('group10-taskbox', TaskBox);