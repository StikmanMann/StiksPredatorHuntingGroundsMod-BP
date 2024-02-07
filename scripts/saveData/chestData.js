var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ChestData_bookDatas;
import { world } from '@minecraft/server';
import { BookData } from "./bookData";
import { Logger } from '../staticScripts/Logger';
export { ChestData };
class ChestData {
    /**
     *
     * @param {import('@minecraft/server').Vector3} chestLocation
     */
    constructor(chestLocation) {
        /**
         * @type {BookData[]}
         */
        _ChestData_bookDatas.set(this, []);
        for (let i = 0; i < ChestData.slots; i++) {
            __classPrivateFieldGet(this, _ChestData_bookDatas, "f")[i] = new BookData(chestLocation, i);
        }
        this.updateLore();
    }
    getLore() {
        /**
         * @type {String[]}
         */
        let loreArray = [];
        for (const bookData of __classPrivateFieldGet(this, _ChestData_bookDatas, "f")) {
            loreArray = loreArray.concat(bookData.getLore());
        }
        return loreArray;
    }
    readLore() {
        for (const lore of this.getLore()) {
            world.sendMessage(lore);
        }
    }
    updateLore() { }
    addLore(lore) {
        for (const bookData of __classPrivateFieldGet(this, _ChestData_bookDatas, "f")) {
            if (bookData.getLore().length != BookData.maxLore) {
                bookData._addLore(lore);
                break;
            }
            else {
                Logger.log("You shouldnt see this message", "Add Lore");
            }
        }
    }
    removeLore(index) {
        let bookIndex = Math.floor(index / 20);
        index = index % 20;
        __classPrivateFieldGet(this, _ChestData_bookDatas, "f")[bookIndex].removeLore(index);
        this.updateLore();
    }
}
_ChestData_bookDatas = new WeakMap();
ChestData.slots = 27;
let testChest = new ChestData({ x: 0, y: -60, z: -5 });
