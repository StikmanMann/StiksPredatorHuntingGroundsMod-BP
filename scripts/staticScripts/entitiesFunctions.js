import { world } from "@minecraft/server";
import { VectorFunctions } from "./vectorFunctions";
/**
 * Placeholder value for failed entity spawn attempts.
 */
const FAILED_SPAWN = null;
/**
 * Spawns random entities in the specified location and dimension.
 *
 * @param entityTypes An array of entity type IDs to spawn.
 * @param amount The number of entities to spawn.
 * @param location The location where the entities will spawn.
 * @param spread How far apart the entities will spawn.
 * @param dimensionID The dimension where the entities will spawn. Defaults to "overworld".
 *
 * @returns An array of spawned entities.
 *
 * @throws If there is an error spawning the entities.
 */
export const spawnRandomEntities = (entityTypes, amount, location, spread = 0, dimensionID = "overworld") => {
    const spawnedEntities = [];
    const dimension = world.getDimension(dimensionID);
    for (let i = 0; i < amount; i++) {
        const spawnLocation = { x: location.x, y: location.y, z: location.z };
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];
        try {
            const newMob = dimension.spawnEntity(entityType, spawnLocation);
            spawnedEntities.push(newMob);
            world.sendMessage(`${spawnedEntities.length} spawned ${entityType} at ${VectorFunctions.vectorToString(spawnLocation)}`);
        }
        catch (error) {
            console.warn(error);
            spawnedEntities.push(FAILED_SPAWN);
        }
    }
    return spawnedEntities;
};
