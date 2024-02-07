import { world, MinecraftBlockTypes } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

var allBlocks = MinecraftBlockTypes.getAllBlockTypes();
import { undoBlocks, undoCounter, undoAdd, undoSave, deleteRow, sortLength, search } from "./mainFake.js"
var paintReplace = [];

var paintBlocks;

var paintRange = 0;

var paintBlocksAffected = 0;


world.events.itemUse.subscribe(async (eventData) => {
    const player = eventData.source;
    if (player.hasTag("Admin") == true, eventData.item.typeId == "minecraft:wooden_pickaxe") {
        if (paintRange == 0 || player.isSneaking) {
            paintUi(player);

        }
        else {
            deleteRow(undoBlocks, undoCounter);
            deleteRow(undoBlocksType, undoCounter);
        }
        world.sendMessage(`§dLeft click a block when your done painting to save it => Then your also able to ;;undo!`)
    }

});

world.events.itemUseOn.subscribe(async (eventData) => {
    const player = eventData.source;
    const block = player.getBlockFromViewDirection();


    if (player.hasTag("Admin") == true, eventData.item.typeId == "minecraft:wooden_pickaxe") {

        try {
            var percentMsgReplace = [];
            var blockMsgReplace = [];

            var paintBlocksSplit = paintBlocks.split(",");
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


            for (var xOffset = -paintRange; xOffset <= paintRange; xOffset++) {
                //  player.sendMessage(`xOffset ${xOffset}`)

                for (var yOffset = -paintRange; yOffset <= paintRange; yOffset++) {
                    //   player.sendMessage(`yOffset ${yOffset}`)

                    for (var zOffset = -paintRange; zOffset <= paintRange; zOffset++) {
                        //player.sendMessage(`zOffset ${zOffset}`)
                        var iCounterReplace = 0;

                        var offsetBlock = world.getDimension("overworld").getBlock({x: blockLocation.x -xOffset,y: blockLocation.y -yOffset,z: blockLocation.z -zOffset});

                        let x = Math.round(Math.random() * 100);
                        if ("minecraft:" + paintReplace.find(item => "minecraft:" + item == offsetBlock.typeId) == offsetBlock.typeId) {
                            for (var i = 0; i < percentMsgReplace.length; i++) {
                                //  world.sendMessage("" + percentMsgReplace.length)
                                // world.sendMessage(`RNG: ${x} Contition <= ${(percentMsgReplace[i] + iCounterReplace)} and > ${iCounterReplace}`)
                                if (x <= percentMsgReplace[i] + iCounterReplace && x >= iCounterReplace) {
                                    undoAdd(offsetBlock, paintBlocksAffected)
                                    console.warn(`saved under ${undoBlocks[undoCounter][paintBlocksAffected].typeId} at ${undoCounter} ${paintBlocksAffected}`)
                                    paintBlocksAffected++;
                                    world.getDimension("overworld").fillBlocks(offsetBlock.location, offsetBlock.location, MinecraftBlockTypes.get("minecraft:" + blockMsgReplace[i]));

                                }
                                iCounterReplace += percentMsgReplace[i];
                            }
                        }

                    }

                }
            }
        }
        catch
        {

        }
    }

});

world.events.blockBreak.subscribe((eventData) => {
    const block = eventData.block;
    const blockRe = eventData.brokenBlockPermutation
    const player = eventData.player;

    if (player.hasTag("Admin") == true && player.hasTag("painter") == true) {
        world.getDimension("overworld").fillBlocks(block.location, block.location, blockRe);
        if (paintBlocksAffected != 0) {
            world.sendMessage(`Blocks saved: ${paintBlocksAffected}`)
            undoSave(paintBlocksAffected);
            resetPaint();
        }
    }
});

world.events.beforeChat.subscribe((eventData) => {
    var msg = eventData.message;
    var msgSplit = msg.split(" ")
    if (msgSplit[0] == ";;paint") {
        eventData.cancel = true;
        paintRange = Math.abs(Math.floor(msgSplit[1]))

        paintReplace = msgSplit[2].split(",");

        paintBlocks = msgSplit[3];
    }
});

function resetPaint() {
    paintBlocksAffected = 0;
}

async function paintUi(player) {

    paintBlocks = "";

    var range = new ModalFormData()
        .title("Paint Settings")
        .slider("Range", 1, 3, 1, 1)
        .slider("How many Blocks to affect", 1, 10, 1, 1)
        .slider("How many Blocks to replace", 1, 10, 1, 1)

    //  import { player } from "./main.js"

    var resultRange = await range.show(player);
    paintRange = resultRange.formValues[0];

    var userBusy;
    var reSearch = false;
    var resultBlockChoose;
    var searchResult = [];

    for (var i = 0; i < resultRange.formValues[1]; i++) {
        do {
            searchResult = [];
            reSearch = false;
            const result = await search.show(player);
            userBusy = result.cancelationReason;
            const blockChoose = new ActionFormData()
                .button("New Search");
            if (result.formValues[0] == null) {
                player.sendMessage('§dPlease input something! \n If you want to search for evrything just type "minecraft"')
            }
            allBlocks.forEach(item => {
                if (item.id.includes(result.formValues[0])) {

                    searchResult[searchResult.length] = item.id;
                    //  world.sendMessage("" + item.id)
                }
            })
            searchResult = sortLength(searchResult);
            searchResult.forEach(item => {
                //  world.sendMessage("" + item)
                blockChoose.button(item);
            })

            resultBlockChoose = await blockChoose.show(player);

            if (resultBlockChoose.selection == 0) {
                reSearch = true;
            }
        } while (reSearch == true || userBusy == "userBusy");
        paintReplace[paintReplace.length] = searchResult[resultBlockChoose.selection - 1].split(":")[1];
        paintReplace.forEach(item => world.sendMessage("" + item))
    }
    var overallPercent = 0;
    for (var i = 0; i < resultRange.formValues[2] && overallPercent < 100; i++) {
        var percent;
        do {
            searchResult = [];
            reSearch = false;
            const percentChoose = new ModalFormData()
                .slider("Percentage", 1, 100, 1);
            const resultPercent = await percentChoose.show(player);
            percent = resultPercent.formValues[0];

            const result = await search.show(player);
            userBusy = result.cancelationReason;
            if (result.formValues[0] == null) {
                player.sendMessage('§dPlease input something! \n If you want to search for evrything just type "minecraft"')
            }
            const blockChoose = new ActionFormData()
                .button("New Search");
            allBlocks.forEach(item => {
                if (item.id.includes(result.formValues[0])) {
                    searchResult[searchResult.length] = item.id;
                }
            })
            searchResult = sortLength(searchResult);
            searchResult.forEach(item => {
                //    world.sendMessage("" + item)
                blockChoose.button(item);
            })


            resultBlockChoose = await blockChoose.show(player);

            if (resultBlockChoose.selection == 0) {
                reSearch = true;
            }
        } while (reSearch == true || userBusy == "userBusy");
        overallPercent += percent;
        paintBlocks = paintBlocks.concat("" + percent + "%" + searchResult[resultBlockChoose.selection - 1].split(":")[1] + ",")

    }
    paintBlocks = paintBlocks.substring(0, paintBlocks.length - 1);

    world.sendMessage("" + paintBlocks)
}