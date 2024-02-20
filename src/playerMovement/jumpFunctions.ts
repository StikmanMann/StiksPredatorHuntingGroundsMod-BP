import { Player, system, world } from "@minecraft/server";
import { GlobalVars } from "../globalVars";
import { TickFunctions } from "../staticScripts/tickFunctions";
import { VectorFunctions } from "../staticScripts/vectorFunctions";


declare module "@minecraft/server" {
    interface Player {
        holdingJump: boolean;
    }
}


Object.defineProperties(Player.prototype, {
    holdingJump: {
        get(){
            return this.getDynamicProperty("holdingJump");
        },
        set(value: boolean) {
            this.setDynamicProperty("holdingJump", value);
        }
    }
})
export class JumpFunctions{

    static pressedJumpFunction : ((player: Player) => void)[] = [];

    static addPressedJumpFunction(functions: ((player: Player) => void)){
        this.pressedJumpFunction = [...this.pressedJumpFunction, functions];
    }
    static pressedJump(player){
        //world.sendMessage(`${player.name} jumped!`)
        this.pressedJumpFunction.forEach(functions => functions(player));
    }
    
    static holdingJump(player){
    
    }
    
    static releasedJump(player){
    
    }
}


system.runInterval(() => {
    const players = GlobalVars.players;
    players.forEach((player, index) => {


        if(player.isJumping){
            if(!player.holdingJump){
                JumpFunctions.pressedJump(player);
            }
            JumpFunctions.holdingJump(player);
            player.holdingJump = true;
        }
        else{
            if(player.holdingJump){
                JumpFunctions.releasedJump(player);
            }
            player.holdingJump = false;
        }
       
    });
})

