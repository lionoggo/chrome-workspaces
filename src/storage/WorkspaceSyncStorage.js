import { assert } from "../util/assert.js";
import AtomicLock from "../util/AtomicLock.js";

const updateLock = AtomicLock()

const Key = {
    WORKSPACE_LIST: "workspaceList",
}


const WorkspaceSyncStorage = {
    Key,


    async updateWorkspaceItems(key, updater) {
        await updateLock(async () => {
            const value = chrome.storage.sync.get(key)
            const newValue = await updater(value)
            await chrome.storage.sync.set({ [key]: newValue })
        })
    },

    async getWorkspaceList() {
        const list = (await chrome.storage.sync.get(Key.WORKSPACE_LIST))?.[Key.WORKSPACE_LIST] ?? [];
        console.log("workspace list from cloud", list)
        return list
    },

    async updateWorkSpaceList(updater) {
        await updateLock(async () => {
            const list = (await chrome.storage.sync.get(Key.WORKSPACE_LIST))?.[Key.WORKSPACE_LIST] ?? [];
            const newList = await updater(list)
            await chrome.storage.sync.set({ [Key.WORKSPACE_LIST]: newList })
            console.log("workspace list saved to cloud", newList)
        })
    },

    async set(workspaceId, workspace) {
        // console.log("=============save workspace: ", workspace)
        // const key = workspace.id;
        const name = workspace.name;
        const color = workspace.color;
        const tabs = workspace.tabs.map(tab => ({ title: tab.title, url: tab.url }));
        const json = { name, color, tabs };
        await chrome.storage.sync.set({ [workspaceId]: json });
        console.log("workspace saved to cloud", { [workspaceId]: json })
    },


    async get(workspaceId) {
        const json = await chrome.storage.sync.get(workspaceId);
        // {name,color,tabs}
        console.log("workspace get from cloud", json)
        return json
    },

    async remove(workspaceId) {
        await chrome.storage.sync.remove(workspaceId);
    }


}
export default WorkspaceSyncStorage