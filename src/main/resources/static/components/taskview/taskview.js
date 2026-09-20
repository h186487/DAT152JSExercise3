// Side-effekt-import: registrerer group10-tasklist og group10-taskbox
// som custom elements FØR malen under prøver å bruke dem.
import "../tasklist/tasklist.js";
import "../taskbox/taskbox.js";

const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${new URL('taskview.css', import.meta.url)}">
    
    <h1>Tasks</h1>
    
    <div id="message"><p>Waiting for server data.</p></div>
    <div id="newtask">
        <button type="button" disabled>New task</button>
    </div>

    <!-- The task list -->
    <group10-tasklist></group10-tasklist>

    <!-- The Modal -->
    <group10-taskbox></group10-taskbox>`
    ;

/**
 * TaskView
 * "Sjefkomponenten" som binder sammen TaskList og TaskBox, og som gjør
 * ALL Ajax-kommunikasjon mot serveren. TaskList og TaskBox vet ingenting
 * om at det finnes en server.
 */
class TaskView extends HTMLElement {
    #tasklist;
    #taskbox;
    #message;
    #newtaskButton;
    #serviceUrl;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.#message = this.shadowRoot.querySelector("#message");
        this.#newtaskButton = this.shadowRoot.querySelector("#newtask button");
        this.#tasklist = this.shadowRoot.querySelector("group10-tasklist");
        this.#taskbox = this.shadowRoot.querySelector("group10-taskbox");

        // Basis-URL for Ajax-kall, f.eks. "./api"
        this.#serviceUrl = this.dataset.serviceurl;

        this.#newtaskButton.addEventListener("click", () => {
            this.#taskbox.show();
        });

        // Registrer callbacks – dette er de ENESTE stedene disse metodene kalles fra
        this.#tasklist.addChangestatusCallback((id, newStatus) => this.#onChangeStatus(id, newStatus));
        this.#tasklist.addDeletetaskCallback((id) => this.#onDeleteTask(id));
        this.#taskbox.addNewtaskCallback((task) => this.#onNewTask(task));

        // Konstruktøren kan ikke være async, så vi bare "starter" den asynkrone
        // innlastingen her uten å vente (await) på den.
        this.#loadInitialData();
    }

    /**
     * Henter statusliste og tasklist fra serveren parallelt med Promise.all,
     * og fyller TaskList/TaskBox med data. Viser feilmelding hvis noe feiler.
     * @private
     */
    async #loadInitialData() {
        try {
            const [allstatuses, tasks] = await Promise.all([
                this.#fetchAllstatuses(),
                this.#fetchTasklist()
            ]);

            this.#tasklist.setStatuseslist(allstatuses);
            this.#taskbox.setStatuseslist(allstatuses);

            for (const task of tasks) {
                this.#tasklist.showTask(task);
            }

            this.#showMessage();
            this.#newtaskButton.disabled = false;
        } catch (error) {
            this.#showError(error);
        }
    }

    /**
     * GET api/allstatuses
     * @private
     * @return {Promise<Array<string>>}
     */
    async #fetchAllstatuses() {
        const response = await fetch(`${this.#serviceUrl}/allstatuses`);
        const data = await response.json();
        if (!data.responseStatus) {
            throw new Error("Server could not deliver the list of task statuses.");
        }
        return data.allstatuses;
    }

    /**
     * GET api/tasklist
     * @private
     * @return {Promise<Array<Object>>}
     */
    async #fetchTasklist() {
        const response = await fetch(`${this.#serviceUrl}/tasklist`);
        const data = await response.json();
        if (!data.responseStatus) {
            throw new Error("Server could not deliver the list of tasks.");
        }
        return data.tasks;
    }

    /** Oppdaterer #message-diven basert på antall tasks (illustrasjon 3 og 5) */
    #showMessage() {
        const n = this.#tasklist.getNumtasks();
        this.#message.textContent = "";
        const p = document.createElement("p");
        p.textContent = n === 0 ? "No tasks were found." : `Found ${n} tasks.`;
        this.#message.appendChild(p);
    }

    /** Viser en enkel feilmelding i #message-diven */
    #showError(error) {
        console.error(error);
        this.#message.textContent = "";
        const p = document.createElement("p");
        p.textContent = "Could not load tasks from the server.";
        this.#message.appendChild(p);
    }

    /**
     * PUT api/task/{id}. Oppdaterer visningen kun hvis responseStatus er true.
     * @private
     */
    async #onChangeStatus(id, newStatus) {
        try {
            const response = await fetch(`${this.#serviceUrl}/task/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.responseStatus) {
                this.#tasklist.updateTask({ id: data.id, status: data.status });
            }
        } catch (error) {
            console.error("Failed to update task status:", error);
        }
    }

    /**
     * DELETE api/task/{id}. Fjerner raden kun hvis responseStatus er true.
     * @private
     */
    async #onDeleteTask(id) {
        try {
            const response = await fetch(`${this.#serviceUrl}/task/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.responseStatus) {
                this.#tasklist.removeTask(data.id);
                this.#showMessage();
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    }

    /**
     * POST api/task. Legger til raden med id-en serveren returnerer,
     * og lukker modalen kun hvis responseStatus er true.
     * @private
     */
    async #onNewTask(task) {
        try {
            const response = await fetch(`${this.#serviceUrl}/task`, {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({ title: task.title, status: task.status })
            });
            const data = await response.json();
            if (data.responseStatus) {
                this.#tasklist.showTask(data.task);
                this.#showMessage();
                this.#taskbox.close();
            }
        } catch (error) {
            console.error("Failed to add task:", error);
        }
    }
}

customElements.define("group10-taskview", TaskView);