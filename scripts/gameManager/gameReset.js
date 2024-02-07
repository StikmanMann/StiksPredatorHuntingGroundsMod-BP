import { system, world } from "@minecraft/server";
import { GlobalVars } from "globalVars";
import { predators, setMidGame, setPreLobby, survivors } from "./privateGameVars";
import { AwaitFunctions } from "staticScripts/awaitFunctions";
//Reset everything
resetGame();
export async function resetGame() {
    const spawnLocations = GlobalVars.overworld.getEntities({ type: "stikphg:player_spawnpoint" });
    if (spawnLocations.length == 0) {
        world.sendMessage("no spawnpoints found bozo");
        return;
    }
    system.run(async () => {
        const players = GlobalVars.players;
        players.forEach(async (player) => {
            player.runCommand("clear @s");
            player.removeTag("predator");
            player.removeTag("survivor");
            player.removeTag("treeJump");
            predators.clear();
            survivors.clear();
            //world.sendMessage(`Player spawned at ${JSON.stringify(spawnLocations[Math.floor(Math.random() * spawnLocations.length)].location)}`)
            player.teleport(spawnLocations[Math.floor(Math.random() * spawnLocations.length)].location);
            setMidGame(false);
            await AwaitFunctions.waitTicks(20);
            setPreLobby(true);
        });
    });
}
