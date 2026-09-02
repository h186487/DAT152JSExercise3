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
    <GROUP10-TASKLIST></GROUP10-TASKLIST>
    
    <!-- The Modal -->
    <GROUP10-TASKBOX></GROUP10-TASKBOX>
`;

export class TaskView extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({mode: "open"});
    }
    connectedCallback(){
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

customElements.define("group10-taskview", TaskView);
customElements.define('group10-taskbox', TaskBox);