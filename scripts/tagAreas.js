var _a;
import { ModalFormData } from "@minecraft/server-ui";
import { MolangVariableMap, system, world } from "@minecraft/server";
import { Logger } from "./staticScripts/Logger";
import { CollisionFunctions } from "./staticScripts/collisionFunctions";
import { GlobalVars } from "./globalVars";
import { TickFunctions } from "./staticScripts/tickFunctions";
import { DebugOptions } from "./debugging/debugCommands";
;
import { WorldData } from "saveData/worldData";
import { addActionbarMessage } from "hud";
import { DataType } from "dataTypes/dataTypeHud";
import { showHUD } from "staticScripts/commandFunctions";
class TagVars {
    /**
     *
     * @param {String} str
     */
    constructor(str) {
        let splitStr = str.split(" ");
        this.startLoc = { x: Number(splitStr[0]), y: Number(splitStr[1]), z: Number(splitStr[2]) };
        this.endLoc = { x: Number(splitStr[3]), y: Number(splitStr[4]), z: Number(splitStr[5]) };
        this.tag = splitStr[6];
    }
}
class TagArea extends WorldData {
    constructor(saveId, loggerId, scorebaordName) {
        super(saveId, loggerId, scorebaordName, [{ dataType: DataType.vector, example: "30 -60 10", tooltip: "Starting Coords of Hitbox" }, { dataType: DataType.vector, example: "25 -55 15", tooltip: "Ending Coords of Hitbox" }, { dataType: DataType.string, example: "wallJump", tooltip: "Your tag" }]);
        /**
         * @type {TagVars[]}
         */
        this.tagVarsArr = [];
        /**
         * @type {MolangVariableMap}
         * */
        this.molangVars = new MolangVariableMap()
            .setColorRGBA("variable.color", { red: 255, green: 0, blue: 255, alpha: 255 });
        TickFunctions.addFunction(() => this.tick(), 5);
    }
    tick() {
        for (const player of GlobalVars.players) {
            let tags = new Set(player.getTags());
            this.tagVarsArr.forEach((tagVars, i) => {
                if (CollisionFunctions.insideBox(player.location, tagVars.startLoc, tagVars.endLoc, true, "minecraft:basic_flame_particle")) {
                    if (DebugOptions.debug) {
                        addActionbarMessage({ player: player, message: `DEBUG - In area ${i} with Tag ${tagVars.tag}`, lifetime: 5 });
                    }
                    player.addTag(tagVars.tag);
                    tags.delete(tagVars.tag);
                }
            });
            const unwantedTags = _a.unwantedTags;
            if (player.hasTag("predator")) {
                unwantedTags.push("treeJump");
            }
            unwantedTags.forEach(tag => {
                tags.delete(tag);
            });
            tags.forEach(tag => {
                player.removeTag(tag);
            });
        }
    }
    //updateLore(){
    //  super.readLore()
    //    AwaitFunctions.doAttempts(10, 30, () => { 
    //        this.tagVarsArr = []
    //        let currentLore = this.getLore()
    //         for(let i = 0; i < currentLore.length; i++){
    //           let splitCoordinates = currentLore[i].split(" ")
    //            this.tagVarsArr[i] = new TagVars(currentLore[i])
    //world.sendMessage(`${this.#checkpoints[i].x} ${this.#checkpoints[i].y} ${this.#checkpoints[i].z}`)
    //       }
    //   })
    //}
    addTagArea(newTagArea) {
        this.addData(newTagArea);
        this.readData();
    }
    updateData() {
        super.updateData();
        this.tagVarsArr = [];
        this.worldData.forEach((data, index) => {
            this.tagVarsArr[index] = new TagVars(data);
        });
    }
}
_a = TagArea;
TagArea.knownTags = ["wallJump", "giveLauncher", "treeJump"];
TagArea.unwantedTags = ["Admin", "worldEdit", "predator", "admin", "survivor"];
TagArea.gui = new ModalFormData()
    .title("Cool GUI for TagArea Creation")
    .textField("Starting Coords of Hitbox", "For example: 30 -60 10")
    .textField("Ending Coords of Hitbox", "For example: 25 -55 15")
    .dropdown("Known Tags (GUI doesnt support custom Tags)", _a.knownTags);
const overworld = world.getDimension("overworld");
const commandPrefix = ";;";
let tagArea = new TagArea("tagArea", "TagArea", "TagArea");
world.beforeEvents.chatSend.subscribe((eventData) => {
    system.run(async () => {
        let message = eventData.message;
        if (!message.startsWith(commandPrefix)) {
            return;
        }
        let player = eventData.sender; // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame
        const msgSplit = message.split(" ");
        switch (msgSplit[0]) {
            case ";;addTagArea":
                let combinedString = "";
                /**
                * @type {ModalFormResponse}
                */
                if (msgSplit.length == 1) {
                    let attempts = 0;
                    player.sendMessage("Please close Chat to make the GUI appear!");
                    let formResult = await showHUD(player, TagArea.gui);
                    if (formResult.canceled) {
                        return;
                    }
                    Logger.log("Form Recived!", "Form");
                    if (formResult.canceled) {
                        Logger.log(formResult.cancelationReason, "Form Canceled");
                        return;
                    }
                    Logger.log("Form Not Canceled", "Form");
                    for (let i = 0; i < formResult.formValues.length; i++) {
                        const result = formResult.formValues[i];
                        if (typeof result != "string") {
                            return;
                        }
                        if (i == 3) {
                            combinedString = `${combinedString}${result} `;
                            break;
                        }
                        const strSplit = result.split(" ");
                        for (const str of strSplit) {
                            if (isNaN(parseInt(str))) {
                                player.sendMessage(`Expected Number! ${str}`);
                                return;
                            }
                            combinedString = `${combinedString}${str} `;
                        }
                    }
                    Logger.log(combinedString, "FORM END");
                }
                else if (msgSplit.length == tagArea.expectedValues + 1) {
                    for (let i = 1; i < msgSplit.length; i++) {
                        if (i == tagArea.expectedValues) {
                            combinedString = `${combinedString}${msgSplit[i]} `;
                            break;
                        }
                        if (isNaN(parseInt(msgSplit[i]))) {
                            player.sendMessage(`Expected Number! ${msgSplit[i]}`);
                            return;
                        }
                        combinedString = `${combinedString}${msgSplit[i]} `;
                    }
                }
                else {
                    player.sendMessage(`Expected ${tagArea.expectedValues} Values | Or only type ;;addTagArea for GUI`);
                    return;
                }
                tagArea.addTagArea(combinedString);
                Logger.log(combinedString, "FORM END");
                break;
            case ";;removeTagArea":
                try {
                    if (msgSplit.length != 2) {
                        throw ("Expected split array of length 2");
                    }
                    if (isNaN(parseInt(msgSplit[1]))) {
                        throw ("Not a Number! \nError: " + msgSplit[1]);
                    }
                    tagArea.removeData(parseInt(msgSplit[1]));
                }
                catch (e) {
                    player.sendMessage("Something went wrong \nYour command: §4" + message + "\n" + e);
                }
                break;
        }
    });
});
