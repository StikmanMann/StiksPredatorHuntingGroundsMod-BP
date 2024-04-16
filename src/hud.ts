import {world, system, Player, BlockPermutation, Block, Container, BlockInventoryComponent, ItemStack, ItemTypes, Vector3} from '@minecraft/server';
import { ScoreboardFunctions } from './staticScripts/scoreboardFunctions';
//import { oldParkour } from './checkpoints';
import { CollisionFunctions } from './staticScripts/collisionFunctions';
import { VectorFunctions } from './staticScripts/vectorFunctions';
import { Logger } from './staticScripts/Logger';
import { GlobalVars } from './globalVars';
import { TickFunctions } from './staticScripts/tickFunctions';
import { LinkedList } from 'dataTypes/linkedList';
//import { listenerCount } from 'gulp';

export interface IActionbarMessage{
    player: Player
    message: String
    /**How many ticks to show this message */
    lifetime: number
}

let actionbarMessages = new LinkedList<IActionbarMessage>();

TickFunctions.addFunction(() => tick(), 1)

let centerFiller = 0;
const tick = () => {
    for(const player of GlobalVars.players){
        //world.sendMessage(`Showing ${player} with ${actionbarMessages.size} messages`)
        let combiendMessage = ""
        let maxLength = 0 

        actionbarMessages.forEach((actionbarMessage, index) => {
            if(!(actionbarMessage.player.name == player.name)){
                return;
            }
            
            centerFiller = Math.ceil((maxLength - actionbarMessage.message.length) / 2)

                //world.sendMessage(""+maxLength + " T: " + actionbarMessages[i].message.length + " A: " + addSpace)
            for(let i = 0; i < centerFiller; i++){
                combiendMessage = `${combiendMessage} `
            }

            combiendMessage = `${combiendMessage}${actionbarMessage.message}\n`
            actionbarMessage.lifetime--;
            if(actionbarMessage.lifetime < 1){
                actionbarMessages.deleteNodeByIndex(index)
            }
            
        })
        player.onScreenDisplay.setActionBar(combiendMessage)
    }
}      
    
    /**
     * 
     * @param {actionbarMessage} actionbarMessage
     */
export const addActionbarMessage = (actionbarMessage : IActionbarMessage) => {
    actionbarMessages.append(actionbarMessage)
}

for(const player of world.getAllPlayers()){
    world.sendMessage(`§a§lHud initalised!`)
    addActionbarMessage({player: player, message:`§a§lHud initalised!`, lifetime: 100})
}

