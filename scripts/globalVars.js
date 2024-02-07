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
export var DataType;
(function (DataType) {
    DataType["number"] = "number";
    DataType["float"] = "float";
    DataType["string"] = "string";
    DataType["boolean"] = "boolean";
    DataType["vector"] = "vector";
})(DataType || (DataType = {}));
