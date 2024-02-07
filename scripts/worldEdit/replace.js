import { world, BlockTypes } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
//import { undoBlocks, undoCounter, undoAdd, undoSave, bL1, bL2, deleteRow, sortLength, search, undoBlocksType } from "./mainFake.js"
export { replaceUi };
var blocksAffected;
var allBlocks = BlockTypes.getAll();
/* world.events.beforeChat.subscribe((eventData) => {
    const player = eventData.sender;
    const msg = eventData.message;
    const splitMsg = msg.split(" ");

    if (splitMsg[0] == ";;replace") {
        replaceBlocks(splitMsg[1], splitMsg[2], player)
    }
}) */
/**
* @param {string} replaceSettings
* @param {string} replaceSettingsBlocks
* @param {import("@minecraft/server").Player} player
*/
function replaceBlocks(replaceSettings, replaceSettingsBlocks, player) {
    var counter = 0;
    try {
        blocksAffected = (Math.abs(Math.abs(bL1.x) - Math.abs(bL2.x)) + 1) * (Math.abs(Math.abs(bL1.y) - Math.abs(bL2.y)) + 1) * (Math.abs(Math.abs(bL1.z) - Math.abs(bL2.z)) + 1);
    }
    catch {
        player.sendMessage("Operation couldn't be completed => Please have valid locations!");
        return;
    }
    player.sendMessage(`Operation completed (Blocks affected: ${blocksAffected})`);
    const replaceBlockName = replaceSettings.split(",");
    const lenghtXreplace = (Math.abs(bL1.x - bL2.x) + 1);
    const lenghtYreplace = (Math.abs(bL1.y - bL2.y) + 1);
    const lenghtZreplace = (Math.abs(bL1.z - bL2.z) + 1);
    var blockLocation = { x: Math.max(bL1.x, bL2.x), y: Math.max(bL1.y, bL2.y), z: Math.max(bL1.z, bL2.z) };
    deleteRow(undoBlocks, undoCounter);
    deleteRow(undoBlocksType, undoCounter);
    const commaMsg = replaceSettingsBlocks.split(",");
    for (var i = 0; i < commaMsg.length; i++) {
        if (commaMsg[i].search("%") == -1) {
            commaMsg[i] = "100%" + commaMsg[i];
        }
    }
    var percentMsgReplace = [];
    var blockMsgReplace = [];
    commaMsg.forEach(item => percentMsgReplace[percentMsgReplace.length] = Math.floor(item.split("%")[0]));
    commaMsg.forEach(item => blockMsgReplace[blockMsgReplace.length] = item.split("%")[1]);
    for (var xOffset = 0; xOffset < lenghtXreplace; xOffset++) {
        // player.sendMessage(`xOffset ${xOffset}`)
        for (var yOffset = 0; yOffset < lenghtYreplace; yOffset++) {
            //   player.sendMessage(`yOffset ${yOffset}`)
            for (var zOffset = 0; zOffset < lenghtZreplace; zOffset++) {
                var iCounterReplace = 0;
                var offsetBlock = world.getDimension("overworld").getBlock({ x: blockLocation.x - xOffset, y: blockLocation.y - yOffset, z: blockLocation.z - zOffset });
                let x = Math.round(Math.random() * 100);
                if ("minecraft:" + replaceBlockName.find(item => "minecraft:" + item == offsetBlock.typeId) == offsetBlock.typeId) {
                    for (var i = 0; i < percentMsgReplace.length; i++) {
                        //world.sendMessage(`RNG: ${x} Contition <= ${(percentMsg[i] + iCounter)} and > ${iCounter}`)
                        if (x <= percentMsgReplace[i] + iCounterReplace && x >= iCounterReplace) {
                            undoAdd(offsetBlock, counter);
                            console.warn(`saved under ${undoBlocks[undoCounter][counter].typeId} at ${undoCounter} ${counter}`);
                            counter++;
                            world.getDimension("overworld").fillBlocks(offsetBlock.location, offsetBlock.location, MinecraftBlockTypes.get("minecraft:" + blockMsgReplace[i]));
                        }
                        iCounterReplace += percentMsgReplace[i];
                    }
                }
            }
        }
    }
    undoSave(blocksAffected);
}
async function replaceUi(player) {
    var replaceBlock = "";
    var replaceBlockWith = "";
    var range = new ModalFormData()
        .title("Replace Settings")
        .slider("How many blocks to replace", 1, 10, 1, 1)
        .slider("How many blocks to replace with", 1, 10, 1, 1);
    var resultRange = await range.show(player);
    var userBusy;
    var reSearch = false;
    var resultBlockChoose;
    var searchResult = [];
    for (var i = 0; i < resultRange.formValues[0]; i++) {
        do {
            searchResult = [];
            reSearch = false;
            const result = await search.show(player);
            userBusy = result.cancelationReason;
            if (result.formValues[0] == null) {
                player.sendMessage('§dPlease input something! \n If you want to search for evrything just type "minecraft"');
            }
            const blockChoose = new ActionFormData()
                .button("New Search");
            allBlocks.forEach(item => {
                if (item.id.includes(result.formValues[0])) {
                    searchResult[searchResult.length] = item.id;
                    //  world.sendMessage("" + item.id)
                }
            });
            searchResult = sortLength(searchResult);
            searchResult.forEach(item => {
                //  world.sendMessage("" + item)
                blockChoose.button(item);
            });
            resultBlockChoose = await blockChoose.show(player);
            if (resultBlockChoose.selection == 0) {
                reSearch = true;
            }
        } while (reSearch == true || userBusy == "userBusy");
        replaceBlock = replaceBlock.concat("" + searchResult[resultBlockChoose.selection - 1].split(":")[1] + ",");
    }
    var overallPercent = 0;
    for (var i = 0; i < resultRange.formValues[1] && overallPercent < 100; i++) {
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
                player.sendMessage('§dPlease input something! \n If you want to search for evrything just type "minecraft"');
            }
            const blockChoose = new ActionFormData()
                .button("New Search");
            allBlocks.forEach(item => {
                if (item.id.includes(result.formValues[0])) {
                    searchResult[searchResult.length] = item.id;
                }
            });
            searchResult = sortLength(searchResult);
            searchResult.forEach(item => {
                //    world.sendMessage("" + item)
                blockChoose.button(item);
            });
            resultBlockChoose = await blockChoose.show(player);
            if (resultBlockChoose.selection == 0) {
                reSearch = true;
            }
        } while (reSearch == true || userBusy == "userBusy");
        overallPercent += percent;
        replaceBlockWith = replaceBlockWith.concat("" + percent + "%" + searchResult[resultBlockChoose.selection - 1].split(":")[1] + ",");
        world.sendMessage("" + replaceBlockWith);
    }
    replaceBlocks(replaceBlock, replaceBlockWith, player);
}
