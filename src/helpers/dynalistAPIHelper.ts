import * as vscode from 'vscode';
import SettingsHelper from './settingsHelper';
import { normalizeToDocumentQuickPick } from './normalizeDocument';
import SecretsHelper from './secretsHelper';

export default class DynalistAPIHelper {
    private state: vscode.Memento;

    constructor(context: vscode.Memento) {
        this.state = context;
    }

    public async syncDocuments() {
        const state = this.state;

        const api = await this.createApiClient();

        const responseDocuments = await api.getDocuments().catch(this.handleApiRequestError);

        // Do not update if there are no Documents (an error occurred)
        if (responseDocuments.length === 0) {
            return;
        }

        let data = SettingsHelper.getDynalistData(state);
        data.Documents = [];

        responseDocuments.forEach((apiDocument) => {
            data.Documents.push(normalizeToDocumentQuickPick(apiDocument));
        });

        SettingsHelper.setDynalistData(state, data);
    }

    public async syncActiveTasks(): Promise<void> {
        const state = this.state;

        const api = await this.createApiClient();
        const responseTasks = await api.getTasks().catch(this.handleApiRequestError);

        // Do not update if there are no tasks (an error occurred)
        if (responseTasks.length === 0) {
            return;
        }

        let data = SettingsHelper.getDynalistData(state);
        data.tasks = responseTasks;

        SettingsHelper.setDynalistData(state, data);
    }

    public async syncSections() {
        let state = this.state;

        const api = await this.createApiClient();
        const responseSections = await api.getSections().catch(this.handleApiRequestError);

        // Do not update if there are no sections (an error occurred)
        if (responseSections.length === 0) {
            return;
        }

        let data = SettingsHelper.getDynalistData(state);
        data.sections = responseSections;

        SettingsHelper.setDynalistData(state, data);
    }

    public async createDocument(DocumentName: string) {
        const api = await this.createApiClient();

        try {
            const newDocument = await api.addDocument({ name: DocumentName });
            return normalizeToDocumentQuickPick(newDocument);
        } catch {
            return "Something went wrong when creating the Document.";
        }
    }

    public async createTask(taskText: string, DocumentId?: string) {
        const api = await this.createApiClient();

        try {
            const newTask = await api.addTask({ content: taskText, DocumentId });
            return newTask;
        } catch {
            throw new Error("Something went wrong when creating the task.");
        }
    }


    public async getDocuments() {
        const state = this.state;

        const api = await this.createApiClient();
        const responseDocuments = await api.getDocuments().catch(this.handleApiRequestError);

        // Do not update if there are no Documents (an error occurred)
        if (responseDocuments.length === 0) {
            throw new Error("Something went wrong when getting the Documents.");
        }

        let data = SettingsHelper.getDynalistData(state);
        data.Documents = [];

        responseDocuments.forEach((apiDocument) => {
            data.Documents.push(normalizeToDocumentQuickPick(apiDocument));
        });

        SettingsHelper.setDynalistData(state, data);

        return data.Documents;
    }

    public async getActiveTasks() {
        const state = this.state;

        const api = await this.createApiClient();
        const activeTasks = await api.getTasks().catch(this.handleApiRequestError);

        let data = SettingsHelper.getDynalistData(state);
        data.tasks = activeTasks;

        SettingsHelper.setDynalistData(state, data);

        return activeTasks;
    }

    private async createApiClient() {
        const apiToken = await SecretsHelper.getSecret("apiToken");
        if (!apiToken) {
            throw new Error("API token is not set.");
        }
        return new DynalistApi(apiToken);
    }

    private handleApiRequestError(error: DynalistRequestError): never[] {
        if (error.httpStatusCode === 400) {
            throw new Error("Ensure Dynalist API token is set. You can configure your API token using the 'Dynalist: Set API Token' command.");
        }
        else if (error.isAuthenticationError()) {
            throw new Error("Incorrect Dynalist API token. Configure your API token using the 'Dynalist: Set API Token' command.");
        }
        else {
            throw new Error("Unknown error. " + error.message);
        }
    }

}
