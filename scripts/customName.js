var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CustomNames_nameMap;
import { world, system } from '@minecraft/server';
import { BookData } from "./saveData/bookData";
import { ScoreboardFunctions } from './staticScripts/scoreboardFunctions';
export { customName };
const overworld = world.getDimension("overworld");
class CustomNames extends BookData {
    constructor() {
        super(...arguments);
        /**
         * @type {Map<String, String>}
         */
        _CustomNames_nameMap.set(this, new Map());
    }
    _init() {
        this._loreItem.getLore().forEach(lore => {
            let namesSplit = lore.split(" ");
            __classPrivateFieldGet(this, _CustomNames_nameMap, "f").set(namesSplit[0], namesSplit[1]);
        });
        world.getAllPlayers().forEach(player => {
            if (__classPrivateFieldGet(this, _CustomNames_nameMap, "f").has(player.name)) {
                //world.sendMessage(this.#nameMap.get(player.name))
                if (player.nameTag != __classPrivateFieldGet(this, _CustomNames_nameMap, "f").get(player.name)) {
                    ScoreboardFunctions.nameChange(player.nameTag, __classPrivateFieldGet(this, _CustomNames_nameMap, "f").get(player.name));
                }
                player.nameTag = __classPrivateFieldGet(this, _CustomNames_nameMap, "f").get(player.name);
            }
        });
    }
    /**
     * @param {Player} player
     */
    changeName(player, newName) {
        system.run(() => {
            __classPrivateFieldGet(this, _CustomNames_nameMap, "f").set(player.name, newName);
            this.getLore().forEach(str => this.removeLore(0));
            for (const [key, value] of __classPrivateFieldGet(this, _CustomNames_nameMap, "f")) { // Using the default iterator (could be `map.entries()` instead)
                // world.sendMessage(`The value for key ${key} is ${value}`);
                this._addLore(`${key} ${value}`);
            }
            if (player.nameTag != __classPrivateFieldGet(this, _CustomNames_nameMap, "f").get(player.name)) {
                ScoreboardFunctions.nameChange(player.nameTag, __classPrivateFieldGet(this, _CustomNames_nameMap, "f").get(player.name));
            }
            player.nameTag = __classPrivateFieldGet(this, _CustomNames_nameMap, "f").get(player.name);
        });
    }
    /**
     *
     * @param {Player} player
     */
    playerJoin(player) {
        return new Promise((resolve) => {
            system.run(async () => {
                if (__classPrivateFieldGet(this, _CustomNames_nameMap, "f").has(player.name)) {
                    //world.sendMessage(this.#nameMap.get(player.name))
                    player.nameTag = __classPrivateFieldGet(this, _CustomNames_nameMap, "f").get(player.name);
                }
                resolve(null);
            });
        });
    }
}
_CustomNames_nameMap = new WeakMap();
let customName = new CustomNames({ x: 0, y: -60, z: 0 }, 1);
const commandPrefix = ";;";
/* world.afterEvents.playerJoin.subscribe((eventData) => {
    customName.playerJoin(eventData.playerName)
}) */
world.beforeEvents.chatSend.subscribe((eventData) => {
    let message = eventData.message;
    if (!message.startsWith(commandPrefix)) {
        return;
    }
    let player = eventData.sender; // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame
    let msgSplit = message.split(" ");
    switch (msgSplit[0]) {
        case ';;switchName':
            if (!player.hasTag('Admin') && !player.isOp())
                return;
            eventData.cancel = true;
            let newCustomName = message.slice(msgSplit[0].length + 1);
            customName.changeName(player, newCustomName);
            player.runCommandAsync('tell @s Your nametag has been updated to: ' + player.nameTag);
            break;
        default:
            eventData.cancel = true;
            player.runCommandAsync('tell @s ' + eventData.message + ' is not a valid cmd');
    }
});
