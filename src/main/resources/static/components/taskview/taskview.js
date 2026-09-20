const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css"
        href="${new URL('taskview.css',import.meta.url)}">
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

export class TaskView extends HTMLElement{
    constructor(){
        super();
        this._shadow = this.attachShadow({ mode: "open" });
        this._shadow.appendChild(template.content.cloneNode(true));

        // Cache DOM elements
        this._messageDiv = this._shadow.querySelector("#message");
        this._newtaskButton = this._shadow.querySelector("#newtask button");
        this._tasklist = this._shadow.querySelector("group10-tasklist");
        this._taskbox = this._shadow.querySelector("group10-taskbox");

        // Setup component callbacks
        this._setupNewtaskButton();
        this._setupTaskbox();
        this._setupTasklist();  
    }
    async connectedCallback(){
        this._serviceurl = this.getAttribute("data-serviceurl");

        try {
            const statuses = await this._fetchAllstatuses();
            this._tasklist.setStatuseslist(statuses);
            this._taskbox.setStatuseslist(statuses);

            const tasks = await this._fetchTasklist();
            tasks.forEach(task => this._tasklist.showTask(task));

            this._updateMessage(this._tasklist.getNumtasks());
            this._newtaskButton.disabled = false;
        } catch (error) {
            this._updateMessage("Error");
            console.error("Failed to load data:", error);
        }
    }

     /**
     * Button listener for "new task" button
     * @private
     */
    _setupNewtaskButton() {
        this._newtaskButton.addEventListener("click", () => this._taskbox.show());
    }

    /**
     * Callback for when user submits new task form
     * @private
     */
    _setupTaskbox() {
        this._taskbox.addNewtaskCallback(async (task) => {
            try {
                const result = await this._postTask(task);
                if (result.responseStatus) {
                    this._tasklist.showTask(result.task);
                    this._taskbox.close();
                    this._updateMessage(this._tasklist.getNumtasks());
                }
            } catch (error) {
                console.error("Failed to add task:", error);
            }
        }); 
    }

    /**
     * Setup callbacks for TaskList (status change and delete)
     * @private
     */
    _setupTasklist() {
        this._tasklist.addChangestatusCallback(async (id, newStatus) => {
            try {
                const result = await this._putTaskStatus(id, newStatus);
                if (result.responseStatus) {
                    this._tasklist.updateTask({ id: result.id, status: result.status });
                }
            } catch (error) {
                console.error("Failed to update task status:", error);
            }
        });

        this._tasklist.addDeletetaskCallback(async (id) => {
            try {
                const result = await this._deleteTask(id);
                if (result.responseStatus) {
                    this._tasklist.removeTask(result.id);
                    this._updateMessage(this._tasklist.getNumtasks());
                }
            } catch (error) {
                console.error("Failed to delete task:", error);
            }
        });
    }

    /**
     * Update the message div with task count
     * @private
     * @param {Number} count - Number of tasks
     */
    _updateMessage(count) {
        this._messageDiv.innerHTML = "";
        const p = document.createElement("p");
        p.textContent = typeof count === 'number' 
            ? (count > 0 ? `Found ${count} tasks.` : "No tasks were found.")
            : count; // if count is a string (error message)
        this._messageDiv.appendChild(p);
    }

    /**
     * Fetch all possible task statuses
     * @private
     * @returns {Promise<Array>} Array of status strings
     */
    async _fetchAllstatuses() {
        const response = await fetch(`${this._serviceurl}/allstatuses`);
        const data = await response.json();
        return data.responseStatus ? data.allstatuses : [];
    }

    /**
     * Fetch all tasks from server
     * @private
     * @returns {Promise<Array>} Array of task objects
     */
    async _fetchTasklist() {
        const response = await fetch(`${this._serviceurl}/tasklist`);
        const data = await response.json();
        return data.responseStatus ? data.tasks : [];
    }

    /**
     * Create a new task on the server
     * @private
     * @param {Object} task - { title, status }
     * @returns {Promise<Object>} Server response with task object
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
     * Update task status on server
     * @private
     * @param {Number} id - Task ID
     * @param {String} status - New status
     * @returns {Promise<Object>} Server response with id and status
     */
    

    async _putTaskStatus(id, status) {
        console.log("PUT request - ID:", id, "Status:", status);
        console.log("Request body:", JSON.stringify({ status }));
        
        const response = await fetch(`${this._serviceurl}/task/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        console.log("PUT response:", data);
        return data;
    }

    /**
     * Delete task from server
     * @private
     * @param {Number} id - Task ID
     * @returns {Promise<Object>} Server response with id
     */
    async _deleteTask(id) {
        const response = await fetch(`${this._serviceurl}/task/${id}`, { method: "DELETE" });
        return await response.json();
    }
}

customElements.define("group10-taskview", TaskView);
