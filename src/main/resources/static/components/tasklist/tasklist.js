const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/tasklist.css"/>

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
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {

    constructor() {
        super();

        /**
         * Fill inn rest of the code
         */
        this._shadow = this.attachShadow({ mode: "open" });
        this._shadow.appendChild(template.content.cloneNode(true));
        this._container = this._shadow.querySelector("#tasklist");

        this._allstatuses = [];
        this._changeCallbacks = [];
        this._deleteCallbacks = [];
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        /**
         * Fill inn the code
         */
        this._allstatuses = allstatuses;
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    addChangestatusCallback(callback) {
        /**
         * Fill inn the code
         */
        this._changeCallbacks.push(callback);
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    addDeletetaskCallback(callback) {
        /**
         * Fill inn the code
         */
        this._deleteCallbacks.push(callback);
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        /**
         * Fill inn the code
         */
        let table = this._container.querySelector("table")
        if (!table) {
            this._container.appendChild(tasktable.content.cloneNode(true));
            table = this._container.querySelector("table");
        }
        const tbody = table.querySelector("tbody");

        const row = taskrow.content.cloneNode(true).querySelector("tr");
        row.dataset.id = task.id;

        const cells = row.querySelectorAll("td");
        cells[0].textContent = task.title;
        cells[1].textContent = task.status;

        //fyll SELECT med statusene fra setStatuseslist
        const select = row.querySelector("select");
        for (const status of this._allstatuses) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        }

        //SELECT: kun varsle, ikke endre visning selv 
        select.addEventListener("change", () => {
            const newStatus = select.value;
            if (window.confirm(`Set '${task.title}' to ${newStatus}?`)) {
                this._changeCallbacks.forEach(cb => cb(task.id, newStatus));
            }
            select.selectedIndex = 0;
        });

        //Remove-knapp: kun varsle, ikke fjerne raden selv
        const button = row.querySelector("button");
        button.addEventListener("click", () => {
            if (window.confirm(`Delete task '${task.title}'?`)) {
                this._deleteCallbacks.forEach(cb => cb(task.id));
            }
        });

        tbody.insertBefore(row, tbody.firstChild);
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        /**
         * Fill inn the code
         */
        const row = this._container.querySelector(`tr[data-id="${task.id}"]`);
        if (row) {
            row.querySelectorAll("td")[1].textContent = task.status;
        }
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        /**
         * Fill inn the code
         */
        const row = this._container.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();

        if (this.getNumtasks() === 0) {
            this._container.innerHTML = ""; //
        }
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        /**
         * Fill inn the code
         */
        return this._container.querySelectorAll("tbody tr").length;
    }
}
customElements.define('group10-tasklist', TaskList);