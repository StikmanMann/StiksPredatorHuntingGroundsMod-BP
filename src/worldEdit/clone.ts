import { world, MinecraftBlockTypes, Block } from "@minecraft/server";

export { clone, paste };
import { undoBlocks, undoCounter, undoAdd, undoSave, bL1, bL2, undoBlocksType, deleteRow } from "./mainFake.js"

var allBlocks = MinecraftBlockTypes.getAllBlockTypes();

var cloneBlocks = [];
var cloneBlocksRoot;


function clone() {

    var counter = 0;
    cloneBlocksRoot = bL1;
    const lenghtXclone = (Math.abs(bL1.x - bL2.x) + 1);
    const lenghtYclone = (Math.abs(bL1.y - bL2.y) + 1);
    const lenghtZclone = (Math.abs(bL1.z - bL2.z) + 1);

    var blockLocation = {x: Math.max(bL1.x, bL2.x),y: Math.max(bL1.y, bL2.y),z: Math.max(bL1.z, bL2.z)};

    cloneBlocks = [];

    for (var xOffset = 0; xOffset < lenghtXclone; xOffset++) {
        //  player.sendMessage(`xOffset ${xOffset}`)

        for (var yOffset = 0; yOffset < lenghtYclone; yOffset++) {
            // player.sendMessage(`yOffset ${yOffset}`)

            for (var zOffset = 0; zOffset < lenghtZclone; zOffset++) {
                // player.sendMessage(`zOffset ${zOffset}`)


                var offsetBlock = world.getDimension("overworld").getBlock({x: blockLocation.x -xOffset,y: blockLocation.y -yOffset,z: blockLocation.z -zOffset});

                cloneBlocks[counter] = offsetBlock;

                console.warn(`saved under ${cloneBlocks[counter].typeId} at ${counter}`)
                counter++;


            }

        }
    }
}

function paste() {
    var counter = 0;

    var offsetLocation = {
     x:   (bL1.x - cloneBlocksRoot.x),
     y:   (bL1.y - cloneBlocksRoot.y),
     z:   (bL1.z - cloneBlocksRoot.z)
    }

    deleteRow(undoBlocks, undoCounter);
    deleteRow(undoBlocksType, undoCounter);
    //OPTEMISATION Only save blocks if they are diffrent from the original!
    cloneBlocks.forEach(item => {
        var forBlockLocation = {x: item.location.x + offsetLocation.x, y: item.location.y + offsetLocation.y, z: item.location.z + offsetLocation.z}
        undoAdd(world.getDimension("overworld").getBlock(forBlockLocation), counter)
        console.warn(`saved under ${undoBlocks[undoCounter][counter].typeId} at ${undoCounter} ${counter}`)
        counter++;
        world.getDimension("overworld").fillBlocks(forBlockLocation, forBlockLocation, MinecraftBlockTypes.get(item.typeId));


    });
    undoSave(counter - 1);
}