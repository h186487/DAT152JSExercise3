const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css"
        href="${new URL('taskbox.css',import.meta.url)}">
    <dialog>
    <!-- Modal content -->
        <span>&times;</span>
            <div>
            <div>Title:</div>
            <div>
                <input type="text" size="25" maxlength="80"
                    placeholder="Task title" autofocus/>
            </div>
            <div>Status:</div><div><select></select></div>
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
    }

    /**
    * Opens (shows) the modal box in the browser view 
    * @public
    * 
    */
    show() {
        const dialog = this.shadowRoot.querySelector('dialog');
        dialog.showModal();  
    }
    
    /**
    * Sets the list of possible task statuses
    * @public
    * @param {Array} list
    */
    setStatuseslist(list){
        const select = this.shadowRoot.querySelector('select');
        for (let status of list){
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
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
        const dialog = this.shadowRoot.querySelector('dialog');
        dialog.close();
    }
    
    connectedCallback(){
        const addTaskbtn = this.shadowRoot.querySelector('button[type="submit"]');
        
        addTaskbtn.addEventListener('click', (e) => {
            const titleInput = this.shadowRoot.querySelector('input');
            const statusSelect = this.shadowRoot.querySelector('select');
            
            const newTask = {
                title : titleInput.value,
                status : statusSelect.value
            };
            
            if (this.newtaskCallback){
                this.newtaskCallback(newTask);
            }
            this.close();
        });
    }
}
customElements.define('group10-taskbox', TaskBox);