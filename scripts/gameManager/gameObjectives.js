import { world } from "@minecraft/server";
import { GlobalVars } from "globalVars";
import { currentObjective, setCurrentObjective, survivorBuff, survivors } from "./privateGameVars";
import { CollisionFunctions } from "staticScripts/collisionFunctions";
import { TickFunctions } from "staticScripts/tickFunctions";
import { survivorWin } from "./gameWin";
import { VectorFunctions } from "staticScripts/vectorFunctions";
import { AwaitFunctions } from "staticScripts/awaitFunctions";
import { EGameVarId, getGameVarData } from "./gameVars";
const overworld = GlobalVars.overworld;
/**This number goes from 0 to a 100 */
let objectiveProgress = 0;
let objectiveTime = 100;
let standardObjectiveTime = 100;
let objectiveMap = new Map();
objectiveMap.set("stikphg:capture_point", (currentObjective) => { capturePoint(currentObjective); });
objectiveMap.set("stikphg:extract_point", (currentObjective) => { extractPoint(currentObjective); });
let objectives = [];
export function startObjectives() {
    objectives = overworld.getEntities({ families: ["objective"] });
    objectiveProgress = 0;
    standardObjectiveTime = Number(getGameVarData(EGameVarId.standardObjectiveTime));
    objectiveTime = standardObjectiveTime / (survivorBuff + 1);
    nextObjective();
}
function nextObjective() {
    if (objectives.length == 0) {
        escapeObjective();
    }
    //setCurrentObjective(objectives.splice(Math.floor(Math.random() * objectives.length), 1)[0]);
    const newObjective = objectives.splice(Math.floor(Math.random() * objectives.length), 1)[0];
    if (newObjective) {
        setCurrentObjective(newObjective);
        //world.sendMessage(JSON.stringify(newObjective.location));
    }
    else {
        // Handle the case where newObjective is undefined
        world.sendMessage("No objectives available.");
    }
}
function escapeObjective() {
    const extractPoints = GlobalVars.overworld.getEntities({ type: "stikphg:extract_point" });
    const extractPoint = extractPoints[Math.floor(Math.random() * extractPoints.length)];
    let distance;
    survivors.forEach((player) => {
        let playerDistance = VectorFunctions.vectorLength(VectorFunctions.subtractVector(player.location, (extractPoint.location)));
        if (playerDistance > distance || distance == undefined) {
            distance = playerDistance;
        }
    });
    objectiveTime = (standardObjectiveTime / (survivorBuff + 1)) + distance / 10;
    world.sendMessage("All objectives completed extract");
    world.sendMessage(`Time to extract: ${objectiveTime.toFixed(2)} seconds`);
    setCurrentObjective(extractPoint);
}
TickFunctions.addFunction(() => {
    try {
        objectiveMap.get(currentObjective.typeId)(currentObjective);
        //world.sendMessage(JSON.stringify(currentObjective.location))
    }
    catch (error) {
    }
    try {
        //world.sendMessage(`Objective: ${currentObjective.typeId}, location: ${JSON.stringify(currentObjective.location)}`);
    }
    catch (error) {
    }
    survivors.forEach((player) => {
        player.onScreenDisplay.setActionBar(progressbar(objectiveProgress, objectiveTime));
    });
}, 20);
function capturePoint(objective) {
    survivors.forEach((player) => {
        if (CollisionFunctions.insideSphere(player.location, objective.location, 10, true)) {
            objectiveProgress++;
        }
    });
    if (objectiveProgress >= objectiveTime) {
        objectiveProgress = 0;
        nextObjective();
    }
}
async function extractPoint(objective) {
    objectiveProgress++;
    survivors.forEach((player) => {
        if (CollisionFunctions.insideSphere(player.location, objective.location, 10, true)) {
            objectiveProgress++;
        }
    });
    if (objectiveProgress >= objectiveTime) {
        survivors.forEach((player) => {
            if (!CollisionFunctions.insideSphere(player.location, objective.location, 10, true)) {
                player.kill();
            }
        });
        await AwaitFunctions.waitTicks(20);
        survivorWin();
    }
}
/**Creates a string of a progressbar 0 - 100 */
function progressbar(number, maxNumber) {
    let progressbar = "§a";
    for (let i = 0; i < 20; i++) {
        if (i < number / (maxNumber / 20)) {
            progressbar += "█";
        }
        else {
            progressbar += "░";
        }
    }
    return progressbar;
}
