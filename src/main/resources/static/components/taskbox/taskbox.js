const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskbox.css', import.meta.url)}">
    <dialog>
        <span class="close">&times;</span>
        <div class="fields">
            <div>Title:</div>
            <div>
                <input type="text" size="25" maxlength="80" placeholder="Task title" autofocus/>
            </div>
            <div>Status:</div><div><select></select></div>
        </div>
        <p><button type="submit">Add task</button></p>
    </dialog>`
    ;

/**
 * TaskBox
 * Modal dialog for å legge inn en ny task.
 * Har ingen kjennskap til TaskView eller TaskList, og gjør ALDRI Ajax selv.
 */
class TaskBox extends HTMLElement {
    #dialog;
    #titleInput;
    #statusSelect;
    #closeSpan;
    #addButton;
    #newtaskCallbacks = [];

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#dialog = this.shadowRoot.querySelector("dialog");
        this.#titleInput = this.shadowRoot.querySelector("input");
        this.#statusSelect = this.shadowRoot.querySelector("select");
        this.#closeSpan = this.shadowRoot.querySelector("span.close");
        this.#addButton = this.shadowRoot.querySelector("button");

        // Lukk-symbolet (×): bare lukk dialogen
        this.#closeSpan.addEventListener("click", () => this.close());

        // Native "close"-event trigges av close(), Escape-tasten OG × -knappen.
        // Her nullstiller vi feltene ett sted, uansett hvordan den ble lukket.
        this.#dialog.addEventListener("close", () => this.#resetFields());

        this.#addButton.addEventListener("click", (event) => {
            event.preventDefault(); // hindrer default submit-oppførsel
            const task = {
                title: this.#titleInput.value.trim(),
                status: this.#statusSelect.value
            };
            if (task.title === "") {
                this.#titleInput.focus();
                return; // enkel validering: ikke send tom tittel
            }
            this.#newtaskCallbacks.forEach((callback) => callback(task));
        });
    }

    /**
     * @public
     * @param {Array} allstatuses - liste over mulige task-statuser
     */
    setStatuseslist(allstatuses) {
        this.#statusSelect.innerHTML = "";
        for (const status of allstatuses) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            this.#statusSelect.appendChild(option);
        }
    }

    /**
     * @public
     * @param {function} callback - kjøres med (task) som argument når "Add task" klikkes
     */
    addNewtaskCallback(callback) {
        this.#newtaskCallbacks.push(callback);
    }

    /** @public Åpner modalen */
    show() {
        this.#dialog.showModal();
    }

    /** @public Lukker modalen */
    close() {
        this.#dialog.close();
    }

    #resetFields() {
        this.#titleInput.value = "";
        this.#statusSelect.selectedIndex = 0;
    }
}

customElements.define("group10-taskbox", TaskBox);