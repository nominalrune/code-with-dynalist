import * as vscode from 'vscode';
import { DynalistTreeItem } from '../models/DynalistTreeView';
import SettingsHelper from '../helpers/settingsHelper';

export class TaskProvider implements vscode.TreeDataProvider<DynalistTreeItem> {

    private context: vscode.ExtensionContext;
    private taskId: string | undefined;

    private _onDidChangeTreeData = new vscode.EventEmitter<DynalistTreeItem | undefined>();
    onDidChangeTreeData?: vscode.Event<DynalistTreeItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh(data: DynalistTreeItem | undefined): void {
        this.taskId = SettingsHelper.getSelectedTask(this.context.workspaceState);
        this._onDidChangeTreeData.fire(data);
    }

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.taskId = SettingsHelper.getSelectedTask(this.context.workspaceState);
    }

    getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren() {
        if (this.taskId) {
            const data = SettingsHelper.getDynalistData(this.context.globalState);
            const tasks = data.tasks.filter(t => t.id === this.taskId);
            if (tasks && tasks.length > 0) {
                
                const task = tasks[0];
                    let treeView: DynalistTreeItem[] = [];

                    // Showing task text
                    // todo allow tast rename
                    let taskTitle = new DynalistTreeItem(task.content);
                    taskTitle.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    taskTitle.id = task.id.toString() + '_task';
                    taskTitle.description = task.description;
                    taskTitle.tooltip = new vscode.MarkdownString(task.content);
                    treeView.push(taskTitle);

                    // todo show description
                    // todo allow task description change

                    // todo show priority
                    // todo allow priority change

                    // Showing the due time of the task
                    // todo allow due date change
                    let taskParent = new DynalistTreeItem("Due");
                    taskParent.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    if (task.due) {
                        taskParent.id = task.id.toString() + task.due.date;
                        taskParent.description = new Date(task.due.date).toLocaleDateString();
                        taskParent.tooltip = task.due.string;
                    }
                    else {
                        taskParent.id = task.id.toString() + "nodue";
                        taskParent.description = " *not set* ";
                        taskParent.tooltip = new vscode.MarkdownString("*Due date not set*");
                    }
                    treeView.push(taskParent);


                    // Showing if the task is completed or pending
                    let taskCompletion = new DynalistTreeItem("Completed");
                    taskCompletion.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    taskCompletion.id = task.id + task.isCompleted;
                    taskCompletion.description = taskCompletion.tooltip = task.isCompleted ? "Completed" : "Pending";
                    treeView.push(taskCompletion);

                    // Showing Document the task belongs too
                    // todo add icon of colour
                    const document = data.Documents.filter(p => p.id === task.documentId);
                    if (document.length > 0) {
                        let taskDocument = new DynalistTreeItem("Document");
                        taskDocument.collapsibleState = vscode.TreeItemCollapsibleState.None;
                        taskDocument.id = document[0].id.toString();
                        taskDocument.description = document[0].name;
                        taskDocument.tooltip = document[0].name;
                        treeView.push(taskDocument);
                    }

                    // Showing parent task of the selected task
                    const parent = data.tasks.filter(p => p.id === task.parentId);
                    if (parent.length > 0) {
                        let taskParent = new DynalistTreeItem("Parent");
                        taskParent.collapsibleState = vscode.TreeItemCollapsibleState.None;
                        taskParent.id = parent[0].id.toString();
                        taskParent.description = parent[0].content;
                        taskParent.tooltip = parent[0].content;
                        treeView.push(taskParent);
                    }

                    // Showing the section the task is part of
                    const section = data.sections.filter(s => s.id === task.sectionId);
                    if (section.length > 0) {
                        let taskSection = new DynalistTreeItem("Section");
                        taskSection.collapsibleState = vscode.TreeItemCollapsibleState.None;
                        taskSection.id = section[0].id.toString();
                        taskSection.description = section[0].name;
                        taskSection.tooltip = section[0].name;
                        treeView.push(taskSection);
                    }


                    // todo Add labels

                    // todo Add comments


                    // Showing empty line before showing the Open in Browser button
                    let emptyTask = new DynalistTreeItem("");
                    emptyTask.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    emptyTask.id = 'emptyBeforeClose';
                    treeView.push(emptyTask);

                    // Showing button to open task in browser
                    let openInBrowser = new DynalistTreeItem("Open in Browser 🌐");
                    openInBrowser.collapsibleState = vscode.TreeItemCollapsibleState.None;
                    openInBrowser.id = task.id + "_browser";
                    openInBrowser.tooltip = new vscode.MarkdownString("Click to open task in browser");
                    openInBrowser.command = {
                        command: 'dynalist.openTaskInBrowser',
                        title: 'Open task in Browser',
                        arguments: [task.url],
                        tooltip: 'Open task in Browser'
                    };
                    treeView.push(openInBrowser);

                    return treeView;
            }

        }
        return Promise.resolve([]);
    }



}
