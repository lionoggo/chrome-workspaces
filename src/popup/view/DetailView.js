import View from "./View.js"
import Workspace from "../../workspace/Workspace.js"
import Color from "../../Color.js"

class DetailView extends View {
    constructor({ onSave, onRemove }) {
        super("#view-detail")

        this._onSave = onSave
        this._onRemove = onRemove

        this._heading = this.getElement("h1")
        this._nameField = this.getElement("#workspace-name")
        this._colorPicker = this.getElement("#workspace-color-picker")
        this._removeButton = this.getElement(".remove-button")
        this._saveButton = this.getElement(".save-button")
    }

    async render({ workspaceId }) {
        const workspace = await Workspace.get(workspaceId)

        this._heading.innerText = workspace ? "Edit Workspace" : "New Workspace"

        this._nameField.value = workspace?.name ?? ""
        this._nameField.onkeydown = (e) => {
            if (e.key === "Enter") {
                this._saveButton.click()
            }
        }

        this._renderColors()
        this._selectColor(workspace?.color ?? "grey")

        this._removeButton.style.display = workspace ? "block" : "none"
        this._removeButton.onclick = () => this._onRemove({ workspaceId })

        this._saveButton.innerText = workspace ? "Done" : "Add"
        this._saveButton.onclick = () => this._validate() && this._onSave({
            workspaceId: workspaceId,
            name: this._nameField.value,
            color: this._getSelectedColor()
        })

        this._nameField.focus()
    }

    keyPressed({ key }) {
        const offsetMap = {
            "ArrowLeft": -1,
            "ArrowRight": 1,
            "ArrowUp": -5,
            "ArrowDown": 5
        }

        const colorButtons = this.getElements(".color")
        const offset = offsetMap[key]
        const index = colorButtons.indexOf(document.activeElement)

        if (!offset || index === -1) {
            return
        }

        const nextIndex = index + offset
        if (nextIndex >= 0 && nextIndex < colorButtons.length) {
            colorButtons[nextIndex].focus()
        }
    }

    _validate() {
        if (this._nameField.value.length === 0) {
            this._nameField.focus()
            return false
        }

        return true
    }

    _renderColors() {
        this._colorPicker.innerHTML = ""

        for (const colorName of Object.keys(Color)) {
            const button = document.createElement('button')
            button.classList.add('color')
            button.dataset.colorName = colorName
            button.style.backgroundColor = Color[colorName]
            button.onclick = () => this._selectColor(colorName)

            this._colorPicker.appendChild(button)
        }
    }

    _selectColor(colorName) {
        this.getElements(".color").forEach(color => {
            color.classList.toggle("color-selected", color.dataset.colorName === colorName)
        })
    }

    _getSelectedColor() {
        return this.getElement(".color-selected")?.dataset?.colorName
    }
}

export default DetailView