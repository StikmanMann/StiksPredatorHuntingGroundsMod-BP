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
var _BookData_instances, _a, _BookData_chest, _BookData_chestContainer, _BookData_waitForWorld;
import { world, system, ItemTypes, ItemStack } from '@minecraft/server';
export { BookData };
class BookData {
    /**
     *
     * @param {import('@minecraft/server').Vector3} chestLocation
     * @param {number} slot
     */
    constructor(chestLocation, slot) {
        _BookData_instances.add(this);
        /**
         * @type {Block}
         */
        _BookData_chest.set(this, void 0);
        /**
         * @type {BlockInventoryComponent}
         */
        _BookData_chestContainer.set(this, void 0);
        system.run(async () => {
            this._slot = slot;
            await __classPrivateFieldGet(this, _BookData_instances, "m", _BookData_waitForWorld).call(this, chestLocation);
            if (_a.overworld.getBlock(chestLocation).permutation.type.id == "minecraft:barrel") {
                //Logger.log("Chest already there", Object.name);
                __classPrivateFieldSet(this, _BookData_chest, _a.overworld.getBlock(chestLocation), "f");
                __classPrivateFieldSet(this, _BookData_chestContainer, __classPrivateFieldGet(this, _BookData_chest, "f").getComponent("minecraft:inventory"), "f");
                try {
                    if (__classPrivateFieldGet(this, _BookData_chestContainer, "f").container.getItem(this._slot).typeId == "minecraft:book") {
                        this._loreItem = __classPrivateFieldGet(this, _BookData_chestContainer, "f").container.getItem(this._slot);
                    }
                    else {
                        throw "";
                    }
                }
                catch {
                    //Logger.log("No book in chest creating new one!", "Book Data");
                    let book = new ItemStack(ItemTypes.get("book"));
                    __classPrivateFieldGet(this, _BookData_chestContainer, "f").container.setItem(this._slot, book);
                    this._loreItem = __classPrivateFieldGet(this, _BookData_chestContainer, "f").container.getItem(this._slot);
                }
            }
            else {
                //BookData("Setting up chest");
                _a.overworld.fillBlocks(chestLocation, chestLocation, "minecraft:barrel");
                __classPrivateFieldSet(this, _BookData_chest, _a.overworld.getBlock(chestLocation), "f");
                __classPrivateFieldSet(this, _BookData_chestContainer, __classPrivateFieldGet(this, _BookData_chest, "f").getComponent("minecraft:inventory"), "f");
                __classPrivateFieldGet(this, _BookData_chestContainer, "f").container.setItem(this._slot, new ItemStack(ItemTypes.get("minecraft:book")));
                this._loreItem = __classPrivateFieldGet(this, _BookData_chestContainer, "f").container.getItem(this._slot);
            }
            this._init();
            this.updateLore();
        });
    }
    updateLore() { }
    _init() { }
    /**
     *
     * @param {number} index
     * @returns
     */
    readLore() {
        this._loreItem.getLore().forEach((lore) => {
            world.sendMessage(lore);
        });
    }
    getLore() {
        return this._loreItem.getLore();
    }
    /**
     *
     * @param {Vector3} newCp
     */
    addCp(newCp) {
        this._addLore(`${newCp.x} ${newCp.y} ${newCp.z}`);
    }
    /**
     *
     * @param {String} newLore
     */
    _addLore(newLore) {
        /**
         * @type {String[]}
         */
        let newLoreArr = [newLore];
        /**
         * @type {String[]}
         */
        let currentLore = this._loreItem.getLore();
        let combinedLore = currentLore.concat(newLoreArr);
        combinedLore.forEach((element) => {
            console.warn(element);
        });
        this._loreItem.setLore(combinedLore);
        __classPrivateFieldGet(this, _BookData_chestContainer, "f").container.setItem(this._slot, this._loreItem);
        this.readLore();
    }
    /**
     *
     * @param {number} cpIndex
     */
    removeLore(index) {
        let currentLore = this._loreItem.getLore();
        let removedLore = currentLore.filter(existingPlayer => existingPlayer !== currentLore[index]);
        this._loreItem.setLore(removedLore);
        __classPrivateFieldGet(this, _BookData_chestContainer, "f").container.setItem(this._slot, this._loreItem);
        this.readLore();
        this.updateLore();
    }
}
_a = BookData, _BookData_chest = new WeakMap(), _BookData_chestContainer = new WeakMap(), _BookData_instances = new WeakSet(), _BookData_waitForWorld = function _BookData_waitForWorld(chestLocation) {
    return new Promise((resolve) => {
        const worldLoad = system.runInterval(async () => {
            try {
                //console.warn(`Book - Trying to access block at ${VectorFunctions.vectorToString(chestLocation)}`);
                if (_a.overworld.getBlock(chestLocation)) {
                    //console.warn(`Success to access block at ${VectorFunctions.vectorToString(chestLocation)}`);
                    resolve(null);
                    system.clearRun(worldLoad);
                }
            }
            catch {
                //console.warn(`Failed to access block at ${VectorFunctions.vectorToString(chestLocation)}`);
            }
        }, 20);
    });
};
BookData.overworld = world.getDimension("overworld");
BookData.maxLore = 20;
