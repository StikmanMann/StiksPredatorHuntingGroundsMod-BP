import { Entity, Player } from "@minecraft/server";

export let preLobby : boolean = false;
export function setPreLobby(b : boolean){
    preLobby = b;
}

export let midGame : boolean = false;
export function setMidGame(b : boolean){
    midGame = b;
}


export let predators : Set<Player> = new Set();
export let survivors : Set<Player> = new Set();

export let currentObjective : Entity;

export function setCurrentObjective(e : Entity){
    currentObjective = e;
}

export let survivorBuff : number;

export function setSurvivorBuff(b : number){
    survivorBuff = b;
}