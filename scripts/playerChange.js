import { world } from "@minecraft/server";
import { customName } from "./customName";
import { AwaitFunctions } from "./staticScripts/awaitFunctions";
//import { oldParkour } from "./checkpoints";
import { playerLeft } from "./scoreboard";
//import { timer } from "./hud";
import { GlobalVars } from "./globalVars";
GlobalVars.getPlayers();
world.afterEvents.playerSpawn.subscribe(async (eventData) => {
    const { initialSpawn, player } = eventData;
    if (initialSpawn) {
        GlobalVars.getPlayers();
    }
    customName.playerJoin(player);
});
/**
 * @type {Player}
 */
let player;
world.beforeEvents.playerLeave.subscribe(async (eventData) => {
    const playerName = eventData.player.nameTag;
    playerLeft(playerName);
    await AwaitFunctions.waitTicks(3);
    GlobalVars.getPlayers();
});
/* let player = world.getAllPlayers()[0]
system.runInterval(() => {
        Logger.log(`${player.nameTag}`, "TEST")
}, 50) */
/* system.run(async() => {
     let player = await AwaitFunctions.waitForPlayer(world.getAllPlayers()[0].name)
    system.runInterval(() => {
        //Logger.log(`Waitin and waitin i hope`, "TEST")
        Logger.log(`${player.nameTag}`, "TEST")
    }, 50)
}) */
