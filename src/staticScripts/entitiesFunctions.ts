import { Entity, Vector3, system, world } from "@minecraft/server";
import { VectorFunctions } from "./vectorFunctions";


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
export const spawnRandomEntities = (
    entityTypes: string[],
    amount: number,
    location: Vector3,
    spread: number = 0,
    dimensionID: string = "overworld"
): Entity[] => {
    let spawnedEntities: Entity[] = Array[amount];

    const dimension = world.getDimension(dimensionID);

    for (let i = 0; i < amount; i++) {
        const spawnLocation = { x: location.x, y: location.y, z: location.z };
        const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];

        try {
            spawnedEntities[i] = (dimension.spawnEntity(entityType, spawnLocation));
            
            world.sendMessage(`${spawnedEntities.length} spawned ${entityType} at ${VectorFunctions.vectorToString(spawnLocation)}`);
        } catch (error) {
            console.warn(error);
            continue;
        }

    }

    return spawnedEntities;
};
