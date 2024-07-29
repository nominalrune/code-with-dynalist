import { Dynalist } from "./types";

export const DYNALIST_INITIAL_STATE: Dynalist = {
    projects: [],
    tasks: [],
    sections: [],
};

export enum CONTEXT_KEYS {
    DYNALIST_DATA = "dynalistData",
    DYNALIST_SELECTED_TASK = "dynalistSelectedTask",
}

export enum SORT_BY {
    Order = "Order",
    Priority = "Priority",
    Alphabetical = "Alphabetical"
}
