import { ActionFormData, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { BookData } from "./saveData/bookData";
import { MolangVariableMap, Player, system, world } from "@minecraft/server";
import { Logger } from "./staticScripts/Logger";
import { AwaitFunctions } from "./staticScripts/awaitFunctions";
import { CollisionFunctions } from "./staticScripts/collisionFunctions";
import { VectorFunctions } from "./staticScripts/vectorFunctions";
import { GlobalVars } from "./globalVars";
import { TickFunctions } from "./staticScripts/tickFunctions";
import { DebugOptions } from "./debugging/debugCommands";
import { ActionbarMessage, HudManager } from "./hud";

class LaunchpadVars{
    /**
     * @type {import("@minecraft/server").Vector3}
     */
    startLoc

    /**
     * @type {import("@minecraft/server").Vector3}
     */
    endLoc

    /**
     * @type {number}
     */
    angle

    /**
     * @type {number}
     */
    horizontalPower

    /**
     * @type {number}
     */
    verticalPower

    /**
     * 
     * @param {String} str 
     */
    constructor(str){
        let splitStr = str.split(" ")
        this.startLoc = {x: Number(splitStr[0]), y: Number(splitStr[1]), z: Number(splitStr[2])}
        this.endLoc = {x:Number(splitStr[3]), y: Number(splitStr[4]), z: Number(splitStr[5])}
        this.angle = Number(splitStr[6])
        this.horizontalPower = Number(splitStr[7])
        this.verticalPower = Number(splitStr[8])
    }
}

class Launchpad extends BookData{  //to-do make this world data and rewrite some stff


   
    static gui = new ModalFormData()
                .title("Cool GUI for launchpad Creation")
                .textField("Starting Coords of Hitbox", "For example: 30 -60 10")
                .textField("Ending Coords of Hitbox", "For example: 25 -55 15")
                .textField("Rotation of launch\n(0° =  x=1, z=0 | 90° =  x=0, z=1)", "For example: 90")
                .textField("Strength Horizontal and Vertical", "For Example: 10 20")
                
                

    static expectedValues = 9

    /**
     * @type {LaunchpadVars[]}
     */
    #launchpadVarsArr = []
    
    /**
     * @type {MolangVariableMap} 
     * */
    molangVars = new MolangVariableMap()
    .setColorRGBA("variable.color", { red: 255, green: 0, blue: 255, alpha: 255 })
    

    constructor(chestLocation, slot){
        super(chestLocation, slot)
       
        TickFunctions.addFunction(() => this.tick(), 5)
        
    }

    tick(){
       
            for(let i = 0; i < this.#launchpadVarsArr.length; i++){ 
                const launchpadVars = this.#launchpadVarsArr[i]
                for(const player of GlobalVars.players){
                    //world.sendMessage(`${CollisionFunctions.insideBox(player.location, launchpadVars.startLoc, launchpadVars.endLoc)}`)
                                
                    if(CollisionFunctions.insideBox(player.location, launchpadVars.startLoc, launchpadVars.endLoc, true, this.molangVars)){
                        let playerVel = player.getVelocity()
                        let speed = VectorFunctions.vectorLength({x: playerVel.x, y: 0, z: playerVel.z})
                        if(speed < 1){
                            //world.sendMessage(`${speed}`)
                            player.playSound("firework.launch")
                            if(DebugOptions.debug){HudManager.addActionbarMessage(new ActionbarMessage(player, `DEBUG - Launchpad ${i} with angle ${launchpadVars.angle}`, 40))}
                            player.applyKnockback(Math.cos(launchpadVars.angle * (Math.PI / 180)), Math.sin(launchpadVars.angle * (Math.PI / 180)), launchpadVars.horizontalPower, launchpadVars.verticalPower)
                        }
                    
                            
                    }
            }
        }

    }

    updateLore(){
        //  super.readLore()
        this.#launchpadVarsArr = []
        let currentLore = this._loreItem.getLore()
        for(let i = 0; i < currentLore.length; i++){
            let splitCoordinates = currentLore[i].split(" ")
            this.#launchpadVarsArr[i] = new LaunchpadVars(currentLore[i])
            //world.sendMessage(`${this.#checkpoints[i].x} ${this.#checkpoints[i].y} ${this.#checkpoints[i].z}`)
        }
    }

    addLaunchpad(newLaunchpad){
        this._addLore(newLaunchpad)
        this.updateLore()
    }
}


let launchpads = new Launchpad({x:0, y:-60, z:0}, 2)
const commandPrefix = ";;"

world.afterEvents.buttonPush.subscribe(async (eventData) => {
    
    const formResult = await Launchpad.gui.show(eventData.source as Player) //Apparently an entity can also push buttons but lol
    Logger.log("Form Recived!", "Form")
    if(formResult.canceled) {Logger.log(formResult.cancelationReason, "Form Canceled");return}
    Logger.log("Form Not Canceled", "Form")
    let resultsString = ""
    formResult.formValues.forEach((result) => {
        if(typeof result != "string") {return}
        const strSplit = result.split(" ")
        strSplit.forEach((str) => {
            if(isNaN(Number(str))) {return}
            resultsString = `${resultsString}${str} `
        })
        
    })
    Logger.log(resultsString, "FORM END")
})

world.beforeEvents.chatSend.subscribe((eventData) => {
    system.run(async () => {
        let message = eventData.message;
        if(!message.startsWith(commandPrefix)) {return}
        
        let player =  eventData.sender // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame

        const msgSplit = message.split(" ")
        switch(msgSplit[0]){
            case ";;addLp":
                let combinedString = "";
                /**
                * @type {ModalFormResponse}
                */
                let formResult
                if(msgSplit.length == 1){
                    let attempts = 0;
                    player.sendMessage("Please close Chat to make the GUI appear!")
                    do{formResult = await Launchpad.gui.show(player); attempts++;await AwaitFunctions.waitTicks(5); Logger.log(formResult.cancelationReason, "Form Canceled")} while(attempts<10 && formResult.cancelationReason == "UserBusy");
                    if(formResult.canceled) {return;}

                    Logger.log("Form Recived!", "Form")
                if(formResult.canceled) {Logger.log(formResult.cancelationReason, "Form Canceled");return}
                Logger.log("Form Not Canceled", "Form")
                formResult.formValues.forEach((result) => {
                    if(typeof result != "string") {return}
                    const strSplit = result.split(" ")
                    strSplit.forEach((str) => {
                        if(isNaN(Number(msgSplit[1])))
                        combinedString = `${combinedString}${str} `
                    })
                    
                })
                Logger.log(combinedString, "FORM END")
                } else if(msgSplit.length == Launchpad.expectedValues + 1){
                    for(let i = 1; i < msgSplit.length; i++){
                        if(isNaN(Number(msgSplit[i]))) {player.sendMessage(`Expected Number! ${msgSplit[i]}`); return}
                        combinedString = `${combinedString}${msgSplit[i]} `
                    }
                } else{
                    player.sendMessage(`Expected ${Launchpad.expectedValues} Values | Or only type ;;addLaunchpad for GUI`)
                    return;
                }
                
                launchpads.addLaunchpad(combinedString)
                Logger.log(combinedString, "FORM END")
                
                break;
            case ";;removeLp":
                try{
                    if(msgSplit.length != 2) {throw("Expected split array of length 2")}
                    if(isNaN(Number(msgSplit[1]))) { throw("Not a Number! \nError: " + msgSplit[1]) }
                    let num = parseInt(msgSplit[1])
                    
                    
                    launchpads.removeLore(num)

                }
                catch(e){
                    player.sendMessage("Something went wrong \nYour command: §4" + message + "\n" + e)
                }
                break;

        }
    })
})
