import { Player, system } from "@minecraft/server";
import { GlobalVars } from "../globalVars";
Object.defineProperties(Player.prototype, {
    holdingJump: {
        get() {
            return this.getDynamicProperty("holdingJump");
        },
        set(value) {
            this.setDynamicProperty("holdingJump", value);
        }
    }
});
export class JumpFunctions {
    static addPressedJumpFunction(functions) {
        this.pressedJumpFunction = [...this.pressedJumpFunction, functions];
    }
    static pressedJump(player) {
        //world.sendMessage(`${player.name} jumped!`)
        this.pressedJumpFunction.forEach(functions => functions(player));
    }
    static holdingJump(player) {
    }
    static releasedJump(player) {
    }
}
JumpFunctions.pressedJumpFunction = [];
system.runInterval(() => {
    const players = GlobalVars.players;
    players.forEach((player, index) => {
        if (player.isJumping) {
            if (!player.holdingJump) {
                JumpFunctions.pressedJump(player);
            }
            JumpFunctions.holdingJump(player);
            player.holdingJump = true;
        }
        else {
            if (player.holdingJump) {
                JumpFunctions.releasedJump(player);
            }
            player.holdingJump = false;
        }
    });
});
