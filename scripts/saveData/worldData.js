var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WorldData_saveId;
import { world, system, DisplaySlotId, ObjectiveSortOrder } from '@minecraft/server';
import { Logger, LoggerClass } from '../staticScripts/Logger';
import { addCommand, showHUD } from 'staticScripts/commandFunctions';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { DataType } from 'dataTypes/dataTypeHud';
export { WorldData };
class WorldData {
    get scoreboardName() {
        return this._scoreboardName;
    }
    get expectedValues() {
        return this._expectedValues;
    }
    /**
     *
     * @param {String} id
     */
    constructor(saveId, loggerId, scorebaordName, expectedValueTypes, dontUseNormalCommands) {
        /**@type {String[]} */
        this.worldData = [];
        /**@type {String} The ID under which it will save(You will not be able to change this after the constructor) */
        _WorldData_saveId.set(this, void 0);
        this._expectedValueTypes = [];
        this._expectedValues = 0;
        expectedValueTypes.forEach(type => {
            const { dataType, tooltip, example } = type;
            if (!Object.values(DataType).includes(dataType)) {
                Logger.log("Expected type must be string, number, or boolean", "WorldData");
                return;
            }
            switch (dataType) {
                case DataType.vector:
                    this._expectedValues += 3;
                    break;
                default:
                    this._expectedValues += 1;
            }
            this._expectedValueTypes.push(type);
        });
        if (typeof scorebaordName != "string") {
            scorebaordName = saveId;
        }
        if (typeof saveId != "string") {
            Logger.log("Couldnt create object - Missing #saveId", "WorldData");
            return;
        }
        if (typeof loggerId != "string") {
            loggerId = "Standard worldData";
        }
        __classPrivateFieldSet(this, _WorldData_saveId, saveId, "f");
        this._scoreboardName = scorebaordName;
        this.logger = new LoggerClass(loggerId);
        system.run(async () => {
            if (typeof world.getDynamicPropertyIds().find(id => id.startsWith(__classPrivateFieldGet(this, _WorldData_saveId, "f"))) != "undefined") {
                this.logger.log("Found data");
            }
            else {
                this.logger.log("Didnt find Data");
            }
            this.updateData();
        });
        addCommand({ commandName: `readData ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: () => { this.readData(); }, permissions: ["admin"], directory: `${loggerId}` });
        addCommand({ commandName: `showAsScoreboard ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: (() => { this.showAsScoreboard(); }), permissions: ["admin"], directory: `${loggerId}` });
        if (!dontUseNormalCommands) {
            //to-do add replaceData
            addCommand({ commandName: `removeAllData ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: (() => { this.removeAllData(); }), permissions: ["admin"], directory: `${loggerId}` });
            addCommand({ commandName: `removeData ${this._scoreboardName} ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: ((event) => { this.removeDataHUD(event.sender); }), permissions: ["admin"], directory: `${loggerId}` });
            addCommand({ commandName: `addData ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: ((event) => { this.addDataHUD(event.sender); }), permissions: ["admin"], directory: `${loggerId}` });
            world.beforeEvents.chatSend.subscribe((event) => {
                const message = event.message;
                const player = event.sender;
                switch (message) {
                    case this._scoreboardName:
                        player.sendMessage(`;;readData ${this._scoreboardName}\n
                        ;;showAsScoreboard ${this._scoreboardName}\n
                        ;;removeAllData ${this._scoreboardName}`);
                        break;
                    case `;;showAsScoreboard ${this._scoreboardName}`:
                        this.showAsScoreboard();
                        break;
                    case `;;readData ${this._scoreboardName}`:
                        this.readData();
                        break;
                    case `;;removeAllData ${this._scoreboardName}`:
                        this.removeAllData();
                        break;
                }
            });
        }
        this.updateData();
    }
    updateData() {
        let i = 0;
        this.worldData = [];
        while (true) {
            let data = world.getDynamicProperty(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i}`);
            if (typeof data == "undefined") {
                break;
            }
            this.worldData = [...this.worldData, data];
            i++;
        }
        if (world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar).objective.displayName == this._scoreboardName) {
            this.showAsScoreboard();
        }
    }
    readData() {
        for (let i = 0; i < this.worldData.length; i++) {
            world.sendMessage(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i} with: ${this.worldData[i]}`);
        }
    }
    addDataHUD(player) {
        let form = new ModalFormData();
        form.title("Add data");
        this.logger.log("Adding data to form");
        this._expectedValueTypes.forEach(type => {
            const { dataType, tooltip, example } = type;
            this.logger.log(dataType);
            switch (dataType) {
                case DataType.boolean:
                    form.toggle(tooltip);
                default:
                    form.textField(tooltip, example);
            }
        });
        showHUD(player, form, 10).then((res) => {
            const response = res;
            let constructedString = "";
            response.formValues.forEach((value, index) => {
                constructedString.concat(`${value}`);
            });
        });
    }
    addData(str) {
        if (typeof str != "string") {
            world.sendMessage("You shouldn't see this message...");
            return;
        }
        world.setDynamicProperty(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${this.worldData.length}`, str);
        world.sendMessage(`Added ${str} at ${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${this.worldData.length}`);
        this.updateData();
    }
    removeDataHUD(player) {
        let form = new ActionFormData();
        this.worldData.forEach((data, index) => {
            form.button(data);
        });
        showHUD(player, form, 10).then((res) => {
            const response = res;
            if (response.selection == null) {
                return;
            }
            this.removeData(response.selection);
        });
    }
    removeData(index) {
        if (isNaN(index)) {
            world.sendMessage("NAN");
            return;
        }
        let i = Number(index);
        while (true) {
            let data = world.getDynamicProperty(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i + 1}`);
            world.setDynamicProperty(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i}`, data);
            world.sendMessage(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i} with: ${data}`);
            i++;
            if (typeof data == "undefined") {
                break;
            }
        }
        this.updateData();
    }
    removeAllData() {
        for (let i = 0; i < this.worldData.length; i++) {
            world.setDynamicProperty(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i}`, undefined);
        }
        this.updateData();
    }
    replaceData(index, newData) {
        if (isNaN(index) || typeof newData !== "string") {
            world.sendMessage("Invalid parameters for replaceData");
            return;
        }
        const i = Number(index);
        if (i < 0 || i >= this.worldData.length) {
            world.sendMessage("Index out of bounds");
            return;
        }
        world.setDynamicProperty(`${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i}`, newData);
        world.sendMessage(`Replaced data at ${__classPrivateFieldGet(this, _WorldData_saveId, "f")}_${i} with: ${newData}`);
        this.updateData();
    }
    showAsScoreboard() {
        system.run(() => {
            try {
                world.scoreboard.removeObjective(__classPrivateFieldGet(this, _WorldData_saveId, "f"));
            }
            catch {
                world.sendMessage("Failed");
            }
            const newScoreboard = world.scoreboard.addObjective(__classPrivateFieldGet(this, _WorldData_saveId, "f"), this._scoreboardName);
            world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: newScoreboard, sortOrder: ObjectiveSortOrder.Ascending });
            for (let i = 0; i < this.worldData.length; i++) {
                newScoreboard.setScore(`${this.worldData[i]}`, i);
            }
        });
    }
    getSaveId() {
        return __classPrivateFieldGet(this, _WorldData_saveId, "f");
    }
}
_WorldData_saveId = new WeakMap();
