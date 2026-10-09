const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('tasklist.css', import.meta.url)}">
    <div id="tasklist"></div>`;

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>
`;

/**
 * TaskList
 * Displays a list of tasks. Knows nothing about Ajax or about the code
 * controlling it; user actions are reported through callbacks.
 */
class TaskList extends HTMLElement {

    #shadow;
    #container;
    #table = null;
    #allstatuses = [];
    #changeCallbacks = [];
    #deleteCallbacks = [];

    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: "closed" });
        this.#shadow.appendChild(template.content.cloneNode(true));
        this.#container = this.#shadow.querySelector("#tasklist");
    }

    /**
     * @public
     * @param {Array<string>} allstatuses - all possible task statuses
     */
    setStatuseslist(allstatuses) {
        this.#allstatuses = allstatuses;
    }

    /**
     * @public
     * @param {function(number, string): void} callback - run with (id, newStatus)
     */
    addChangestatusCallback(callback) {
        this.#changeCallbacks.push(callback);
    }

    /**
     * @public
     * @param {function(number): void} callback - run with the task id
     */
    addDeletetaskCallback(callback) {
        this.#deleteCallbacks.push(callback);
    }

    /**
     * Adds a task at the top of the list. Creates the table on first use.
     * @public
     * @param {{id: number, title: string, status: string}} task
     */
    showTask(task) {
        if (this.#table === null) {
            this.#table = tasktable.content.firstElementChild.cloneNode(true);
            this.#container.appendChild(this.#table);
        }

        const row = taskrow.content.firstElementChild.cloneNode(true);
        row.dataset.id = task.id;
        row.cells[0].textContent = task.title;
        row.cells[1].textContent = task.status;

        const select = row.cells[2].firstElementChild;
        for (const status of this.#allstatuses) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        }

        select.addEventListener("change", () => {
            const newStatus = select.value;
            const unchanged = newStatus === row.cells[1].textContent;
            // Same status as already shown: ignore, do not even ask
            if (unchanged === false && window.confirm(`Set '${task.title}' to ${newStatus}?`)) {
                this.#changeCallbacks.forEach(cb => cb(task.id, newStatus));
            }
            select.selectedIndex = 0;
        });

        const button = row.cells[3].firstElementChild;
        button.addEventListener("click", () => {
            if (window.confirm(`Delete task '${task.title}'?`)) {
                this.#deleteCallbacks.forEach(cb => cb(task.id));
            }
        });

        const tbody = this.#table.tBodies[0];
        tbody.insertBefore(row, tbody.firstChild);
    }

    /**
     * Updates the status shown for a task.
     * @public
     * @param {{id: number, status: string}} task
     */
    updateTask(task) {
        const row = this.#findRow(task.id);
        if (row !== null) {
            row.cells[1].textContent = task.status;
        }
    }

    /**
     * Removes a task. Removes the whole table (and header) with the last task.
     * @public
     * @param {number} id
     */
    removeTask(id) {
        const row = this.#findRow(id);
        if (row === null) {
            return;
        }
        row.remove();
        if (this.getNumtasks() === 0) {
            this.#container.replaceChildren();
            this.#table = null;
        }
    }

    /**
     * @public
     * @returns {number} number of tasks shown
     */
    getNumtasks() {
        return this.#table === null ? 0 : this.#table.tBodies[0].rows.length;
    }

    /**
     * @param {number} id
     * @returns {HTMLTableRowElement|null} the row of the task, or null
     */
    #findRow(id) {
        if (this.#table === null) {
            return null;
        }
        for (const row of this.#table.tBodies[0].rows) {
            if (row.dataset.id === String(id)) {
                return row;
            }
        }
        return null;
    }
}
customElements.define('group10-tasklist', TaskList);