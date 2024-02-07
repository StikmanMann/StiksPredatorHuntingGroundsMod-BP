import {world, system} from "@minecraft/server"
import { Logger } from "./Logger";

export {AwaitFunctions}
class AwaitFunctions{
    /**
     * 
     * @param {String} playerName Name of the Player to wait for 
     * @param {number} attempts Number of attempts
     * @param {string | undefined} id Shows in log
     * @returns {Player} Returns object of player name
     */
    static async waitForPlayer(playerName, attempts, log) {
        await this.#awaitPlayer(playerName, attempts, log)
        return  world.getPlayers({ name: playerName })[0]
    }
    /**
     * 
     * @param {*} attempts 
     * @param {*} delay 
     * @param {(() => void)} func 
     */
    static doAttempts(attempts, delay, func){
        let attempt
        const thisRun = system.runInterval(() => {
            if(attempt >= attempts){
                system.clearRun(thisRun)
            }
            try{
                func()
                system.clearRun(thisRun)
            }
            catch{
                attempt++;
            }
        }, delay)
    }

    static #awaitPlayer(playerName, attempts, log){
        return new Promise((resolve) => {
            let player;
            let attempt = 0
            const worldLoad = system.runInterval(async () => {
                if(attempt >= attempts){
                    Logger.log(`Failed after ${attempt} Attempts `, log)
                    system.clearRun(worldLoad);  // Clear the interval
                    resolve(playerName);
                }
                attempt++;
                try {
                    Logger.log(`Trying to get player ${playerName} | Attempt : ${attempt}`, log)
                    player = world.getPlayers({ name: playerName })[0];
                    if (player.isValid()) {
                        Logger.log(`Success to access player ${playerName}`, log);
                        system.clearRun(worldLoad);  // Clear the interval
                        resolve(playerName);
                    }
                } 
                catch {
                    Logger.log(`Failed to access player ${playerName}`, log);
                }
                
            }, 50);
        });
    }
    /**
     * 
     * @param {number} ticks Amount of ticks to wait
     * @returns 
     */
    static waitTicks(ticks){
        return new Promise((resolve) => {
            system.runTimeout(() => {resolve(null)}, ticks)
        })
    }
}
