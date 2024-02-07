import { world, system, ItemStack,  EntityInventoryComponent,  ItemTypes,  ItemEnchantsComponent, Enchantment, BlockTypes, Dimension, Vector3 } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, ModalFormData } from "@minecraft/server-ui";
import {set, undo, redo, copy, paste} from "./commands";
import { ActionbarMessage, HudManager } from "../hud.js";

export {getPlayerObject}

function getPlayerObject(player){
    return activePlayers.get(player.name)
}

console.warn("playerCODESS");

import { setUi } from "./set.js"
import { replaceUi } from "./replace.js"



const commandPrefix = ";";

class PlayerClass {
    /**
     * @param {String} playerName 
     */

    name : string;
    dimension: Dimension;
    paintBlocks: any;
    paintReplace: any[];
    paintRange: number;
    blockArray: any[][];
    bL: any[][];
    affectedBlocks: any[];
    bL1: Vector3;
    bL2: Vector3;
    cBR: any;
    cloneBlockArray: any[];
    cBL: any[];
    index: number;
    tSLT: number;


    constructor(playerName) {
        /**
         * @type {String}
         */
        this.name = playerName;

        /**
         * @type {String}
         */
        this.paintBlocks;

        /**
         * @type {String[]}
         */
        this.paintReplace = [];

        this.paintRange = 0;

        /**
         * @type {import("@minecraft/server").BlockPermutation[][]}
         */
        this.blockArray = [[], [], [] , [], [] , [], [], [], []];

         /**
         * @type {import("@minecraft/server").Vector3[][]}
         */
         this.bL =  [[], [], [] , [], [] , [], [], [], []];

         /**
         * @type {number}
         */
         this.affectedBlocks =  [];
        
        /**
         * @type {import("@minecraft/server").Vector3}
         */
        this.bL1 = null;

        /**
         * @type {import("@minecraft/server").Vector3}
         */
        this.bL2 = null;

         /**
         * @alias cloneBlocksRoot
         * @type {import("@minecraft/server").Vector3}
         */
         this.cBR = null;

         /**
         * @type {import("@minecraft/server").BlockPermutation[]}
         */
        this.cloneBlockArray = [];

        /**
         * @alias cloneBlockLocation
        * @type {import("@minecraft/server").Vector3[]}
        */
        this.cBL =  [];

        /**
         * @type {import("@minecraft/server").Dimension}
         */
        this.dimension = null;

        this.index = 0;

          /**
         * @alias timeSinceLastTickForPaint
        */
        this.tSLT = 0;
    }

    static test() {
        console.warn("TEST");
    }

    // You can add methods here to interact with the class instance
};

const operation = new ActionFormData()
    .title("Choose an Operation")
    .button("Set Blocks")
    .button("Replace Blocks")
    .button("Copy selection")
    .button("Paste");

// A collection to store active player instances
const activePlayers = new Map(); 



//PLAYER CLASSES
{
    world.getAllPlayers().forEach(player => {
        const playerName = player.name;
        const playerInstance = new PlayerClass(playerName);
        activePlayers.set(playerName, playerInstance);
    });
    
    world.afterEvents.playerJoin.subscribe((eventData) => {
        const playerName = eventData.playerName;
        
        // Create a new instance of PlayerClass for the joining player
        const playerInstance = new PlayerClass(playerName);
        
        // Store the player instance in the collection
        activePlayers.set(playerName, playerInstance);
    });
    
    
    world.afterEvents.playerLeave.subscribe((eventData) => {
        const playerName = eventData.playerName;
        
        // Retrieve and remove the player instance from the collection
        const playerInstance = activePlayers.get(playerName);
        if (playerInstance) {
            // Perform any necessary cleanup or actions before deletion
            // For example: playerInstance.cleanup();
            
            activePlayers.delete(playerName);
        }
    });
};

/**
 * 
 * @param {import("@minecraft/server").Block} block 
 * @param {Number} blocksAffected 
 * @param {PlayerClass} playerInstance 
 */
function undoAdd(block, affectedBlocks, playerInstance, i){
    playerInstance.blockArray[playerInstance.index][i] = block.permutation;
    playerInstance.bL[playerInstance.index][i] = block.location;
    playerInstance.affectedBlocks[playerInstance.index] = affectedBlocks;
}

//SET POS
{
    world.beforeEvents.itemUse.subscribe(async (eventData) => {
        system.run(async () =>{
            const player = eventData.source;
            /**
             * @type {PlayerClass}
             */
            const playerInstance = activePlayers.get(player.name);
            const block = player.getBlockFromViewDirection().block;
            var blocksAffected;
        
        
            if (player.hasTag("admin") && eventData.itemStack.typeId == "minecraft:wooden_axe") {
                if(!player.isSneaking){
                    playerInstance.bL2 = block.location;
                    try {
                        blocksAffected = 
                        (Math.abs(Math.abs(playerInstance.bL1.x) - Math.abs(playerInstance.bL2.x)) + 1) * 
                        (Math.abs(Math.abs(playerInstance.bL1.y) - Math.abs(playerInstance.bL2.y)) + 1) * 
                        (Math.abs(Math.abs(playerInstance.bL1.z) - Math.abs(playerInstance.bL2.z)) + 1)
                    }
                    catch {
                        world.sendMessage(`§dSecond position set to ${block.location.x},  ${block.location.y},  ${block.location.z} `)
                        return;
                    }
                    world.sendMessage(`§dSecond position set to ${block.location.x},  ${block.location.y},  ${block.location.z} (${blocksAffected})`)
                }
                else {
                    const operationResult = await operation.show(player);
                    switch (operationResult.selection) {
                        case 0:
                            setUi(player);
                            break;
                        case 1:
                            replaceUi(player);
                            break;
                        case 2:
                            copy(player)
                            break;
                        case 3:
                            paste(player);
                    }
        
                }
            }
        })
        
    
    
        // Retrieve the player instance from the collection
    
       
    });
    
    world.afterEvents.playerBreakBlock.subscribe((eventData) => {
        const player = eventData.player;
        /**
         * @type {PlayerClass}
         */
        const playerInstance = activePlayers.get(player.name);
        const block = eventData.block;
        const blockRe = eventData.brokenBlockPermutation
    
    
        if (player.hasTag("admin") && player.hasTag("worldEdit")) {
    
            playerInstance.bL1 = block.location;
            try {
                var blocksAffected = 
                (Math.abs(Math.abs(playerInstance.bL1.x) - Math.abs(playerInstance.bL2.x)) + 1) * 
                (Math.abs(Math.abs(playerInstance.bL1.y) - Math.abs(playerInstance.bL2.y)) + 1) * 
                (Math.abs(Math.abs(playerInstance.bL1.z) - Math.abs(playerInstance.bL2.z)) + 1)
            }
            catch {
                player.sendMessage(`§dFirst position set to ${block.location.x},  ${block.location.y},  ${block.location.z}`)
                world.getDimension("overworld").fillBlocks(block.location, block.location, blockRe);
                return;
            }
            player.sendMessage(`§dFirst position set to ${block.location.x},  ${block.location.y},  ${block.location.z} (${blocksAffected})`)
            world.getDimension("overworld").fillBlocks(block.location, block.location, blockRe);
        
        }
    });
};

//COMMANDS
{
    world.beforeEvents.chatSend.subscribe((eventData) => {
        eventData.cancel = true;
        system.run(() => {
            const message = eventData.message;
            const player = eventData.sender;
            /**
            * @type {PlayerClass}
            */
            const playerInstance = activePlayers.get(player.name);
            playerInstance.dimension = player.dimension;

            if (!eventData.message.startsWith(commandPrefix)) {
                //world.sendMessage('§e' + player.nameTag + " §r" + message);
                return;
            }
            else{
                switch(message.split(" ")[0])
                {
                    case ";set":
                        if(message.split(" ").length < 2)
                        {
                            setUi(player)
                            return;
                        }
                        
                        if(!player.hasTag("worldEdit"))
                        {
                            player.playSound("note.bass")
                            player.sendMessage(`§dYou don't have permission to use this command!`)
                            return;
                        }
                        player.sendMessage(`§d${set(playerInstance, message)}`)
                        player.playSound("note.pling")
                        break;
                    case ";undo":
                        if(!player.hasTag("worldEdit"))
                        {
                            player.playSound("note.bass")
                            player.sendMessage(`§dYou don't have permission to use this command!`)
                            return;
                        }                            
                        player.sendMessage(`§d${undo(playerInstance)}`)
                        player.playSound("note.pling")
                        break;
                    case ";redo":
                        if(!player.hasTag("worldEdit"))
                        {
                            player.playSound("note.bass")
                            player.sendMessage(`§dYou don't have permission to use this command!`)
                            return;
                        }                            
                        player.sendMessage(`§d${redo(playerInstance)}`)
                        player.playSound("note.pling")
                        break;    
                    case ";copy":
                        if(!player.hasTag("worldEdit"))
                        {
                            player.playSound("note.bass")
                            player.sendMessage(`§dYou don't have permission to use this command!`)
                            return;
                        }                            
                        player.sendMessage(`§d${copy(playerInstance)}`)
                        player.playSound("note.pling")
                        break;
                    case ";paste":
                        if(!player.hasTag("worldEdit"))
                        {
                            player.playSound("note.bass")
                            player.sendMessage(`§dYou don't have permission to use this command!`)
                            return;
                        }                            
                        player.sendMessage(`§d${paste(playerInstance)}`)
                        player.playSound("note.pling")
                        break;
                    case ";wand":
                        if(!player.hasTag("admin"))
                        {
                            player.playSound("note.bass")
                            player.sendMessage(`§dYou don't have permission to use this command!`)
                            return;
                        }                            
                        player.addTag("worldEdit");
                        const wand = new ItemStack(ItemTypes.get("minecraft:wooden_axe"), 1)
                        wand.nameTag = "§dWand"
                        wand.setLore(["I hope your happy alivejy :D","+10 coolness"])
                        /**
                         * @type {ItemEnchantsComponent}
                         */
                        let enchants = wand.getComponent("enchantments")
                        enchants.enchantments.addEnchantment(new Enchantment("unbreaking", 3))
                        /**
                         * @type {EntityInventoryComponent}
                         */
                        let inventory = player.getComponent("inventory");
                        inventory.container.addItem(wand)
                        player.playSound("note.pling")
                        break;
                    case ";paint":
                        if(!player.hasTag("worldEdit"))
                        {
                            player.playSound("note.bass")
                            player.sendMessage(`§dYou don't have permission to use this command!`)
                            return;
                        }                            
                        playerInstance.paintReplace = [];
                        playerInstance.paintReplace = message.split(" ")[1].split(",")
                        playerInstance.paintBlocks = message.split(" ")[2]
                        playerInstance.paintRange = Number(message.split(" ")[3])
                        player.playSound("note.pling")
                        break;
                    default:
                       // player.playSound("note.bass")
                     //   player.sendMessage(`"${message.split(" ")[0]}" §d is not a valid command!`)
                        break;
                }
            }
        });
    });
};

world.beforeEvents.itemUseOn.subscribe((eventData) => {
    
    system.run(() =>{
        const player = eventData.source;
        const block = player.getBlockFromViewDirection();
        /**
        * @type {PlayerClass}
        */
        const playerInstance = activePlayers.get(player.name);
        if(playerInstance.tSLT < 6){
            return;
        }
        playerInstance.tSLT = 0;
        playerInstance.dimension = player.dimension;
        let blockLocation = player.getBlockFromViewDirection().block.location;
        let paintBlocksAffected = 0;
        
        // switch(block.face)
       // {
            
       // }
        //console.warn(`§d${block.face}`);
    
        if (player.hasTag("admin") == true, eventData.itemStack.typeId == "minecraft:wooden_pickaxe") {
            //console.warn("HAHA")
           // try {
                var percentMsgReplace = [];
                var blockMsgReplace = [];
    
                var paintBlocksSplit = playerInstance.paintBlocks.split(",");
                for (var i = 0; i < paintBlocksSplit.length; i++) {
                    if (paintBlocksSplit[i].search("%") == -1) {
                        paintBlocksSplit[i] = "100%" + paintBlocksSplit[i];
                    }
                }
                paintBlocksSplit.forEach(item =>
                    percentMsgReplace[percentMsgReplace.length] = Math.floor(item.split("%")[0])
                );
    
                paintBlocksSplit.forEach(item =>
                    blockMsgReplace[blockMsgReplace.length] = item.split("%")[1]
                );
    
    
                for (var xOffset = - playerInstance.paintRange; xOffset <= playerInstance.paintRange; xOffset++) {
                    //  player.sendMessage(`xOffset ${xOffset}`)
    
                    for (var yOffset = - playerInstance.paintRange; yOffset <= playerInstance.paintRange; yOffset++) {
                        //   player.sendMessage(`yOffset ${yOffset}`)
    
                        for (var zOffset = - playerInstance.paintRange; zOffset <= playerInstance.paintRange; zOffset++) {
                            //player.sendMessage(`zOffset ${zOffset}`)
                            var iCounterReplace = 0;
    
                            var offsetBlock = playerInstance.dimension.getBlock({x: blockLocation.x -xOffset,y: blockLocation.y -yOffset,z: blockLocation.z -zOffset});
    
                            let x = Math.round(Math.random() * 100);
                            if ("minecraft:" + playerInstance.paintReplace.find(item => "minecraft:" + item == offsetBlock.typeId) == offsetBlock.typeId) {
                                for (var i = 0; i < percentMsgReplace.length; i++) {
                                    //  world.sendMessage("" + percentMsgReplace.length)
                                    // world.sendMessage(`RNG: ${x} Contition <= ${(percentMsgReplace[i] + iCounterReplace)} and > ${iCounterReplace}`)
                                     if (x <= percentMsgReplace[i] + iCounterReplace && x >= iCounterReplace) {
                                        undoAdd(offsetBlock, paintBlocksAffected, playerInstance, paintBlocksAffected)
                                    
                                        paintBlocksAffected++;
                                        world.getDimension("overworld").fillBlocks(offsetBlock.location, offsetBlock.location, BlockTypes.get("minecraft:" + blockMsgReplace[i]));
    
                                    }
                                    iCounterReplace += percentMsgReplace[i];
                                }
                            }
    
                        }
    
                    }
                }
           // }
          //  catch
            {
    
            }
        }
    })
    
})

system.runInterval(()=>{
    try{
        world.getAllPlayers().forEach(player => {
            /**
             * @type {PlayerClass}
             */
            const playerInstance = activePlayers.get(player.name);
            playerInstance.tSLT++;
            const block = player.getBlockFromViewDirection().block;
            HudManager.addActionbarMessage(new ActionbarMessage(player, `§d${block.typeId} at x: ${block.location.x}  y: ${block.location.y}  z: ${block.location.z}`, 1))
            /**
             * @type {EntityInventoryComponent}
             */
            let inventory = player.getComponent("inventory");
            //world.sendMessage(inventory.container.getItem(player.selectedSlot).nameTag)
            if(inventory.container.getItem(player.selectedSlot).nameTag == "§dWand")
            {
                player.addTag("worldEdit")
            }
            else{
                player.removeTag("worldEdit")
            }
        })
    }
    catch{

    }
   
})

export{sortLength}

function sortLength(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = arr[0];
    const less = [];
    const greater = [];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i].length <= pivot.length) {
            less.push(arr[i]);
        } else {
            greater.push(arr[i]);
        }
    }

    return [...sortLength(less), pivot, ...sortLength(greater)];
}
