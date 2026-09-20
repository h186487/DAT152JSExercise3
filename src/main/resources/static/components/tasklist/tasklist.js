const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('tasklist.css',import.meta.url)}">

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
  * Manage view with list of tasks
  */
export class TaskList extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"}); //creates shadow that isolate the component
        //why: components css and html might mix with rest of page. keeps component self contained and reusable
        this.shadowRoot.appendChild(template.content.cloneNode(true)); //adds http template to shadow DOM
        
        this.statuses = []; //store statuses
        //why: component needs to know status options to fill select dropdown
        
        this.changestatusCallback = null; //store callback when user changes status
        //why: tasklist is not supposed to handle direct updates(ajax), so it calls a callback to be able to send to taskview to handle.
        this.deletetaskCallback = null; //same for this
        
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {
        this.statuses = allstatuses;
    }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    addChangestatusCallback(callback) {
        this.changestatusCallback = callback;
    }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    addDeletetaskCallback(callback) {
        this.deletetaskCallback = callback;
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {
        //create copy of taskrow
        const copyRow = taskrow.content.cloneNode(true);
        const tr = copyRow.querySelector('tr');
        tr.dataset.id = task.id; //store task id in tr element

        let tbody = this.shadowRoot.querySelector('tbody');
        if (!tbody) {
            const container = this.shadowRoot.querySelector('#tasklist');
            container.appendChild(tasktable.content.cloneNode(true));
            tbody = this.shadowRoot.querySelector('tbody');
        }

        //get td elements from copied row
        const td = copyRow.querySelectorAll('td');
        //fill first tid with title and second with status for display
        td[0].textContent = task.title;
        td[1].textContent = task.status;
        
        //get select element from copied row
        const select = copyRow.querySelector('select');
        //loop through all statuses
        for (let status of this.statuses){
            //create new element: option
            const option = document.createElement('option');
            //set option value to current status in the list 
            option.value = status;
            //set option display text to current status in teh list
            option.textContent = status;
            //if status matches tasks current status, mark as selected
            if (status == task.status){
                option.selected = true;
            }
            //adds status to select in the dropdown
            //all status are in the dropdown, the status matching the task.status is pre-selected
            select.appendChild(option);
        }

        select.addEventListener('change', (e) => {
            const newStatus = select.value;
            if (this.changestatusCallback) {
                this.changestatusCallback(task.id, newStatus);
            }
        });

        const deleteBtn = copyRow.querySelector('button');
            deleteBtn.addEventListener('click', () => {
            if (this.deletetaskCallback) {
                this.deletetaskCallback(task.id);
            }
        });
        //adds the copy of the row to tbody to be displayed
        tbody.insertBefore(copyRow, tbody.firstChild);
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {
        const taskrows = this.shadowRoot.querySelector(`tr[data-id="${task.id}"]`);
        if (taskrows) {
            taskrows.querySelectorAll('td')[1].textContent = task.status;
        }   
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        const taskrows = this.shadowRoot.querySelector(`tr[data-id="${id}"]`);
        if (taskrows) taskrows.remove();
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {
        return this.shadowRoot.querySelectorAll('tbody tr').length;
    }
}
customElements.define('group10-tasklist', TaskList);
