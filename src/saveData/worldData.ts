import { world, system, Player, ItemTypes, ItemStack, DisplaySlotId, ObjectiveSortOrder}from '@minecraft/server';
import { VectorFunctions } from "../staticScripts/vectorFunctions";
import { Logger, LoggerClass } from '../staticScripts/Logger';
import { addCommand , CommandValues, showHUD} from 'staticScripts/commandFunctions';
import {  GlobalVars } from '../globalVars';
import { ActionFormData, ActionFormResponse, ModalFormData, ModalFormResponse } from '@minecraft/server-ui';
import { DataType } from 'dataTypes/dataTypeHud';
export {WorldData}


export interface AddDataValues{
    dataType: DataType,
    tooltip: string,
    example: string
}
abstract class WorldData {

    /**@type {String[]} */
    worldData : string[] = []

    /**@type {String} The ID under which it will save(You will not be able to change this after the constructor) */
    #saveId : string

    /**@type {String} The ID under which it will save(You will not be able to change this after the constructor) */
    private _scoreboardName : string

    public get scoreboardName(): string {
        return this._scoreboardName;
    }

    /**@type {LoggerClass} Logger*/
    protected logger : LoggerClass

    protected _expectedValueTypes : AddDataValues[] = []

    protected _expectedValues : number = 0;

    public get expectedValues(): number {
        return this._expectedValues;
    }

    /**
     * 
     * @param {String} id
     */
    constructor(saveId : string, loggerId : string, scorebaordName : string, expectedValueTypes : AddDataValues[], dontUseNormalCommands? : boolean) {
        expectedValueTypes.forEach(type => {
            const {dataType, tooltip, example} = type
            if(!Object.values(DataType).includes(dataType)){
                Logger.log("Expected type must be string, number, or boolean", "WorldData")
                return
            }
            switch(dataType){
                case DataType.vector:
                    this._expectedValues += 3;
                    break;
                default:
                    this._expectedValues += 1
            }
            
            this._expectedValueTypes.push(type)
        })
    
        if(typeof scorebaordName != "string"){
            scorebaordName = saveId
        }

        if(typeof saveId != "string"){
            Logger.log("Couldnt create object - Missing #saveId", "WorldData")
            return;
        }
        if(typeof loggerId != "string"){
            loggerId = "Standard worldData"
        }

        this.#saveId = saveId
        this._scoreboardName = scorebaordName
        this.logger= new LoggerClass(loggerId)
        system.run(async () => {
            if(typeof world.getDynamicPropertyIds().find(id => id.startsWith(this.#saveId)) != "undefined"){
                this.logger.log("Found data")
            } else {
                this.logger.log("Didnt find Data")
            }
            this.updateData()
        });
        addCommand({commandName: `readData ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: () =>{ this.readData()}, permissions: ["admin"], directory: `${loggerId}`})
        addCommand({commandName: `showAsScoreboard ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: (() => {this.showAsScoreboard()}), permissions: ["admin"], directory: `${loggerId}`})

        if(!dontUseNormalCommands){
            //to-do add replaceData
            addCommand({commandName: `removeAllData ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: (() => {this.removeAllData()}), permissions: ["admin"], directory: `${loggerId}`})
            addCommand({commandName: `removeData ${this._scoreboardName} ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: ((event) => {this.removeDataHUD(event.sender)}), permissions: ["admin"], directory: `${loggerId}`})
            addCommand({commandName: `addData ${this._scoreboardName}`, commandPrefix: ";;", chatFunction: ((event) => {this.addDataHUD(event.sender)}), permissions: ["admin"], directory: `${loggerId}`})

            world.beforeEvents.chatSend.subscribe((event) => {
                const message = event.message
                const player = event.sender
                
                switch(message){
                    case this._scoreboardName:
                        player.sendMessage(
                        `;;readData ${this._scoreboardName}\n
                        ;;showAsScoreboard ${this._scoreboardName}\n
                        ;;removeAllData ${this._scoreboardName}`
                        )
                        break;
                    case `;;showAsScoreboard ${this._scoreboardName}`:
                        this.showAsScoreboard()
                        break;
                    case `;;readData ${this._scoreboardName}`:
                        this.readData()
                        break;
                    case `;;removeAllData ${this._scoreboardName}`:
                        this.removeAllData()
                        break;
                }
               

            })
        }
        this.updateData()
    }

    protected updateData(){
        let i = 0
        this.worldData = []
        while(true){
            let data : string = world.getDynamicProperty(`${this.#saveId}_${i}`) as string;
            if(typeof data == "undefined"){break;}
            this.worldData = [...this.worldData, data];
            i++;
        }
        if(world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar).objective.displayName == this._scoreboardName){
            this.showAsScoreboard()
        }
    }

    readData(){
        for(let i = 0; i < this.worldData.length; i++){
            world.sendMessage(`${this.#saveId}_${i} with: ${this.worldData[i]}`)
        }
    }

    addDataHUD(player){
        let form = new ModalFormData()
        form.title("Add data")
        this.logger.log("Adding data to form")
        this._expectedValueTypes.forEach(type => {
            const {dataType, tooltip, example} = type
            this.logger.log(dataType)

             
            switch(dataType){
                case DataType.boolean:
                    form.toggle(tooltip)
                default:
                    form.textField(tooltip, example)
            }


        })

        showHUD(player, form, 10).then((res) => {
            const response = res as ModalFormResponse
            let constructedString = ""
            response.formValues.forEach((value, index) => {
                constructedString.concat(`${value}`)
            })
           
        })
    }
    addData(str : string){
        if(typeof str != "string") {world.sendMessage("You shouldn't see this message..."); return;}
        world.setDynamicProperty(`${this.#saveId}_${this.worldData.length}`, str)
        world.sendMessage(`Added ${str} at ${this.#saveId}_${this.worldData.length}`)
        this.updateData()
    }

    removeDataHUD(player){
        let form = new ActionFormData()
        this.worldData.forEach((data, index) => {
            form.button(data)
        })
        showHUD(player, form, 10).then((res) => {
            const response = res as ActionFormResponse
            if(response.selection == null){return;}
            this.removeData(response.selection)
        })
    }
    removeData(index){
        if(isNaN(index)){world.sendMessage("NAN"); return;}
        let i = Number(index)
        while(true){
            let data = world.getDynamicProperty(`${this.#saveId}_${i+1}`)
            world.setDynamicProperty(`${this.#saveId}_${i}`, data)
            world.sendMessage(`${this.#saveId}_${i} with: ${data}`)
            i++;
            if(typeof data == "undefined"){break;}
        }
        this.updateData()
    }

    removeAllData(){
        for(let i = 0; i < this.worldData.length; i++){world.setDynamicProperty(`${this.#saveId}_${i}`, undefined)}
        this.updateData()
    }

    replaceData(index: number, newData: string) {
        if (isNaN(index) || typeof newData !== "string") {
            world.sendMessage("Invalid parameters for replaceData");
            return;
        }

        const i = Number(index);
        if (i < 0 || i >= this.worldData.length) {
            world.sendMessage("Index out of bounds");
            return;
        }

        world.setDynamicProperty(`${this.#saveId}_${i}`, newData);
        world.sendMessage(`Replaced data at ${this.#saveId}_${i} with: ${newData}`);
        this.updateData();
    }

    showAsScoreboard() : void{
        system.run(() => {
            try{world.scoreboard.removeObjective(this.#saveId)} catch{world.sendMessage("Failed")}
            const newScoreboard = world.scoreboard.addObjective(this.#saveId, this._scoreboardName)
            world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {objective: newScoreboard, sortOrder: ObjectiveSortOrder.Ascending})
            for(let i = 0; i < this.worldData.length; i++){
                newScoreboard.setScore(`${this.worldData[i]}`, i)
            }
        })
        
    }

    getSaveId(){
        return this.#saveId
    }

}