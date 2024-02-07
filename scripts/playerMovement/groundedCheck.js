import { Player, world } from "@minecraft/server";
import { VectorFunctions } from "staticScripts/vectorFunctions";
const overworld = world.getDimension("overworld");
Object.defineProperties(Player.prototype, {
    groundCheck: {
        get() {
            return overworld.getBlock(VectorFunctions.subtractVector(this.location, { x: 0, y: 1, z: 0 })).typeId == "minecraft:air";
        }
    }
});
