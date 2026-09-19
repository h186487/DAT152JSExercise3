const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css"
        href="${new URL('taskview.css', import.meta.url)}">
    
    <h1>Tasks</h1>

    <div id="message"><p>Waiting for server data.</p></div>
    <div id="newtask">
        <button type="button" disabled>New task</button>
    </div>

    <!-- The task list -->
    <group10-tasklist></group10-tasklist>

    <!-- The Modal -->
    <group10-taskbox></group10-taskbox>
`;

/**
 * TaskView
 * All use of Ajax is put in the methods of TaskView, 
 * no use of Ajax or fetch in TaskList nor TaskBox
 */
class TaskView extends HTMLElement {

    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: "open" });
        this._shadow.appendChild(template.content.cloneNode(true));

        this._messageDiv = this._shadow.querySelector("#message");
        this._newtaskButton = this._shadow.querySelector("#newtask button");
        this._tasklist = this._shadow.querySelector("group10-tasklist");
        this._taskbox = this._shadow.querySelector("group10-taskbox");

        this._setupNewtaskButton();
        this._setupTaskbox();
        this._setupTasklist();
    }

    /**
    * Runs when the element is inserted into the document.
    * Reads the service URL and loads initial data from the server.
    */
    async connectedCallback() {
        this._serviceurl = this.getAttribute("data-serviceurl");

        const statuses = await this._fetchAllstatuses();
        this._tasklist.setStatuseslist(statuses);
        this._taskbox.setStatuseslist(statuses);

        const tasks = await this._fetchTasklist();
        for (const task of tasks) this._tasklist.showTask(task);

        this._updateMessage(this._tasklist.getNumtasks());
        this._newtaskButton.disabled = false;
    }

    _setupNewtaskButton() {
        this._newtaskButton.addEventListener("click", () => this._taskbox.show());
    }

    _setupTaskbox() {
        this._taskbox.addNewtaskCallback(async (task) => {
            const result = await this._postTask(task);
            if (result.responseStatus) {
                this._tasklist.showTask(result.task);
                this._taskbox.close();
                this._updateMessage(this._tasklist.getNumtasks());
            }
        });
    }

    _setupTasklist() {
        this._tasklist.addChangestatusCallback(async (id, newStatus) => {
            const result = await this._putTaskStatus(id, newStatus);
            if (result.responseStatus) {
                this._tasklist.updateTask({ id: result.id, status: result.status });
            }
        });

        this._tasklist.addDeletetaskCallback(async (id) => {
            const result = await this._deleteTask(id);
            if (result.responseStatus) {
                this._tasklist.removeTask(result.id);
                this._updateMessage(this._tasklist.getNumtasks());
            }
        });
    }

    _updateMessage(count) {
        this._messageDiv.innerHTML = "";
        const p = document.createElement("p");
        p.textContent = count > 0 ? `Found ${count} tasks.` : "No tasks were found.";
        this._messageDiv.appendChild(p);
    }

    /**
     * @private
     * @returns {Promise<Array>} list of all possible task statuses
     */
    async _fetchAllstatuses() {
        const response = await fetch(`${this._serviceurl}/allstatuses`);
        const data = await response.json();
        return data.responseStatus ? data.allstatuses : [];
    }

    /**
    * @private
    * @returns {Promise<Array>} list of all tasks from the server
    */
    async _fetchTasklist() {
        const response = await fetch(`${this._serviceurl}/tasklist`);
        const data = await response.json();
        return data.responseStatus ? data.tasks : [];
    }

    /**
    * @private
    * @param {Object} task - {title, status}
    * @returns {Promise<Object>} server response with {task, responseStatus}
    */
    async _postTask(task) {
        const response = await fetch(`${this._serviceurl}/task`, {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(task)
        });
        return await response.json();
    }

    /**
    * @private
    * @param {Number} id
    * @param {String} status
    * @returns {Promise<Object>} server response with {id, status, responseStatus}
    */
    async _putTaskStatus(id, status) {
        const response = await fetch(`${this._serviceurl}/task/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ status })
        });
        return await response.json();
    }

    /**
    * @private
    * @param {Number} id
    * @returns {Promise<Object>} server response with {id, responseStatus}
    */
    async _deleteTask(id) {
        const response = await fetch(`${this._serviceurl}/task/${id}`, { method: "DELETE" });
        return await response.json();
    }
}
customElements.define('group10-taskview', TaskView);