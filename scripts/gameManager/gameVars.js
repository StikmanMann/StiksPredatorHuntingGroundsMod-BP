import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { DataType, WorldData } from "saveData/worldData";
import { addCommand, showHUD } from "staticScripts/commandFunctions";
const worldSpawn = world.getDefaultSpawnLocation();
let gameVars = [
    { varName: "predatorSprint", dataType: DataType.vector, data: "10 1.5 2", tooltip: "max stamina, sprint multiplier, stamina regen rate" },
    { varName: "playersNeeded", dataType: DataType.number, data: "2" },
    { varName: "numberOfPredators", dataType: DataType.number, data: "1" },
    { varName: "standardObjectiveTime", dataType: DataType.number, data: "100", tooltip: "In seconds(Reads at start of game)" },
];
export var EGameVarId;
(function (EGameVarId) {
    EGameVarId[EGameVarId["predatorSprint"] = 0] = "predatorSprint";
    EGameVarId[EGameVarId["playersNeeded"] = 1] = "playersNeeded";
    EGameVarId[EGameVarId["numberOfPredators"] = 2] = "numberOfPredators";
    EGameVarId[EGameVarId["standardObjectiveTime"] = 3] = "standardObjectiveTime";
})(EGameVarId || (EGameVarId = {}));
export function getGameVarData(gameVar) {
    return gameVars[gameVar].data;
}
class GameVars extends WorldData {
    constructor(saveId, loggerId, scorebaordName, expectedValueTypes, dontUseNormalCommands) {
        super(saveId, loggerId, scorebaordName, expectedValueTypes, dontUseNormalCommands);
        addCommand({ commandName: "changeValue", chatFunction: ((event) => { this.changeValueHud(event); }), directory: "GameVariables", commandPrefix: ";;" });
        world.sendMessage(`${this.worldData.length} == ${gameVars.length}`);
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
