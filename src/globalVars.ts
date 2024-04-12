import { world, Player, Dimension } from "@minecraft/server"
export {GlobalVars}
class GlobalVars{
    /**
     * @type {Player[]}
     */
    static players = world.getAllPlayers()

    /**
     * @type {Dimension}
     */
    static overworld  = world.getDimension("overworld")

    static getPlayers(){
        this.players = world.getAllPlayers()
    }


}


