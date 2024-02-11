import { world, system } from '@minecraft/server';
import { GlobalVars } from 'globalVars';
import { addCommand, showHUD } from 'staticScripts/commandFunctions';
import { ModalFormData } from '@minecraft/server-ui';
const cmdPrefixes = [";;", "!!", ";", "!"];
function isValueInRange(value, minValue, maxValue) {
    return value >= minValue && value <= maxValue;
}
world.beforeEvents.chatSend.subscribe((eventData) => {
    let message = eventData.message;
    if (!cmdPrefixes.some(prefix => message.startsWith(prefix))) {
        if (isValueInRange(message[0], "a", "z") || isValueInRange(message[0], "A", "Z") || isValueInRange(message[0], "0", "9")) {
            return;
        }
        world.sendMessage(`Invalid Prefix for command! Known command prefixes: ${JSON.stringify(cmdPrefixes)}`);
    }
});
world.beforeEvents.chatSend.subscribe((eventData) => {
    let message = eventData.message;
    let player = eventData.sender;
    if (!message.startsWith("!!")) {
        return;
    }
    if (message == "!!top") {
        top(player);
    }
});
world.beforeEvents.chatSend.subscribe((eventData) => {
    let message = eventData.message;
    let player = eventData.sender;
    if (!message.startsWith("!!")) {
        return;
    }
    if (message[2] == "u" && message[3] == "p") {
        up(player, message);
    }
});
/**
* top function, tps the player to the top of blocks
* currblock is used for checking where the highest block is
*/
function top(player) {
    let overworld = GlobalVars.overworld;
    let currblock = overworld.getBlock(player.location);
    system.run(() => {
        while (currblock.y < 255) {
            currblock = currblock.above(1);
            if (!currblock.isAir) {
                if (currblock.above(1).isAir && currblock.above(2).isAir) {
                    currblock = currblock.above(1);
                    player.teleport(currblock.location);
                    return;
                }
            }
        }
        world.sendMessage("No blocks found");
    });
}
/**
* up function, basically a setblock replacement for height
* height takes the number out of the command and heightNumber is used to extract the number cuz split makes arrays
*/
function up(player, message) {
    let overworld = GlobalVars.overworld;
    let currblock = overworld.getBlock(player.location);
    let height = message.split("!!up ");
    let heightNumber = Number(height[1]);
    system.run(() => {
        if (currblock.y + heightNumber > 320) {
            world.sendMessage("Can't place blocks outside the world!");
            return;
        }
        currblock = currblock.above(heightNumber);
        overworld.fillBlocks(currblock.location, currblock.location, "minecraft:glass");
        currblock = currblock.above(1);
        player.teleport(currblock.location);
    });
}
/**
* up function, HUD for up function
*/
function GUIup(player) {
    let form = new ModalFormData();
    form.title("!!up");
    form.textField("Enter the Y value you want to go up", "EX: 10");
    showHUD(player, form, 1).then((res) => {
        const response = res;
        up(player, `!!up ${response.formValues[0]}`);
    });
}
addCommand({ commandName: "top", commandPrefix: "!!", chatFunction: (eventdata) => { top(eventdata.sender); }, directory: "coderreal things" });
addCommand({ commandName: "up", commandPrefix: "!!", chatFunction: (eventdata) => { GUIup(eventdata.sender); }, directory: "coderreal things" });
world.beforeEvents.chatSend.subscribe((eventData) => {
    //spawnRandomEnities(["minecraft:zombie"], 1, eventData.sender.location, 0, "overworld")
});
