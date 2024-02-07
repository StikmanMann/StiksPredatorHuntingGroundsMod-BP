import {world, system, Player} from '@minecraft/server';
import { BookData } from "./bookData";
import { AwaitFunctions } from '../staticScripts/awaitFunctions';
import { Logger } from '../staticScripts/Logger';
export {ChestData}
class ChestData{
    /**
     * @type {BookData[]}
     */ 
    #bookDatas = []

    static slots = 27
    /**
     * 
     * @param {import('@minecraft/server').Vector3} chestLocation 
     */
    constructor(chestLocation){
        for(let i = 0; i < ChestData.slots;i++){
            this.#bookDatas[i] = new BookData(chestLocation, i)
        }
        this.updateLore()
    }

    getLore(){
        /**
         * @type {String[]}
         */
        let loreArray = []
        for(const bookData of this.#bookDatas){
            loreArray = loreArray.concat(bookData.getLore())
        }
        return loreArray;
    }

    readLore(){
        for(const lore of this.getLore()){
            world.sendMessage(lore)
        }
    }

    updateLore(){}

    addLore(lore){
        for(const bookData of this.#bookDatas){
            if(bookData.getLore().length != BookData.maxLore){
                bookData._addLore(lore)
                break;
            } else{
                Logger.log("You shouldnt see this message", "Add Lore")
            }
        }
    }

    removeLore(index){
        let bookIndex = Math.floor(index / 20)
        index = index % 20

        this.#bookDatas[bookIndex].removeLore(index)
        this.updateLore()
    }
}

let testChest = new ChestData({x:0, y:-60, z:-5})


