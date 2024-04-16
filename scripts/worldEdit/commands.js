import { world, system, BlockTypes } from "@minecraft/server";
import { getPlayerObject, undoSave } from "./mainEdit";
import { addCommand } from "staticScripts/commandFunctions";
export { set, undo, redo, copy, paste };
/**
 *
 * @param {import("@minecraft/server").Block} block
 * @param {Number} blocksAffected
 * @param {PlayerClass} playerInstance
 *
function undoAdd(block, affectedBlocks, playerInstance, i){
    playerInstance.bLockArray[playerInstance.index][i] = block.permutation;
    playerInstance.bL[playerInstance.index][i] = block.location;
    playerInstance.affectedBlocks[playerInstance.index] = affectedBlocks;
}
*/
/**
 * @returns {String}
 * @param {PlayerClass} playerInstance
 * @param {String} message
 */
function copy(playerInstance) {
    system.run(() => {
        playerInstance.cBR = null;
        playerInstance.cloneBlockArray = [];
        playerInstance.cBL = [];
        const bL1 = playerInstance.bL1;
        const bL2 = playerInstance.bL2;
        const lenghtX = (Math.abs(bL1.x - bL2.x) + 1);
        const lenghtY = (Math.abs(bL1.y - bL2.y) + 1);
        const lenghtZ = (Math.abs(bL1.z - bL2.z) + 1);
        const blockLocation = {
            x: Math.max(bL1.x, bL2.x),
            y: Math.max(bL1.y, bL2.y),
            z: Math.max(bL1.z, bL2.z)
        };
        playerInstance.cBR = bL1;
        const affectedBlocks = lenghtX * lenghtY * lenghtZ;
        if (playerInstance) {
            console.warn(playerInstance.name);
            console.warn(playerInstance.dimension.id);
            console.warn(playerInstance.index);
        }
        let i = 0;
        for (var xOffset = 0; xOffset < lenghtX; xOffset++) {
            // player.sendMessage(`xOffset ${xOffset}`)
            for (var yOffset = 0; yOffset < lenghtY; yOffset++) {
                //   player.sendMessage(`yOffset ${yOffset}`)
                for (var zOffset = 0; zOffset < lenghtZ; zOffset++) {
                    var offsetBlock = world.getDimension("overworld").getBlock({ x: blockLocation.x - xOffset,
                        y: blockLocation.y - yOffset,
                        z: blockLocation.z - zOffset });
                    playerInstance.cloneBlockArray[i] = offsetBlock.permutation;
                    playerInstance.cBL[i] = offsetBlock.location;
                    console.warn(`§dsaved under ${playerInstance.cloneBlockArray[i].type.id} at ${playerInstance.index} ${i}`);
                    i++;
                }
            }
        }
    });
}
;
/**
 * @param {PlayerClass} playerInstance
 */
const paste = (playerInstance) => {
    system.run(() => {
        const bL1 = playerInstance.bL1;
        const bL2 = playerInstance.bL2;
        //console.warn( playerInstance.index +"START  " + playerInstance.affectedBlocks[playerInstance.index - 1])
        let offsetLocation = {
            x: (bL1.x - playerInstance.cBR.x),
            y: (bL1.y - playerInstance.cBR.y),
            z: (bL1.z - playerInstance.cBR.z)
        };
        let affectedBlocks = playerInstance.cBL.length;
        let i = 0;
        let blockPermutations = new Array(affectedBlocks);
        let blockLocations = new Array(affectedBlocks);
        for (i = 0; i < affectedBlocks; i++) {
            const cloneBlockLocation = playerInstance.cBL[i];
            let forBlockLocation = {
                x: cloneBlockLocation.x + offsetLocation.x,
                y: cloneBlockLocation.y + offsetLocation.y,
                z: cloneBlockLocation.z + offsetLocation.z
            };
            let offsetBlock = playerInstance.dimension.getBlock(forBlockLocation);
            blockPermutations[i] = offsetBlock.permutation;
            blockLocations[i] = offsetBlock.location;
            playerInstance.dimension.fillBlocks(forBlockLocation, forBlockLocation, playerInstance.cloneBlockArray[i]);
        }
        blockPermutations.length = i;
        blockLocations.length = i;
        affectedBlocks = i;
        undoSave({ affectedBlocks: affectedBlocks, blocks: blockPermutations, locations: blockLocations }, playerInstance);
        return "SHIT";
    });
};
addCommand({ chatFunction: (chatEvent) => { paste(getPlayerObject(chatEvent.sender)); }, commandName: "paste", directory: "worldEdit", commandPrefix: ";" });
/**
 * @returns {String}
 * @param {PlayerClass} playerInstance
 * @param {String} message
 */
function set(playerInstance, message) {
    system.run(() => {
        const bL1 = playerInstance.bL1;
        const bL2 = playerInstance.bL2;
        if (bL1 == null || bL2 == null) {
            return;
        }
        const lenghtX = (Math.abs(bL1.x - bL2.x) + 1);
        const lenghtY = (Math.abs(bL1.y - bL2.y) + 1);
        const lenghtZ = (Math.abs(bL1.z - bL2.z) + 1);
        const blockLocation = {
            x: Math.max(bL1.x, bL2.x),
            y: Math.max(bL1.y, bL2.y),
            z: Math.max(bL1.z, bL2.z)
        };
        let affectedBlocks = lenghtX * lenghtY * lenghtZ;
        var blockPermutations = new Array(affectedBlocks);
        var blockLocations = new Array(affectedBlocks);
        if (playerInstance) {
            console.warn(playerInstance.name);
            console.warn(playerInstance.dimension.id);
            console.warn(playerInstance.index);
        }
        const splitMessage = message.split(" ");
        for (let i = 0; i < splitMessage.length; i++) {
            if (splitMessage[i].search("%") == -1) {
                splitMessage[i] = "100%" + splitMessage[i];
            }
        }
        let counter = 0;
        for (var xOffset = 0; xOffset < lenghtX; xOffset++) {
            // player.sendMessage(`xOffset ${xOffset}`)
            for (var yOffset = 0; yOffset < lenghtY; yOffset++) {
                //   player.sendMessage(`yOffset ${yOffset}`)
                for (var zOffset = 0; zOffset < lenghtZ; zOffset++) {
                    let percentage = 0;
                    let rand = Math.round(Math.random() * 100);
                    var offsetBlock = world.getDimension("overworld").getBlock({ x: blockLocation.x - xOffset,
                        y: blockLocation.y - yOffset,
                        z: blockLocation.z - zOffset });
                    splitMessage[1].split(",").forEach(element => {
                        if (Math.floor(Number(element.split("%")[0])) + percentage > rand) {
                            blockPermutations[counter] = offsetBlock.permutation;
                            blockLocations[counter] = offsetBlock.location;
                            console.warn(`saved under ${offsetBlock.typeId} at ${playerInstance.index} ${counter}`);
                            counter++;
                            playerInstance.dimension.fillBlocks(offsetBlock, offsetBlock, BlockTypes.get("minecraft:" + element.split("%")[1]));
                            return;
                        }
                    });
                }
            }
        }
        blockPermutations.length = counter;
        blockLocations.length = counter;
        affectedBlocks = counter;
        undoSave({ affectedBlocks: affectedBlocks, blocks: blockPermutations, locations: blockLocations }, playerInstance);
    });
}
/**
 * @returns {String}
 * @param {PlayerClass} playerInstance
 */
async function undo(playerInstance) {
    system.run(() => {
        if (playerInstance.index == 0) {
            return ("§dThere is nothing to undo!");
        }
        undoSave(playerInstance.blockArray[playerInstance.index - 1], playerInstance);
        const blocksAffected = playerInstance.blockArray[playerInstance.index - 1].affectedBlocks;
        //console.warn( playerInstance.index +"START  " + playerInstance.affectedBlocks[playerInstance.index - 1])
        var blockPermutations = new Array(blocksAffected);
        var blockLocations = new Array(blocksAffected);
        for (let i = 0; i < blocksAffected; i++) {
            const blockLocation = playerInstance.blockArray[playerInstance.index - 1].locations[i];
            playerInstance.dimension.fillBlocks(blockLocation, blockLocation, playerInstance.blockArray[playerInstance.index - 1].blocks[i]);
        }
        playerInstance.index -= 1;
        return "SHIT";
    });
}
;
/**
 * @returns {String}
 * @param {PlayerClass} playerInstance
 */
function redo(playerInstance) {
    system.run(() => {
        //console.warn( playerInstance.index +"START  " + playerInstance.affectedBlocks[playerInstance.index - 1])
        for (let i = 0; i < playerInstance.affectedBlocks[playerInstance.index + 1]; i++) {
            playerInstance.dimension.fillBlocks(playerInstance.bL[playerInstance.index + 1][i], playerInstance.bL[playerInstance.index + 1][i], playerInstance.blockArray[playerInstance.index + 1][i]);
        }
        playerInstance.index--;
    });
}
;
