import {world, system, Player, BlockPermutation, Block, Container, BlockInventoryComponent, ItemStack, ItemTypes, Vector} from '@minecraft/server';
import { BookData } from "./saveData/bookData";
import { ScoreboardFunctions } from './staticScripts/scoreboardFunctions';
export {customName}

const overworld = world.getDimension("overworld")

class CustomNames extends BookData{
    /**
     * @type {Map<String, String>}
     */
    #nameMap = new Map()
    
    
     
    _init(){

        this._loreItem.getLore().forEach(lore => {
            let namesSplit = lore.split(" ")
            this.#nameMap.set(namesSplit[0], namesSplit[1])
        })
        world.getAllPlayers().forEach(player => {
            if(this.#nameMap.has(player.name)){
                //world.sendMessage(this.#nameMap.get(player.name))
                if(player.nameTag != this.#nameMap.get(player.name)){
                    ScoreboardFunctions.nameChange(player.nameTag, this.#nameMap.get(player.name))
                }
               
                player.nameTag = this.#nameMap.get(player.name)
               
            }
        })
        
    }
    /**
     * @param {Player} player
     */
    changeName(player, newName){
        system.run(() => {
            this.#nameMap.set(player.name, newName)
            this.getLore().forEach(str => this.removeLore(0))
            for (const [key, value] of this.#nameMap) { // Using the default iterator (could be `map.entries()` instead)
               // world.sendMessage(`The value for key ${key} is ${value}`);
                
                this._addLore(`${key} ${value}`)
                
            }
            if(player.nameTag != this.#nameMap.get(player.name)){
                ScoreboardFunctions.nameChange(player.nameTag, this.#nameMap.get(player.name))
            }
           
            player.nameTag = this.#nameMap.get(player.name)
        })
        
    }
    /**
     * 
     * @param {Player} player
     */
    playerJoin(player){
        return new Promise((resolve) => { 
            system.run(async () => {
                if(this.#nameMap.has(player.name)){
                    //world.sendMessage(this.#nameMap.get(player.name))
                
                    player.nameTag = this.#nameMap.get(player.name)   
                }
                resolve(null);
            })
        })
       
    }

}

let customName = new CustomNames({x:0, y:-60, z:0}, 1)

const commandPrefix = ";;";
/* world.afterEvents.playerJoin.subscribe((eventData) => {
    customName.playerJoin(eventData.playerName)
}) */

world.beforeEvents.chatSend.subscribe((eventData) => {
    let message = eventData.message;
    if(!message.startsWith(commandPrefix)) {return}
    
    let player =  eventData.sender // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame
    let msgSplit = message.split(" ")
    switch (msgSplit[0]) {
        case ';;switchName':
            if (!player.hasTag('Admin') && !player.isOp()) return;
            eventData.cancel = true;
            let newCustomName = message.slice(msgSplit[0].length + 1)
       
            customName.changeName(player, newCustomName)
            player.runCommandAsync('tell @s Your nametag has been updated to: ' + player.nameTag);
            break;
        default:
            eventData.cancel = true;
            player.runCommandAsync('tell @s ' + eventData.message + ' is not a valid cmd');
    }
})
