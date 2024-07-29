import type { ProjectQuickPick } from '../types';

import * as vscode from 'vscode';
import * as path from 'path';
import DynalistAPIHelper from '../helpers/dynalistAPIHelper';
import { DynalistTreeItem } from '../models/DynalistTreeView';
import SettingsHelper from '../helpers/settingsHelper';
import { SORT_BY } from '../constants';

export class DocumentsProvider implements vscode.TreeDataProvider<DynalistTreeItem> {

    private apiHelper: DynalistAPIHelper;
    private state: vscode.Memento;

    private _onDidChangeTreeData = new vscode.EventEmitter<DynalistTreeItem | undefined>();
    onDidChangeTreeData?: vscode.Event<DynalistTreeItem | null | undefined> | undefined = this._onDidChangeTreeData.event;

    refresh(data: DynalistTreeItem | undefined): void {
        this._onDidChangeTreeData.fire(data);
    }

    constructor(context: vscode.Memento) {
        this.state = context;
        this.apiHelper = new DynalistAPIHelper(context);
    }

    getTreeItem(element: DynalistTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const data = SettingsHelper.getDynalistData(this.state);
        if (data.tasks.some(task => task.parentId && task.parentId === element.id)) {
            element.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        }
        return element;
    }

    getChildren(element?: DynalistTreeItem): vscode.ProviderResult<DynalistTreeItem[]> {
        const api = this.apiHelper;
        const data = SettingsHelper.getDynalistData(this.state);

        if (element) {
            let treeView: DynalistTreeItem[] = [];
            if (data.projects && data.projects.length > 0) {
                let projects = formatProjects(data.projects.filter(p => p.parentId && p.parentId === element.id!));
                treeView.push(...projects);
            }
            if (data.sections && data.sections.length > 0) {
                let sections = formatSections(data.sections.filter(s => s.projectId?.toString() === element.id));
                treeView.push(...sections);
            }
            if (data.tasks && data.tasks.length > 0) {
                let tasks: Task[] = [];

                if (element.project) {
                    tasks = (data.tasks.filter(
                        t => t.projectId?.toString() === element.id && t.sectionId === null && !t.parentId));
                }
                if (element.section) {
                    tasks = (data.tasks.filter(
                        t => (t.sectionId?.toString() === element.id && !t.parentId)));
                }
                if (element.task) {
                    tasks = (data.tasks.filter(
                        t => t.parentId?.toString() === element.id));
                }
                treeView.push(...formatTasks(tasks));
                return treeView;
            }
            else {
                api.getActiveTasks().then((tasks) => {
                    treeView.push(...formatTasks(tasks.filter(t => t.projectId?.toString() === element.id)));
                    return treeView;
                });
            }
        }
        else {
            if (data.projects && data.projects.length > 0) {
                return formatProjects(data.projects.filter(p => !p.parentId));
            }
            else {
                api.getDocuments().then((projects) => {
                    return formatProjects(projects.filter(p => !p.parentId));
                });
            }
        }
    }
}

function formatTasks(tasks: Task[]) {
    let activeTasks: DynalistTreeItem[] = [];
    tasks = sortTasks();
    tasks.forEach(t => {
        let treeview = new DynalistTreeItem(t.content);
        treeview.id = t.id;
        treeview.tooltip = new vscode.MarkdownString(t.content);
        treeview.collapsibleState = vscode.TreeItemCollapsibleState.None;
        treeview.task = t;
        treeview.iconPath = path.join(__filename, '..', '..', '..', 'media', 'priority', t.priority.toString() + '.svg');
        treeview.contextValue = 'todoistTask';
        treeview.command = {
            command: 'todoist.openTask',
            title: 'Open task',
            arguments: [t.id],
            tooltip: 'Open task'
        };

        activeTasks.push(treeview);
    });
    return activeTasks;

    function sortTasks(): Task[] {
        const sortByValue = SettingsHelper.getTaskSortBy();
        switch (sortByValue) {
            case SORT_BY.Order:
                return tasks.sort((a, b) => a.order > b.order ? 1 : -1);
            case SORT_BY.Priority:
                return tasks.sort((a, b) => a.priority > b.priority ? -1 : 1);
            case SORT_BY.Alphabetical:
                return tasks.sort((a, b) => a.content > b.content ? 1 : -1);
            default:
                return tasks.sort((a, b) => a.order > b.order ? 1 : -1);
        }
    }
}

function formatSections(sections: Section[]) {
    let displaySections: DynalistTreeItem[] = [];
    sections = sections.sort((a, b) => a.order > b.order ? 1 : -1);
    sections.forEach(s => {
        let treeview = new DynalistTreeItem(s.name);
        treeview.id = s.id;
        treeview.tooltip = s.name;
        treeview.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        treeview.section = s;
        treeview.contextValue = '';
        displaySections.push(treeview);
    });
    return displaySections;
}


function formatProjects(projects: ProjectQuickPick[]) {
    let displayProjects: DynalistTreeItem[] = [];
    projects = projects.sort((a, b) => a.order > b.order ? 1 : 0);
    projects.forEach(p => {
        let treeview = new DynalistTreeItem(p.name);
        treeview.id = p.id;
        treeview.tooltip = p.name;
        treeview.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        treeview.project = p;
        treeview.iconPath = getIconPath(p);
        treeview.contextValue = '';
        displayProjects.push(treeview);
    });
    return displayProjects;

    function getIconPath(p: ProjectQuickPick): string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; } | vscode.ThemeIcon | undefined {
        if (p.isShared) {
            return path.join(__filename, '..', '..', '..', 'media', 'shared', p.color + '.svg');
        }
        return path.join(__filename, '..', '..', '..', 'media', 'colours', p.color + '.svg');
    }
}
