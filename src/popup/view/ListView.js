import View from "./View.js"
import WorkspaceList from "../../workspace/WorkspaceList.js"
import WorkspaceColor from "../../workspace/WorkspaceColor.js"
import sortable from "../../lib/sortable.js"

class ListView extends View {
    constructor({ onAddItem, onEditItem, onOpenItem, onMoveItem }) {
        super("#view-list")

        this._onAddItem = onAddItem
        this._onEditItem = onEditItem
        this._onOpenItem = onOpenItem
        this._onMoveItem = onMoveItem

        this._listElement = this.getElement(".workspace-list")
        this._addButton = this.getElement(".new-button")
    }

    async render() {
        const workspaces = await WorkspaceList.getWorkspaces()
        const currentWindowId = (await chrome.windows.getCurrent()).id
        const currentWorkspaceId = await WorkspaceList.findWorkspaceForWindow(currentWindowId)

        this._listElement.innerHTML = ""
        this._addButton.onclick = () => this._onAddItem()

        for (const workspace of workspaces) {
            const selected = workspace.id === currentWorkspaceId
            const item = this._renderItem({ ...workspace, selected })
            this._listElement.appendChild(item)
        }

        sortable(this._listElement, { onDrop: this._onMoveItem })
    }

    _renderItem({ id, name, color = "gray", selected }) {
        const itemColor = document.createElement("div")
        itemColor.classList.add("item-color")

        const itemName = document.createElement("div")
        itemName.classList.add("item-name")
        itemName.innerText = name

        const itemButton = document.createElement("i")
        itemButton.title = "Edit"
        itemButton.classList.add("bi", "bi-three-dots", "item-edit-button")
        itemButton.onclick = (e) => {
            e.stopPropagation();
            this._onEditItem(id);
        }

        const item = document.createElement("button")
        item.classList.add("item")
        item.classList.toggle(selectedClass, selected)
        item.onclick = () => this._onOpenItem(id)
        item.style.setProperty('--item-color', WorkspaceColor[color])
        item.style.setProperty('--item-bg-color', WorkspaceColor[color] + "24")
        item.appendChild(itemColor)
        item.appendChild(itemName)
        item.appendChild(itemButton)

        if (name.length > 40) {
            item.title = name
        }

        return item
    }

    keyPressed({ key }) {
        const items = [...this._listElement.children, this._addButton]
        const currentIndex = items.indexOf(document.activeElement)
        const prevIndex = currentIndex >= 0 ? currentIndex - 1 : items.length - 1
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0

        if (key === "ArrowUp") {
            items[prevIndex]?.focus()
        } else if (key === "ArrowDown") {
            items[nextIndex]?.focus()
        }
    }
}

const selectedClass = "item-selected"

export default ListView