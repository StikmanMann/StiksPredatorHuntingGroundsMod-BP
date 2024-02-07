import { Player, world } from "@minecraft/server"
import { VectorFunctions } from "staticScripts/vectorFunctions"

const overworld = world.getDimension("overworld")

declare module "@minecraft/server" {
    interface Player {
        groundCheck: boolean
    }
}

Object.defineProperties(Player.prototype, {
    groundCheck: {
        get() : boolean {
            return overworld.getBlock(VectorFunctions.subtractVector(this.location, {x: 0, y: 1, z: 0})).typeId == "minecraft:air"
        }
    }
})