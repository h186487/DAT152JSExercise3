const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskbox.css', import.meta.url)}">
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

/**
 * TaskBox
 * Modal box where the user can add details of a new tasj. 
 */
class TaskBox extends HTMLElement {

    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: "open" });
        this._shadow.appendChild(template.content.cloneNode(true));

        this._dialog = this._shadow.querySelector("dialog");
        this._input = this._shadow.querySelector("input");
        this._select = this._shadow.querySelector("select");
        this._closeSpan = this._shadow.querySelector("span");
        this._submitButton = this._shadow.querySelector("button");

        this._newtaskCallbacks = [];

        this._closeSpan.addEventListener("click", () => this.close());

        this._submitButton.addEventListener("click", () => {
            const task = { title: this._input.value, status: this._select.value };
            this._newtaskCallbacks.forEach(cb => cb(task));
        });
    }

    /** 
     * Sets the list of possible task statuses
     * @public 
     * @param {Array} list 
     */
    setStatuseslist(list) {
        this._select.innerHTML = "";
        for (const status of list) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            this._select.appendChild(option);
        }
    }

    /** 
     * Adds a callback to run at click on the Add task button
     * @public 
     * @param {function} callback 
     */
    addNewtaskCallback(callback) {
        this._newtaskCallbacks.push(callback);
    }

    /** 
     * Opens (shows) the modal box
     * @public 
     */
    show() {
        this._dialog.showModal();
    }

    /** 
     * Removes the modal box from view
     * @public 
     */
    close() {
        this._dialog.close();
    }
}
customElements.define('group10-taskbox', TaskBox);