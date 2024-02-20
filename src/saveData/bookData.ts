import { world, system, Player, ItemTypes, ItemStack}from '@minecraft/server';
import { VectorFunctions } from "../staticScripts/vectorFunctions";
import { Logger } from '../staticScripts/Logger';
export {BookData}
class BookData {
    static overworld = world.getDimension("overworld");

    static maxLore = 20

    /**
     * @type {Block}
     */
    #chest;

    /**
     * @type {BlockInventoryComponent}
     */
    #chestContainer;

    /**
     * @type {ItemStack}
     */
    _loreItem;

    /**
     * @type {number}
     */
    _slot;

    

    /**
     * 
     * @param {import('@minecraft/server').Vector3} chestLocation 
     * @param {number} slot 
     */
    constructor(chestLocation, slot) {
        system.run(async () => {
            this._slot = slot;
            await this.#waitForWorld(chestLocation);

            if (BookData.overworld.getBlock(chestLocation).permutation.type.id == "minecraft:barrel") {
                //Logger.log("Chest already there", Object.name);
                this.#chest = BookData.overworld.getBlock(chestLocation);
                this.#chestContainer = this.#chest.getComponent("minecraft:inventory");
                try {
                    if (this.#chestContainer.container.getItem(this._slot).typeId == "minecraft:book") {
                        this._loreItem = this.#chestContainer.container.getItem(this._slot);
                    } else {
                        throw "";
                    }
                } catch {
                    //Logger.log("No book in chest creating new one!", "Book Data");
                    let book = new ItemStack(ItemTypes.get("book"));
                    this.#chestContainer.container.setItem(this._slot, book);
                    this._loreItem = this.#chestContainer.container.getItem(this._slot);
                }
            } else {
                //BookData("Setting up chest");
                BookData.overworld.fillBlocks(chestLocation, chestLocation, "minecraft:barrel");
                this.#chest = BookData.overworld.getBlock(chestLocation);
                this.#chestContainer = this.#chest.getComponent("minecraft:inventory");
                this.#chestContainer.container.setItem(this._slot, new ItemStack(ItemTypes.get("minecraft:book")));

                this._loreItem = this.#chestContainer.container.getItem(this._slot);
            }
            this._init();
            this.updateLore()
        });
    }
    updateLore(){}
    _init() {}

    /**
     * 
     * @param {Vector3} chestLocation 
     */
    #waitForWorld(chestLocation) {
        return new Promise((resolve) => {
            const worldLoad = system.runInterval(async () => {
                try {
                    //console.warn(`Book - Trying to access block at ${VectorFunctions.vectorToString(chestLocation)}`);
                    if (BookData.overworld.getBlock(chestLocation)) {
                        //console.warn(`Success to access block at ${VectorFunctions.vectorToString(chestLocation)}`);
                        resolve(null);
                        system.clearRun(worldLoad);
                    }
                } catch {
                    //console.warn(`Failed to access block at ${VectorFunctions.vectorToString(chestLocation)}`);
                }
            }, 20);
        });
    }

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

        this.#chestContainer.container.setItem(this._slot, this._loreItem);
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
        this.#chestContainer.container.setItem(this._slot, this._loreItem);
        this.readLore();
        this.updateLore()
    }
}

