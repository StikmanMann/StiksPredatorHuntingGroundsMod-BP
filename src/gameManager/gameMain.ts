import { Entity, system, world } from "@minecraft/server";
import "./preGame";
import "./gameVars"
import "./gameReset"
import "./midGame"
import "./gameObjectives"
import "./predator"
import { GlobalVars } from "globalVars";

const entityNames : Map <string, string> = new Map()
entityNames.set("stikphg:predator_spawnpoint", "Preditor Spawnpoint!")
entityNames.set("stikphg:player_spawnpoint", "Player Spawnpoint!")
entityNames.set("stikphg:survivor_spawnpoint", "Survivor Spawnpoint!")
entityNames.set("stikphg:capture_point", "Capture Point!")
entityNames.set("stikphg:extract_point", "Extract Point!")
entityNames.set("stikphg:kill_mobs_point", "Kill Mobs Point!")
world.afterEvents.entitySpawn.subscribe((event) => {
    try{
        event.entity.nameTag = entityNames.get(event.entity.typeId)
    }
    catch{}

})
