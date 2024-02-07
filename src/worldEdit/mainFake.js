import { world, MinecraftBlockTypes, Block, system, Vector } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, ModalFormData } from "@minecraft/server-ui";
world.sendMessage("Script reloaded");

import { setUi } from "./set.js"
import { replaceUi } from "./replace.js"
import { clone, paste } from "./clone.js"
import "./paint.js"

export { undoBlocks, undoCounter, undoAdd, undoSave, bL1, bL2, deleteRow, sortLength, search, undoBlocksType }



const commandPrefix = ";";
var allPlayer = world.getAllPlayers();
/**
 * @type {import("@minecraft/server").Vector3}
 */
var bL1;


/**
 * @type {import("@minecraft/server").Vector3}
 */
var bL2;

var los = new Vector(10, 0, 10);

const search = new ModalFormData()
    .textField("Search blocks", "Example: grass");

const operation = new ActionFormData()
    .title("Choose an Operation")
    .button("Set Blocks")
    .button("Replace Blocks")
    .button("Copy selection")
    .button("Paste");

var allBlocks = MinecraftBlockTypes.getAllBlockTypes();


var undoBlocks = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
var undoBlocksType = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];

function undoAdd(block, count) {
    undoBlocks[undoCounter][count] = block;
    undoBlocksType[undoCounter][count] = block.typeId;
}

function undoSave(blocksAffected) {
    undoBlocksCounter[undoCounter] = blocksAffected - 1;
    undoCounter++;

}

//var undoBlocks = Array(20).fill([]);
//var undoBlocksType = Array(20).fill([]);

var undoBlocksCounter = [];

var undoCounter = 0;

var cloneBlocks = [];
var cloneBlocksRoot;

//remind me to use a normalised vector 3 to fraw a circle thanks
//remind me to use a normalised vector 3 to fraw a circle thanks
//remind me to use a normalised vector 3 to fraw a circle thanks
//remind me to use a normalised vector 3 to fraw a circle thanks
//remind me to use a normalised vector 3 to fraw a circle thanksy

function deleteRow(arr, row) {
    arr = arr.slice(0); // make copy
    arr.splice(row - 1, 1);
    return arr;
}

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

system.runInterval((eventData) => {
    for (const player of world.getPlayers()) {
        if (player.hasTag("Admin") == true && player.hasTag("worldEdit") == true || player.hasTag("painter") == true) {
            try {
                const block = player.getBlockFromViewDirection();
                player.onScreenDisplay.setActionBar(`§dSelected Block: ${block.typeId} at x:${block.location.x} y:${block.location.y} z:${block.location.z}`)
            }
            catch
            {

            }
        }
    }
}, 0);


world.events.itemUse.subscribe(async (eventData) => {
    const player = eventData.source;
    //export { player };
    const block = player.getBlockFromViewDirection();
    var blocksAffected;


    if (player.hasTag("Admin") == true, eventData.item.typeId == "minecraft:wooden_axe") {
        if (!player.isSneaking) {

            bL2 = block.location;
            try {
                blocksAffected = (Math.abs(Math.abs(bL1.x) - Math.abs(bL2.x)) + 1) * (Math.abs(Math.abs(bL1.y) - Math.abs(bL2.y)) + 1) * (Math.abs(Math.abs(bL1.z) - Math.abs(bL2.z)) + 1)
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
                    clone()
                    break;
                case 3:
                    paste();
            }

        }

    }


    // world.sendMessage("item sued");
    //  world.sendMessage(`${block.typeId}`)
});

system.runInterval(async (eventData) => {
    for (const player of world.getPlayers()) {
        player.runCommandAsync("tag @s remove worldEdit")
        player.runCommandAsync("tag @s remove painter")
        player.runCommandAsync("execute as @a[hasitem = {item = wooden_axe, location = slot.weapon.mainhand}] run tag @s add worldEdit")
        player.runCommandAsync("execute as @a[hasitem = {item = wooden_pickaxe, location = slot.weapon.mainhand}] run tag @s add painter")

        // console.warn("AU")
    }
}, 0);

world.events.blockBreak.subscribe((eventData) => {
    const block = eventData.block;
    const blockRe = eventData.brokenBlockPermutation
    const player = eventData.player;

    if (player.hasTag("Admin") == true && player.hasTag("worldEdit") == true) {



        bL1 = block.location;
        try {
            var blocksAffected = (Math.abs(Math.abs(bL1.x) - Math.abs(bL2.x)) + 1) * (Math.abs(Math.abs(bL1.y) - Math.abs(bL2.y)) + 1) * (Math.abs(Math.abs(bL1.z) - Math.abs(bL2.z)) + 1)
        }
        catch {
            world.sendMessage(`§dFirst position set to ${block.location.x},  ${block.location.y},  ${block.location.z}`)
            world.getDimension("overworld").fillBlocks(block.location, block.location, blockRe);
            return;
        }
        world.sendMessage(`§dFirst position set to ${block.location.x},  ${block.location.y},  ${block.location.z} (${blocksAffected})`)
        world.getDimension("overworld").fillBlocks(block.location, block.location, blockRe);
    
    }
});

world.events.beforeChat.subscribe(async (eventData) => {

    const msg = eventData.message;
    const player = eventData.sender;
    var admins = [];
    //  eventData.cancel = true;
    if (!eventData.message.startsWith(commandPrefix)) {
        eventData.cancel = true;
        world.sendMessage('§e' + player.nameTag + " §r" + eventData.message);
        return;
    }
    eventData.cancel = true;

    allPlayer.forEach(item => {
        if (item.hasTag("AdminMsg")) {
            admins[admins.length + 1] = item;
        }
    }
    );

    //admins.forEach(item => world.sendMessage("Admins: " + item.name));

    admins.forEach(item =>
        item.tell("\n§4Admin Message"
            + "\n§rPlayer: " + player.name
            + "\nWith Nametag: " + player.nameTag
            + "\nTried to run Command: " + eventData.message
            + "\n§4Admin Message Over\n "));

    const msgSplit = msg.split(" ");

    if (msg == ";;wand") {
        if (player.hasTag("Admin") == false) return;
        player.sendMessage("§dLeft click(Break block): select pos #1; Right click(Use item): select pos #2 \nShift + Right click(Use item): Operation UI")
        player.runCommandAsync('give @s wooden_axe')

    }


    var blockLocation;
    var blocksAffected;
    var counter = 0;

    // try {

    switch (msgSplit[0]) {
        case ";;search":
            var userBusy;
            var reSearch = false;

            do {
                reSearch = false;
                const result = await search.show(player);
                userBusy = result.cancelationReason;
                const blockChoose = new ActionFormData()
                    .button("New Search");
                allBlocks.forEach(item => {
                    if (item.id.includes(result.formValues[0])) {
                        blockChoose.button(item.id);
                    }
                })

                const resultBlockChoose = await blockChoose.show(player);

                if (resultBlockChoose.selection == 0) {
                    reSearch = true;
                }
            } while (reSearch == true || userBusy == "userBusy");
            break;
        case ";up":
            eventData.cancel = true;
            const locationUp = {x: player.location.x, y: player.location.y + Math.floor(msgSplit[1]),z: player.location.z};
            const blockUp = {x: player.location.x,y: player.location.y + Math.floor(msgSplit[1]) - 1,z: player.location.z};
            console.warn(locationUp.y);
            console.warn(locationUp.y);
            player.runCommandAsync("tp @s " + locationUp.x + " " + locationUp.y + " " + locationUp.z)
            player.runCommandAsync("setblock " + blockUp.x + " " + blockUp.y + " " + blockUp.z + " glass")


            break;
        case ";;undo":
            eventData.cancel = true;
            if (player.hasTag("Admin") == false) return;
            if (undoCounter == 0) {
                player.sendMessage("§dThere is nothing to undo");
                return;
            }

            deleteRow(undoBlocks, undoCounter);
            deleteRow(undoBlocksType, undoCounter);

            for (var i = 0; i < undoBlocksCounter[undoCounter - 1] + 1; i++) {
                undoBlocks[undoCounter][counter] = world.getDimension("overworld").getBlock(undoBlocks[undoCounter - 1][i].location);
                undoBlocksType[undoCounter][counter] = world.getDimension("overworld").getBlock(undoBlocks[undoCounter - 1][i].location).typeId;
                console.warn(`saved under ${undoBlocks[undoCounter][counter].typeId} at ${undoCounter} ${counter}`)
                counter++;
                var forBlockLocation = {x: undoBlocks[undoCounter - 1][i].location.x, y: undoBlocks[undoCounter - 1][i].location.y,z: undoBlocks[undoCounter - 1][i].location.z};
                world.getDimension("overworld").fillBlocks(forBlockLocation, forBlockLocation, MinecraftBlockTypes.get(undoBlocksType[undoCounter - 1][i]));
            }
            undoBlocksCounter[undoCounter] = counter - 1;
            player.sendMessage(`§dUndid ${undoCounter} available edits.`)
            undoCounter--;
            break;

        case ";;redo":
            if (player.hasTag("Admin") == false) return;

            var counter = 0;
            for (var i = 0; i < undoBlocksCounter[undoCounter + 1] + 1; i++) {
                var forBlockLocation = {x: undoBlocks[undoCounter + 1][i].location.x, y: undoBlocks[undoCounter + 1][i].location.y, z: undoBlocks[undoCounter + 1][i].location.z};
                world.getDimension("overworld").fillBlocks(forBlockLocation, forBlockLocation, MinecraftBlockTypes.get(undoBlocksType[undoCounter + 1][i]));
            }
            player.sendMessage(`§dRedid ${undoCounter} available edits.`)
            undoCounter++;

            break;

    }

});