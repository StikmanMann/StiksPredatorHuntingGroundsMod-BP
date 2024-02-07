import { Entity, EntitySpawnAfterEvent, Player, Vector, system, world } from "@minecraft/server";
import { DataType, GlobalVars } from "globalVars";
import { AddDataValues, WorldData } from "saveData/worldData";
import { currentObjective, setCurrentObjective, survivorBuff, survivors } from "./privateGameVars";
import { CollisionFunctions } from "staticScripts/collisionFunctions";
import { TickFunctions } from "staticScripts/tickFunctions";
import { ActionbarMessage, HudManager } from "hud";
import { survivorWin } from "./gameWin";
import { VectorFunctions } from "staticScripts/vectorFunctions";
import { AwaitFunctions } from "staticScripts/awaitFunctions";
import { EGameVarId, getGameVarData } from "./gameVars";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { showHUD } from "staticScripts/commandFunctions";

const overworld = GlobalVars.overworld;

/**This number goes from 0 to a 100 */
let objectiveProgress : number = 0;
let objectiveFinish : number = 100;
let standardobjectiveFinishMultiplier = 100;

interface IObjectiveDataTypes{
    dataType: DataType;
    id : string;
    defaultValue: string;
    tooltip : string;
}
interface IObjective{
    typeId : string;
    dataTypes : IObjectiveDataTypes[];
    
    func : (currentObjective : Entity) => void;
}

const objectivesDefinitions : IObjective[] = [
    {
        typeId: "stikphg:capture_point",
        dataTypes: [
            {dataType: DataType.string, id: "objectiveFinish", defaultValue: "100", tooltip : "Capping time (seconds)"}
        ],
        func: (currentObjective) => {capturePoint(currentObjective)}
    },
    {
        typeId: "stikphg:extract_point",
        dataTypes: [
            {dataType: DataType.string, id: "objectiveFinish", defaultValue: "100", tooltip : "Extract time (seconds)"}
        ],
        func: (currentObjective) => {extractPoint(currentObjective)}
    }
];



let objectives : Entity[] = [];

const spawnObjective = (eventData : EntitySpawnAfterEvent) => {
    const {entity} = eventData;
    const dataTypes = objectivesDefinitions.find((objective) => objective.typeId == entity.typeId).dataTypes;
    if(!dataTypes) {return;}
    for(const dataType of dataTypes){
        entity.setDynamicProperty(dataType.id, dataType.defaultValue);
    }
}
world.afterEvents.entitySpawn.subscribe(spawnObjective);


/**
 * 
 * @param entity which objective to edit
 * @param player the player whos editing it
 * @returns {void}
 */
const editObjective = async (entity : Entity, player : Player) => {
    const dataTypes = objectivesDefinitions.find((objective) => objective.typeId == entity.typeId).dataTypes;
    let objectiveDataForm : ModalFormData = new ModalFormData();
    for(const dataType of dataTypes){
        objectiveDataForm.textField(dataType.tooltip, dataType.defaultValue, entity.getDynamicProperty(dataType.id) as string);
    }
    const response = await showHUD(player, objectiveDataForm, 10) as ModalFormResponse;

    if(response.canceled) {return;}

    response.formValues.forEach((value, index) => {
        entity.setDynamicProperty(dataTypes[index].id, value);
    })
    
}
world.beforeEvents.itemUse.subscribe((eventData) => {
    system.run(() => {
        const entity = eventData.source.getEntitiesFromViewDirection()[0].entity;
        if(!entity) {return;}
        editObjective(entity, eventData.source);
    })

    
}) 

export function startObjectives(){

    objectives = overworld.getEntities({families: ["objective"]})
    objectiveProgress = 0;
    standardobjectiveFinishMultiplier = Number(getGameVarData(EGameVarId.standardObjectiveFinishMultiplier));
    
    nextObjective();

}

function nextObjective(){
    if(objectives.length == 0){
        escapeObjective();
    }
    //setCurrentObjective(objectives.splice(Math.floor(Math.random() * objectives.length), 1)[0]);
    const newObjective = objectives.splice(Math.floor(Math.random() * objectives.length), 1)[0]
    
    if (newObjective) {
        objectiveFinish = (Number(newObjective.getDynamicProperty("cappingTime")) * standardobjectiveFinishMultiplier) / (survivorBuff + 1);
        setCurrentObjective(newObjective);
        //world.sendMessage(JSON.stringify(newObjective.location));
    } else {
        // Handle the case where newObjective is undefined
        world.sendMessage("No objectives available.");
    }
}

function escapeObjective(){
    const extractPoints = GlobalVars.overworld.getEntities({type: "stikphg:extract_point"})
    const extractPoint = extractPoints[Math.floor(Math.random() * extractPoints.length)];
    let distance : number;
    survivors.forEach((player) => {
        let playerDistance = VectorFunctions.vectorLength(VectorFunctions.subtractVector(player.location, (extractPoint.location)))
        if(playerDistance > distance || distance == undefined){
            distance = playerDistance
        }
    })
    objectiveFinish = (standardobjectiveFinishMultiplier / (survivorBuff + 1)) + distance / 10
    world.sendMessage("All objectives completed extract");
    world.sendMessage(`Time to extract: ${objectiveFinish.toFixed(2)} seconds`);
    setCurrentObjective(extractPoint);
}



TickFunctions.addFunction(() => {
    try {
        objectivesDefinitions.find((objective) => objective.typeId == currentObjective.typeId).func(currentObjective);
        //world.sendMessage(JSON.stringify(currentObjective.location))
    } catch (error) {
        
    }
    try{
        //world.sendMessage(`Objective: ${currentObjective.typeId}, location: ${JSON.stringify(currentObjective.location)}`);
    }catch(error){
        
    }
    survivors.forEach((player) => {
        player.onScreenDisplay.setActionBar(progressbar(objectiveProgress, objectiveFinish))
      
    })
}, 20)

function capturePoint(objective: Entity) {

    survivors.forEach((player) => {
        if(CollisionFunctions.insideSphere(player.location, objective.location, 10, true)){
            objectiveProgress++;
        }
    })
    if(objectiveProgress >= objectiveFinish){
        objectiveProgress = 0;
        nextObjective();
    }
}

const extractPoint = async(objective: Entity) => {
    objectiveProgress++;
    survivors.forEach((player) => {
        if(CollisionFunctions.insideSphere(player.location, objective.location, 10, true)){
            objectiveProgress++;
        }
    })
    if(objectiveProgress >= objectiveFinish){
        survivors.forEach((player) => {
            if(!CollisionFunctions.insideSphere(player.location, objective.location, 10, true)){
                player.kill();
            }
        })
        await AwaitFunctions.waitTicks(20)
        survivorWin();

    }
}

/**Creates a string of a progressbar 0 - 100 */
function progressbar(number : number, maxNumber : number) : string{
    let progressbar = "§a";
    for(let i = 0; i < 20; i++){
        if(i < number / (maxNumber / 20)){
            progressbar += "█";
        }
        else{
            progressbar += "░";
        }
    }
    return progressbar;
}