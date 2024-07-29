import type { Task, Section } from '@doist/todoist-api-typescript';
import type { ProjectQuickPick } from '../types';
import { TreeItem } from 'vscode';

export class DynalistTreeItem extends TreeItem {
    project!: ProjectQuickPick;
    task!: Task;
    section!: Section;
}

