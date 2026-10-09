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
 * Modal box for entering a new task. Never closes itself after "Add task";
 * the controlling code calls close() when the task has been saved.
 */
class TaskBox extends HTMLElement {

    #shadow;
    #dialog;
    #input;
    #select;
    #newtaskCallbacks = [];

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "closed" });
        this.#shadow.appendChild(template.content.cloneNode(true));

        this.#dialog = this.#shadow.querySelector("dialog");
        this.#input = this.#shadow.querySelector("input");
        this.#select = this.#shadow.querySelector("select");
        const closeSymbol = this.#shadow.querySelector("span");
        const addButton = this.#shadow.querySelector("button");

        closeSymbol.addEventListener("click", () => this.close());
        addButton.addEventListener("click", () => this.#submit());
        // Fires however the dialog is closed: close(), the X, or Escape
        this.#dialog.addEventListener("close", () => this.#reset());
    }

    /**
     * @public
     * @param {Array<string>} list - all possible task statuses
     */
    setStatuseslist(list) {
        this.#select.replaceChildren();
        for (const status of list) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            this.#select.appendChild(option);
        }
    }

    /**
     * @public
     * @param {function({title: string, status: string}): void} callback
     */
    addNewtaskCallback(callback) {
        this.#newtaskCallbacks.push(callback);
    }

    /**
     * Opens the modal box.
     * @public
     */
    show() {
        this.#dialog.showModal();
    }

    /**
     * Closes the modal box.
     * @public
     */
    close() {
        this.#dialog.close();
    }

    /**
     * Reports the new task to the callbacks, unless title or status is missing.
     */
    #submit() {
        const title = this.#input.value.trim();
        const status = this.#select.value;
        if (title.length === 0 || status.length === 0) {
            this.#input.focus();
            return;
        }
        const task = { title: title, status: status };
        this.#newtaskCallbacks.forEach(cb => cb(task));
    }

    /**
     * Clears the form so the next task starts empty.
     */
    #reset() {
        this.#input.value = "";
        this.#select.selectedIndex = 0;
    }
}
customElements.define('group10-taskbox', TaskBox);