import * as vscode from 'vscode';
import { DynalistTreeItem } from '../models/DynalistTreeView';
import SettingsHelper from '../helpers/settingsHelper';
import { DocumentsProvider } from './documentsProvider';

export class WorkspaceProjectProvider extends DocumentsProvider {

    private projectId: string | undefined;
    private extContext: vscode.Memento;

    constructor(context: vscode.Memento, projectId: string | undefined) {
        super(context);
        this.projectId = projectId;
        this.extContext = context;
    }

    getTreeItem(element: DynalistTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return super.getTreeItem(element);
    }

    getChildren(element?: DynalistTreeItem | undefined): vscode.ProviderResult<DynalistTreeItem[]> {

        if(!element) {
            let projects = SettingsHelper.getDynalistData(this.extContext).projects;
            let workspaceProject = projects.filter(p => p.id === this.projectId)[0]; 
            if(!workspaceProject) {
                return null;
            }
            let projectName = workspaceProject.name;
                element = new DynalistTreeItem(projectName, vscode.TreeItemCollapsibleState.Expanded);
                element.id = this.projectId;
                element.project = workspaceProject;
        }
        
        return super.getChildren(element);
    }
}
