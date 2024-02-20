var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Launchpad_launchpadVarsArr;
import { ModalFormData } from "@minecraft/server-ui";
import { BookData } from "./saveData/bookData";
import { MolangVariableMap, system, world } from "@minecraft/server";
import { Logger } from "./staticScripts/Logger";
import { AwaitFunctions } from "./staticScripts/awaitFunctions";
import { CollisionFunctions } from "./staticScripts/collisionFunctions";
import { VectorFunctions } from "./staticScripts/vectorFunctions";
import { GlobalVars } from "./globalVars";
import { TickFunctions } from "./staticScripts/tickFunctions";
import { DebugOptions } from "./debugging/debugCommands";
import { addActionbarMessage } from "hud";
class LaunchpadVars {
    /**
     *
     * @param {String} str
     */
    constructor(str) {
        let splitStr = str.split(" ");
        this.startLoc = { x: Number(splitStr[0]), y: Number(splitStr[1]), z: Number(splitStr[2]) };
        this.endLoc = { x: Number(splitStr[3]), y: Number(splitStr[4]), z: Number(splitStr[5]) };
        this.angle = Number(splitStr[6]);
        this.horizontalPower = Number(splitStr[7]);
        this.verticalPower = Number(splitStr[8]);
    }
}
class Launchpad extends BookData {
    constructor(chestLocation, slot) {
        super(chestLocation, slot);
        /**
         * @type {LaunchpadVars[]}
         */
        _Launchpad_launchpadVarsArr.set(this, []
        /**
         * @type {MolangVariableMap}
         * */
        );
        /**
         * @type {MolangVariableMap}
         * */
        this.molangVars = new MolangVariableMap()
            .setColorRGBA("variable.color", { red: 255, green: 0, blue: 255, alpha: 255 });
        TickFunctions.addFunction(() => this.tick(), 5);
    }
    tick() {
        for (let i = 0; i < __classPrivateFieldGet(this, _Launchpad_launchpadVarsArr, "f").length; i++) {
            const launchpadVars = __classPrivateFieldGet(this, _Launchpad_launchpadVarsArr, "f")[i];
            for (const player of GlobalVars.players) {
                //world.sendMessage(`${CollisionFunctions.insideBox(player.location, launchpadVars.startLoc, launchpadVars.endLoc)}`)
                if (CollisionFunctions.insideBox(player.location, launchpadVars.startLoc, launchpadVars.endLoc, true, this.molangVars)) {
                    let playerVel = player.getVelocity();
                    let speed = VectorFunctions.vectorLength({ x: playerVel.x, y: 0, z: playerVel.z });
                    if (speed < 1) {
                        //world.sendMessage(`${speed}`)
                        player.playSound("firework.launch");
                        if (DebugOptions.debug) {
                            addActionbarMessage({ player: player, message: `DEBUG - Launchpad ${i} with angle ${launchpadVars.angle}`, lifetime: 40 });
                        }
                        player.applyKnockback(Math.cos(launchpadVars.angle * (Math.PI / 180)), Math.sin(launchpadVars.angle * (Math.PI / 180)), launchpadVars.horizontalPower, launchpadVars.verticalPower);
                    }
                }
            }
        }
    }
    updateLore() {
        //  super.readLore()
        __classPrivateFieldSet(this, _Launchpad_launchpadVarsArr, [], "f");
        let currentLore = this._loreItem.getLore();
        for (let i = 0; i < currentLore.length; i++) {
            let splitCoordinates = currentLore[i].split(" ");
            __classPrivateFieldGet(this, _Launchpad_launchpadVarsArr, "f")[i] = new LaunchpadVars(currentLore[i]);
            //world.sendMessage(`${this.#checkpoints[i].x} ${this.#checkpoints[i].y} ${this.#checkpoints[i].z}`)
        }
    }
    addLaunchpad(newLaunchpad) {
        this._addLore(newLaunchpad);
        this.updateLore();
    }
}
_Launchpad_launchpadVarsArr = new WeakMap();
Launchpad.gui = new ModalFormData()
    .title("Cool GUI for launchpad Creation")
    .textField("Starting Coords of Hitbox", "For example: 30 -60 10")
    .textField("Ending Coords of Hitbox", "For example: 25 -55 15")
    .textField("Rotation of launch\n(0° =  x=1, z=0 | 90° =  x=0, z=1)", "For example: 90")
    .textField("Strength Horizontal and Vertical", "For Example: 10 20");
Launchpad.expectedValues = 9;
let launchpads = new Launchpad({ x: 0, y: -60, z: 0 }, 2);
const commandPrefix = ";;";
world.afterEvents.buttonPush.subscribe(async (eventData) => {
    const formResult = await Launchpad.gui.show(eventData.source); //Apparently an entity can also push buttons but lol
    Logger.log("Form Recived!", "Form");
    if (formResult.canceled) {
        Logger.log(formResult.cancelationReason, "Form Canceled");
        return;
    }
    Logger.log("Form Not Canceled", "Form");
    let resultsString = "";
    formResult.formValues.forEach((result) => {
        if (typeof result != "string") {
            return;
        }
        const strSplit = result.split(" ");
        strSplit.forEach((str) => {
            if (isNaN(Number(str))) {
                return;
            }
            resultsString = `${resultsString}${str} `;
        });
    });
    Logger.log(resultsString, "FORM END");
});
world.beforeEvents.chatSend.subscribe((eventData) => {
    system.run(async () => {
        let message = eventData.message;
        if (!message.startsWith(commandPrefix)) {
            return;
        }
        let player = eventData.sender; // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame
        const msgSplit = message.split(" ");
        switch (msgSplit[0]) {
            case ";;addLp":
                let combinedString = "";
                /**
                * @type {ModalFormResponse}
                */
                let formResult;
                if (msgSplit.length == 1) {
                    let attempts = 0;
                    player.sendMessage("Please close Chat to make the GUI appear!");
                    do {
                        formResult = await Launchpad.gui.show(player);
                        attempts++;
                        await AwaitFunctions.waitTicks(5);
                        Logger.log(formResult.cancelationReason, "Form Canceled");
                    } while (attempts < 10 && formResult.cancelationReason == "UserBusy");
                    if (formResult.canceled) {
                        return;
                    }
                    Logger.log("Form Recived!", "Form");
                    if (formResult.canceled) {
                        Logger.log(formResult.cancelationReason, "Form Canceled");
                        return;
                    }
                    Logger.log("Form Not Canceled", "Form");
                    formResult.formValues.forEach((result) => {
                        if (typeof result != "string") {
                            return;
                        }
                        const strSplit = result.split(" ");
                        strSplit.forEach((str) => {
                            if (isNaN(Number(msgSplit[1])))
                                combinedString = `${combinedString}${str} `;
                        });
                    });
                    Logger.log(combinedString, "FORM END");
                }
                else if (msgSplit.length == Launchpad.expectedValues + 1) {
                    for (let i = 1; i < msgSplit.length; i++) {
                        if (isNaN(Number(msgSplit[i]))) {
                            player.sendMessage(`Expected Number! ${msgSplit[i]}`);
                            return;
                        }
                        combinedString = `${combinedString}${msgSplit[i]} `;
                    }
                }
                else {
                    player.sendMessage(`Expected ${Launchpad.expectedValues} Values | Or only type ;;addLaunchpad for GUI`);
                    return;
                }
                launchpads.addLaunchpad(combinedString);
                Logger.log(combinedString, "FORM END");
                break;
            case ";;removeLp":
                try {
                    if (msgSplit.length != 2) {
                        throw ("Expected split array of length 2");
                    }
                    if (isNaN(Number(msgSplit[1]))) {
                        throw ("Not a Number! \nError: " + msgSplit[1]);
                    }
                    let num = parseInt(msgSplit[1]);
                    launchpads.removeLore(num);
                }
                catch (e) {
                    player.sendMessage("Something went wrong \nYour command: §4" + message + "\n" + e);
                }
                break;
        }
    });
});
