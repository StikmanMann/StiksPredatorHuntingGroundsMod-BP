import { ItemStack, system, world } from "@minecraft/server"
import { GlobalVars } from "../globalVars"
import { TickFunctions } from "../staticScripts/tickFunctions"
//import { sys } from "typescript"

class PlayerBoost{

    static playerBoostItem = new ItemStack("minecraft:feather")
    


    static init(){
        PlayerBoost.playerBoostItem.nameTag = "§lBoost" 
        //Add function to be run every 5 tick
        TickFunctions.addFunction(() => this.tick(), 5)
    }

    static tick(){
        for(const player of GlobalVars.players){

            if(player.hasTag("giveLauncher")){
                player.runCommand("clear @s feather")
                player.getComponent("inventory").container.setItem(0, PlayerBoost.playerBoostItem)
            }
        }
    }
}

PlayerBoost.init()

world.beforeEvents.itemUse.subscribe((eventData) => {
    system.run(() => {
        if(eventData.itemStack.nameTag != PlayerBoost.playerBoostItem.nameTag) {return;}
        const player = eventData.source
        const playerRotation = player.getRotation()
        player.applyKnockback(Math.sin((playerRotation.y) * (Math.PI / 180) *-1), Math.cos((playerRotation.y )  * (Math.PI / 180) *-1), 6 - Math.abs(playerRotation.x / 15), playerRotation.x/-45)
        //player.startItemCooldown("chorusfruit", 90)
        player.runCommand("clear @s feather")
    })
   
})