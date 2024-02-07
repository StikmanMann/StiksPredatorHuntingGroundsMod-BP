import { world } from "@minecraft/server";
export { GlobalVars };
class GlobalVars {
    static getPlayers() {
        this.players = world.getAllPlayers();
    }
}
/**
 * @type {Player[]}
 */
GlobalVars.players = world.getAllPlayers();
/**
 * @type {Dimension}
 */
GlobalVars.overworld = world.getDimension("overworld");
