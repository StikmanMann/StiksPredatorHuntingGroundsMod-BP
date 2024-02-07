import { world } from '@minecraft/server';
const mainCmd = "!!";
const cpCmd = ";;";
world.sendMessage("Better chat initialized!");
//better chat
world.beforeEvents.chatSend.subscribe((eventData) => {
    eventData.cancel = true;
    const message = eventData.message;
    const player = eventData.sender;
    if (message.startsWith(mainCmd) || message.startsWith(cpCmd)) {
        world.getAllPlayers().forEach(element => {
            if (element.isOp() || element.hasTag("Admin")) {
                element.sendMessage(`§4${player.nameTag} §r${message}`);
            }
        });
    }
    else {
        world.sendMessage(`§g${player.nameTag} §r${message}`);
    }
});
