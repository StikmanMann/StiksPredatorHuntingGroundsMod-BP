import { world } from "@minecraft/server";
import { midGame, preLobby, predators, setMidGame, survivors } from "./privateGameVars";
import { GlobalVars } from "globalVars";
import { resetGame } from "./gameReset";
import { predatorWin, survivorWin } from "./gameWin";
import { sprintClass } from "playerMovement/sprint";
/**Handle players joining/dying mid game*/
world.afterEvents.playerSpawn.subscribe(async (eventData) => {
    world.sendMessage(`Player Died`);
    let { initialSpawn, player } = eventData;
    sprintClass.changeClassCustom("10 1.5 2.2", player);
    if (!preLobby) {
        player.addTag("survivor");
    }
    //If the guy is new
    if (initialSpawn) {
        //Code when new player joins
    }
    survivors.delete(player);
    if (survivors.size == 0 && midGame) {
        world.sendMessage("§cNo survivors left, resetting game...");
        setMidGame(false);
        predatorWin();
        resetGame();
    }
    const spawnLocations = GlobalVars.overworld.getEntities({ type: "stikphg:player_spawnpoint" });
    if (spawnLocations.length == 0) {
        world.sendMessage("no spawnpoints found bozo");
        return;
    }
    //world.sendMessage(`Player spawned at ${JSON.stringify(spawnLocations[Math.floor(Math.random() * spawnLocations.length)].location)}`)
    player.teleport(spawnLocations[Math.floor(Math.random() * spawnLocations.length)].location);
});
//Handle players leaving midGame
world.beforeEvents.playerLeave.subscribe((eventData) => {
    let { player } = eventData;
    if (preLobby) {
        return;
    }
    if (player.hasTag("predator")) {
        player.removeTag("predator");
        predators.delete(player);
        if (predators.size == 0) {
            world.sendMessage("§cNo predators left, resetting game...");
            survivorWin();
            resetGame();
        }
    }
    if (player.hasTag("survivor")) {
        survivors.delete(player);
        if (survivors.size == 0 && midGame) {
            world.sendMessage("§cNo survivors left, resetting game...");
            setMidGame(false);
            predatorWin();
            resetGame();
        }
    }
});
