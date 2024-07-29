import type { QuickPickItem } from 'vscode';
import type { Section, Task, Project } from '@doist/todoist-api-typescript';

export type Dynalist = {
    lastSyncTime?: Date;
    projects: ProjectQuickPick[];
    tasks: Task[];
    sections: Section[];
};

export type ProjectQuickPick = Project & QuickPickItem;
