import { world, system, BlockTypes } from "@minecraft/server";
export { set, undo, redo, copy, paste };
class PlayerClass {
    /**
     * @param {String} playerName
     */
    constructor(playerName) {
        /**
         * @type {String}
         */
        this.name = playerName;
        /**
         * @type {import("@minecraft/server").BlockPermutation[][]}
         */
        this.blockArray = [[], [], [], [], [], [], [], [], []];
        /**
        * @type {import("@minecraft/server").Vector3[][]}
        */
        this.bL = [[], [], [], [], [], [], [], [], []];
        /**
        * @type {number}
        */
        this.affectedBlocks = [];
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
        this.cBL = [];
        /**
         * @type {import("@minecraft/server").Dimension}
         */
        this.dimension = null;
        this.index = 0;
    }
    static test() {
        console.warn("TEST");
    }
}
;
/**
 *
 * @param {import("@minecraft/server").Block} block
 * @param {Number} blocksAffected
 * @param {PlayerClass} playerInstance
 */
function undoAdd(block, affectedBlocks, playerInstance, i) {
    playerInstance.blockArray[playerInstance.index][i] = block.permutation;
    playerInstance.bL[playerInstance.index][i] = block.location;
    playerInstance.affectedBlocks[playerInstance.index] = affectedBlocks;
}
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
        const lenghtX = (Math.abs(playerInstance.bL1.x - playerInstance.bL2.x) + 1);
        const lenghtY = (Math.abs(playerInstance.bL1.y - playerInstance.bL2.y) + 1);
        const lenghtZ = (Math.abs(playerInstance.bL1.z - playerInstance.bL2.z) + 1);
        const blockLocation = {
            x: Math.max(playerInstance.bL1.x, playerInstance.bL2.x),
            y: Math.max(playerInstance.bL1.y, playerInstance.bL2.y),
            z: Math.max(playerInstance.bL1.z, playerInstance.bL2.z)
        };
        playerInstance.cBR = playerInstance.bL1;
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
 * @returns {String}
 * @param {PlayerClass} playerInstance
 */
function paste(playerInstance) {
    system.run(() => {
        //console.warn( playerInstance.index +"START  " + playerInstance.affectedBlocks[playerInstance.index - 1])
        let offsetLocation = {
            x: (playerInstance.bL1.x - playerInstance.cBR.x),
            y: (playerInstance.bL1.y - playerInstance.cBR.y),
            z: (playerInstance.bL1.z - playerInstance.cBR.z)
        };
        let i = 0;
        playerInstance.cBL.forEach(element => {
            let forBlockLocation = {
                x: element.x + offsetLocation.x,
                y: element.y + offsetLocation.y,
                z: element.z + offsetLocation.z
            };
            let offsetBlock = playerInstance.dimension.getBlock(forBlockLocation);
            undoAdd(offsetBlock, playerInstance.cBL.length, playerInstance, i);
            playerInstance.dimension.fillBlocks(forBlockLocation, forBlockLocation, playerInstance.cloneBlockArray[i]);
            i++;
        });
        playerInstance.index++;
        return "SHIT";
    });
}
;
/**
 * @returns {String}
 * @param {PlayerClass} playerInstance
 * @param {String} message
 */
function set(playerInstance, message) {
    system.run(() => {
        const lenghtX = (Math.abs(playerInstance.bL1.x - playerInstance.bL2.x) + 1);
        const lenghtY = (Math.abs(playerInstance.bL1.y - playerInstance.bL2.y) + 1);
        const lenghtZ = (Math.abs(playerInstance.bL1.z - playerInstance.bL2.z) + 1);
        const blockLocation = {
            x: Math.max(playerInstance.bL1.x, playerInstance.bL2.x),
            y: Math.max(playerInstance.bL1.y, playerInstance.bL2.y),
            z: Math.max(playerInstance.bL1.z, playerInstance.bL2.z)
        };
        const affectedBlocks = lenghtX * lenghtY * lenghtZ;
        if (playerInstance) {
            console.warn(playerInstance.name);
            console.warn(playerInstance.dimension.id);
            console.warn(playerInstance.index);
        }
        const splitMessage = message.split(" ");
        let i = 0;
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
                        if (element.split("%").length > 1) {
                            if (Math.floor(element.split("%")[0]) + percentage > rand) {
                                playerInstance.blockArray[playerInstance.index][i] = offsetBlock.permutation;
                                playerInstance.bL[playerInstance.index][i] = offsetBlock.location;
                                playerInstance.affectedBlocks[playerInstance.index] = affectedBlocks;
                                playerInstance.dimension.fillBlocks(offsetBlock, offsetBlock, BlockTypes.get("minecraft:" + element.split("%")[1]));
                            }
                        }
                        else {
                            playerInstance.blockArray[playerInstance.index][i] = offsetBlock.permutation;
                            playerInstance.bL[playerInstance.index][i] = offsetBlock.location;
                            playerInstance.affectedBlocks[playerInstance.index] = affectedBlocks;
                            playerInstance.dimension.fillBlocks(offsetBlock, offsetBlock, BlockTypes.get("minecraft:" + element));
                        }
                        console.warn(`§dsaved under ${playerInstance.blockArray[playerInstance.index][i].type.id} at ${playerInstance.index} ${i}`);
                        i++;
                    });
                }
            }
        }
        playerInstance.index++;
    });
}
;
/**
 * @returns {String}
 * @param {PlayerClass} playerInstance
 */
async function undo(playerInstance) {
    system.run(() => {
        if (playerInstance.index == 0) {
            return ("§dThere is nothing to undo!");
        }
        //console.warn( playerInstance.index +"START  " + playerInstance.affectedBlocks[playerInstance.index - 1])
        for (let i = 0; i < playerInstance.affectedBlocks[playerInstance.index - 1]; i++) {
            playerInstance.blockArray[playerInstance.index][i] = playerInstance.dimension.getBlock(playerInstance.bL[playerInstance.index - 1][i]).permutation;
            playerInstance.bL[playerInstance.index][i] = playerInstance.bL[playerInstance.index - 1][i];
            playerInstance.dimension.fillBlocks(playerInstance.bL[playerInstance.index - 1][i], playerInstance.bL[playerInstance.index - 1][i], playerInstance.blockArray[playerInstance.index - 1][i]);
        }
        playerInstance.index--;
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
