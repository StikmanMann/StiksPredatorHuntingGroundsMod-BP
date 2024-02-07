import { world } from "@minecraft/server";
import { GlobalVars } from "globalVars";
import { TickFunctions } from "staticScripts/tickFunctions";
import { EGameVarId, getGameVarData } from "./gameVars";
import { preLobby, predators, setMidGame, setPreLobby, setSurvivorBuff, survivors } from "./privateGameVars";
import { startObjectives } from "./gameObjectives";
TickFunctions.addFunction(() => {
    if (!preLobby) {
        return;
    }
    const playersNeeded = Number(getGameVarData(EGameVarId.playersNeeded));
    const players = GlobalVars.players;
    if (players.length < playersNeeded) {
        world.sendMessage(`§cWaiting for ${playersNeeded - GlobalVars.players.length} more players to join!`);
        return;
    }
    const numberOfPredators = Number(getGameVarData(EGameVarId.numberOfPredators));
    //If we don't do this check the while loop will run infinitely and will crash the game
    if (numberOfPredators > playersNeeded) {
        world.sendMessage(`§cYou can't have more predators than players needed!`);
        return;
    }
    world.sendMessage("§aStarting the game!");
    while (predators.size < numberOfPredators) {
        let player = players[Math.floor(Math.random() * players.length)];
        predators.add(player);
    }
    players.forEach((player, index) => {
        if (predators.has(player)) {
            player.sendMessage(`You are a predator!`);
            player.addTag("predator");
            const spawnPoints = GlobalVars.overworld.getEntities({ type: "stikphg:predator_spawnpoint" });
            if (spawnPoints.length == 0) {
                world.sendMessage("no spawnpoints found bozo");
                return;
            }
            player.teleport(spawnPoints[Math.floor(Math.random() * spawnPoints.length)].location);
        }
        else {
            const spawnPoints = GlobalVars.overworld.getEntities({ type: "stikphg:survivor_spawnpoint" });
            survivors.add(player);
            player.sendMessage(`You are a survivour!`);
            player.addTag("survivor");
            if (spawnPoints.length == 0) {
                world.sendMessage("no spawnpoints found bozo");
                return;
            }
            player.teleport(spawnPoints[Math.floor(Math.random() * spawnPoints.length)].location);
        }
    });
    setMidGame(true);
    setSurvivorBuff(predators.size / survivors.size);
    world.sendMessage("OBJECTIVES STARTING");
    startObjectives();
    setPreLobby(false);
}, 20);
