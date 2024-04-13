import { BlockTypes, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { set } from "./commands";
//import { undoBlocks, undoCounter, undoAdd, undoSave, bL1, bL2, deleteRow, sortLength, search, undoBlocksType } from "./mainFake.js"
export { setUi };
import { getPlayerObject, sortLength } from "./mainEdit";
var commaMsg;
const search = new ModalFormData()
    .textField("Search blocks", "Example: grass");
var allBlocks = BlockTypes.getAll();
async function setUi(player) {
    commaMsg = ";;set ";
    var range = new ModalFormData()
        .title("Set Settings")
        .slider("How many diffrent Blocks to set", 1, 10, 1, 1);
    //  import { player } from "./main.js"
    var resultRange = await range.show(player);
    var userBusy;
    var reSearch = false;
    var resultBlockChoose;
    var searchResult = [];
    var overallPercent = 0;
    for (var i = 0; i < Number(resultRange.formValues[0]) && overallPercent < 100; i++) {
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
                blockChoose.button(item);
            });
            resultBlockChoose = await blockChoose.show(player);
            if (resultBlockChoose.selection == 0) {
                reSearch = true;
            }
            world.sendMessage("o" + overallPercent);
        } while (reSearch == true || userBusy == "userBusy");
        overallPercent += percent;
        commaMsg = commaMsg.concat("" + percent + "%" + searchResult[resultBlockChoose.selection - 1].split(":")[1] + ",");
        set(getPlayerObject(player), commaMsg);
        world.sendMessage("" + commaMsg);
    }
}
