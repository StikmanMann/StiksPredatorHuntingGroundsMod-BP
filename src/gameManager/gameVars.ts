import { ChatSendBeforeEvent, world } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { GlobalVars } from "globalVars";
import { AddDataValues, DataType, WorldData } from "saveData/worldData";
import { Logger } from "staticScripts/Logger";
import { addCommand, showHUD } from "staticScripts/commandFunctions";

interface IGameVars{
    varName : string;
    dataType : DataType;
    data : string;
    tooltip? : string;
}

const worldSpawn = world.getDefaultSpawnLocation()

let gameVars : IGameVars[] = [
    {varName: "predatorSprint", dataType: DataType.vector, data: "10 1.5 2", tooltip: "max stamina, sprint multiplier, stamina regen rate"},
    {varName: "playersNeeded", dataType: DataType.number, data: "2"},
    {varName: "numberOfPredators", dataType: DataType.number, data: "1"},
    {varName: "standardObjectiveTime", dataType: DataType.number, data: "100", tooltip: "In seconds(Reads at start of game)"},
];
export enum EGameVarId{
    predatorSprint = 0,
    playersNeeded = 1,
    numberOfPredators = 2,
    standardObjectiveTime = 3
}

export function getGameVarData(gameVar : EGameVarId) : string{
    return gameVars[gameVar].data
}

class GameVars extends WorldData{
    constructor(saveId : string, loggerId : string, scorebaordName : string, expectedValueTypes : AddDataValues[], dontUseNormalCommands? : boolean){
        super(saveId, loggerId, scorebaordName, expectedValueTypes, dontUseNormalCommands)
        addCommand({commandName: "changeValue",chatFunction: ((event) => {this.changeValueHud(event)}), directory: "GameVariables", commandPrefix: ";;"})

        world.sendMessage(`${this.worldData.length} == ${gameVars.length}`)
        if(this.worldData.length != gameVars.length){
            world.sendMessage("WorldData length is not equal to gameVars length, reseting data...")
            this.removeAllData();
            gameVars.forEach((gameVar, i) => {
                this.addData(gameVar.data)
            })
            return;
        }
        this.worldData.forEach((data, index) => {
            gameVars[index].data = data
        })

    }

    async changeValueHud(event : ChatSendBeforeEvent){
        let form : ActionFormData = new ActionFormData();
        form.title("Change Values")
        gameVars.forEach((gameVar, i) => {
            form.button(gameVar.varName)
        })
        let response = await showHUD(event.sender,form, 10) as ActionFormResponse;

        let gameVar = gameVars[response.selection];
        let form2 : ModalFormData = new ModalFormData();
        form2.title("Change Values")
        form2.textField(`${gameVar.varName} ${gameVar.tooltip}`, `Current Value: ${gameVar.data}$`, gameVar.data)

        let response2 = await showHUD(event.sender,form2, 10) as ModalFormResponse;
        switch(gameVar.dataType){
            case DataType.vector:
                let respons2String = response2.formValues[0] as string
                let splitStr = respons2String.split(" ")
                if (splitStr.length === 3 && splitStr.every(str => !isNaN(Number(str)))) {
                    gameVars[response.selection].data = respons2String;
                }
                break;
        }
        this.changeValue(response.selection, response2.formValues[0] as string)
    }

    changeValue(index : number, newData : string){
        this.replaceData(index, newData)
        gameVars[index].data = newData
        
    }

}

export const gameVar = new GameVars("GameVariables", "GameVariables", "GameVariables", [
    
], true)