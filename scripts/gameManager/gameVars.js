import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { DataType } from "dataTypes/dataTypeHud";
import { WorldData } from "saveData/worldData";
import { addCommand, showHUD } from "staticScripts/commandFunctions";
const worldSpawn = world.getDefaultSpawnLocation();
let gameVars = [
    { varName: "editingMode", dataType: DataType.boolean, data: "1", tooltip: "0 = off, otherwise on" },
    { varName: "predatorSprint", dataType: DataType.vector, data: "10 1.5 2", tooltip: "max stamina, sprint multiplier, stamina regen rate" },
    { varName: "survivorSprint", dataType: DataType.vector, data: "10 1.5 1.5", tooltip: "max stamina, sprint multiplier, stamina regen rate" },
    { varName: "playersNeeded", dataType: DataType.number, data: "2" },
    { varName: "numberOfPredators", dataType: DataType.number, data: "1" },
    { varName: "standardObjectiveFinishMultiplier", dataType: DataType.number, data: "1", tooltip: "Standard Objective Time Multiplier" },
];
export var EGameVarId;
(function (EGameVarId) {
    EGameVarId[EGameVarId["editingMode"] = 0] = "editingMode";
    EGameVarId[EGameVarId["predatorSprint"] = 1] = "predatorSprint";
    EGameVarId[EGameVarId["survivorSprint"] = 2] = "survivorSprint";
    EGameVarId[EGameVarId["playersNeeded"] = 3] = "playersNeeded";
    EGameVarId[EGameVarId["numberOfPredators"] = 4] = "numberOfPredators";
    EGameVarId[EGameVarId["standardObjectiveFinishMultiplier"] = 5] = "standardObjectiveFinishMultiplier";
})(EGameVarId || (EGameVarId = {}));
export function getGameVarData(gameVar) {
    return gameVars[gameVar].data;
}
class GameVars extends WorldData {
    constructor(saveId, loggerId, scorebaordName, expectedValueTypes, dontUseNormalCommands) {
        super(saveId, loggerId, scorebaordName, expectedValueTypes, dontUseNormalCommands);
        addCommand({ commandName: "changeValue", chatFunction: ((event) => { this.changeValueHud(event); }), directory: "GameVariables", commandPrefix: ";;" });
        if (this.worldData.length != gameVars.length) {
            world.sendMessage("WorldData length is not equal to gameVars length, reseting data...");
            this.removeAllData();
            gameVars.forEach((gameVar, i) => {
                this.addData(gameVar.data);
            });
            return;
        }
        this.worldData.forEach((data, index) => {
            gameVars[index].data = data;
        });
    }
    async changeValueHud(event) {
        let form = new ActionFormData();
        form.title("Change Values");
        gameVars.forEach((gameVar, i) => {
            form.button(gameVar.varName);
        });
        let response = await showHUD(event.sender, form, 10);
        let gameVar = gameVars[response.selection];
        let form2 = new ModalFormData();
        form2.title("Change Values");
        form2.textField(`${gameVar.varName} ${gameVar.tooltip}`, `Current Value: ${gameVar.data}$`, gameVar.data);
        let response2 = await showHUD(event.sender, form2, 10);
        switch (gameVar.dataType) {
            case DataType.vector:
                let respons2String = response2.formValues[0];
                let splitStr = respons2String.split(" ");
                if (splitStr.length === 3 && splitStr.every(str => !isNaN(Number(str)))) {
                    gameVars[response.selection].data = respons2String;
                }
                break;
        }
        this.changeValue(response.selection, response2.formValues[0]);
    }
    changeValue(index, newData) {
        this.replaceData(index, newData);
        gameVars[index].data = newData;
    }
}
export const gameVar = new GameVars("GameVariables", "GameVariables", "GameVariables", [], true);
