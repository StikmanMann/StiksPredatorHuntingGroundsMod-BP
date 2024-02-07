export let preLobby = false;
export function setPreLobby(b) {
    preLobby = b;
}
export let midGame = false;
export function setMidGame(b) {
    midGame = b;
}
export let predators = new Set();
export let survivors = new Set();
export let currentObjective;
export function setCurrentObjective(e) {
    currentObjective = e;
}
export let survivorBuff;
export function setSurvivorBuff(b) {
    survivorBuff = b;
}
