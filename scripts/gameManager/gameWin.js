import { resetGame } from "./gameReset";
import { predators, survivors } from "./privateGameVars";
import { world } from "@minecraft/server";
/**Run this if the predators won the game!*/
export function predatorWin() {
    survivors.forEach((player) => {
        player.onScreenDisplay.setTitle(`§cYou lost!`, { fadeInDuration: 0, stayDuration: 100, fadeOutDuration: 0 });
    });
    predators.forEach((player) => {
        player.onScreenDisplay.setTitle(`§aYou won!`, { fadeInDuration: 0, stayDuration: 100, fadeOutDuration: 0 });
    });
    resetGame();
}
/**Run this if the survivors won the game!*/
export function survivorWin() {
    survivors.forEach((player) => {
        player.onScreenDisplay.setTitle(`§aYou survived!`, { fadeInDuration: 0, stayDuration: 100, fadeOutDuration: 0 });
    });
    predators.forEach((player) => {
        const allSurvivours = world.getPlayers({ tags: ["survivour"] }).length;
        const livingSurvivours = survivors.size;
        player.onScreenDisplay.setTitle(`§c${allSurvivours} / ${livingSurvivours} killed...`, { fadeInDuration: 0, stayDuration: 100, fadeOutDuration: 0 });
    });
    resetGame();
}
