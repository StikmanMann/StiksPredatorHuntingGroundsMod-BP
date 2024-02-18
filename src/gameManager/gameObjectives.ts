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
import { spawnRandomEntities } from "staticScripts/entitiesFunctions";

const overworld = GlobalVars.overworld;

/**This number goes from 0 to a 100 */
let objectiveProgress : number = 0;
let objectiveFinish : number = 100;
let standardObjectiveFinishMultiplier = 1;

enum EObjectives{
    capturePoint = "stikphg:capture_point",
    extractPoint = "stikphg:extract_point",
    killMobsPoint = "stikphg:kill_mobs_point",
    fusePoint = "stikphg:fuse_point"
}
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
        typeId: EObjectives.capturePoint,
        dataTypes: [
            {dataType: DataType.string, id: "objectiveFinish", defaultValue: "100", tooltip : "Capping time (seconds)"},
            {dataType: DataType.string, id: "captureRange", defaultValue: "10", tooltip : "Capture range (blocks)"}
        ],
        func: (currentObjective) => {capturePoint(currentObjective)}
    },
    {
        typeId: EObjectives.extractPoint,
        dataTypes: [
            {dataType: DataType.string, id: "objectiveFinish", defaultValue: "100", tooltip : "Extract time (seconds)"},
            {dataType: DataType.string, id: "extractRange", defaultValue: "10", tooltip : "Extract range (blocks)"}
        ],
        func: (currentObjective) => {extractPoint(currentObjective)}
    },
    {
        typeId: EObjectives.killMobsPoint,
        dataTypes: [
            {dataType: DataType.string, id: "amountOfMobs", defaultValue: "5", tooltip : "Amount of mobs to spawn"},
            {dataType: DataType.string, id: "mobType", defaultValue: "minecraft:pillager", tooltip : "Mob type"}
        ],
        func: (currentObjective) => {killMobsPoint(currentObjective)}
    },
    {
        typeId: EObjectives.fusePoint,
        dataTypes: [
            {dataType: DataType.string, id: "fuseSpawnRange", defaultValue: "30", tooltip : "Fuse range (blocks)"}
        ],
        func: (currentObjective) => {fusePoint(currentObjective)}
    }
];

let killMobEntities : Entity[] = [];

let fuseSpawns : Entity[] = [];

let objectives : Entity[] = [];


const spawnObjective = (eventData : EntitySpawnAfterEvent) => {
    const {entity} = eventData;
    let dataTypes : IObjectiveDataTypes[] = [];
    try{
        dataTypes = objectivesDefinitions.find((objective) => objective.typeId == entity.typeId).dataTypes;
    }catch{
        return;
    }

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
        let entity : Entity;
        try{
            entity = eventData.source.getEntitiesFromViewDirection()[0].entity;
        }catch(e){
            return;
        }
       
        if(!entity) {return;}
        editObjective(entity, eventData.source);
    })

    
}) 

export function startObjectives(){
    system.run(async () => {
        objectives = overworld.getEntities({families: ["objective"]})
        objectiveProgress = 0;
        standardObjectiveFinishMultiplier = Number(getGameVarData(EGameVarId.standardObjectiveFinishMultiplier));
        
        nextObjective();
    })


}

const nextObjective = () => {
    if(objectives.length == 0){
        escapeObjective();
        return;
    }
    //setCurrentObjective(objectives.splice(Math.floor(Math.random() * objectives.length), 1)[0]);
    const newObjective = objectives.splice(Math.floor(Math.random() * objectives.length), 1)[0]
    world.setDefaultSpawnLocation(newObjective.location);
    if (newObjective) {

        setCurrentObjective(newObjective);
        //world.sendMessage(JSON.stringify(newObjective.location));
    } else {
        // Handle the case where newObjective is undefined
        world.sendMessage("No objectives available.");
    }

    switch (currentObjective.typeId) {
        case EObjectives.capturePoint:
            objectiveFinish = (Number(newObjective.getDynamicProperty("objectiveFinish")) * standardObjectiveFinishMultiplier) / (survivorBuff + 1);
            break;
        case EObjectives.killMobsPoint:
            objectiveFinish = (Number(newObjective.getDynamicProperty("amountOfMobs")) * standardObjectiveFinishMultiplier) / (survivorBuff + 1);
            const mobType = newObjective.getDynamicProperty("mobType") as string;
            world.sendMessage(`Spawning ${objectiveFinish} ${mobType} mobs at ${VectorFunctions.vectorToString(newObjective.location)}`);
            killMobEntities = spawnRandomEntities([mobType], objectiveFinish, newObjective.location, 0, newObjective.dimension.id)
            break;
        case EObjectives.fusePoint:
            const fuseSpawnRange = Number(newObjective.getDynamicProperty("fuseSpawnRange"));
            fuseSpawns = newObjective.dimension.getEntities({maxDistance: fuseSpawnRange, location: newObjective.location, type: "stikphg:fuse_spawn"});
            if(fuseSpawns.length == 0){
                world.sendMessage("No fuses found.\n Try increasing fuseSpawnRange or adding fuse_spawn\n Switching to next objective");
                nextObjective();
            }
            break;
           
    }
}

function escapeObjective(){
    const extractPoints = GlobalVars.overworld.getEntities({type: "stikphg:extract_point"})
    const extractPoint = extractPoints[Math.floor(Math.random() * extractPoints.length)];
    world.setDefaultSpawnLocation(extractPoint.location);
    let distance : number;
    survivors.forEach((player) => {
        let playerDistance = VectorFunctions.vectorLength(VectorFunctions.subtractVector(player.location, (extractPoint.location)))
        if(playerDistance > distance || distance == undefined){
            distance = playerDistance
        }
    })
    objectiveFinish = (standardObjectiveFinishMultiplier / (survivorBuff + 1)) + distance / 10
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
        if(CollisionFunctions.insideSphere(player.location, objective.location, Number(objective.getDynamicProperty("captureRange")), true)){
            objectiveProgress++;
        }
        //world.sendMessage(`Objecive progress: ${objectiveProgress}/${objectiveFinish}`)
    })
    if(objectiveProgress >= objectiveFinish){
        objectiveProgress = 0;
        nextObjective();
    }
}



const killMobsPoint = async(objective: Entity) => {
    
}
world.afterEvents.entityDie.subscribe((eventData) => {
    const {deadEntity} = eventData;
   
    for(const player of survivors){
        player.onScreenDisplay.setActionBar(progressbar(objectiveProgress, objectiveFinish))
    }
    
    try{
        //killMobEntities.forEach((entity) => { world.sendMessage(`${entity.id} == ${deadEntity.id}`) });
        if(killMobEntities.some((entity) => entity == deadEntity)){
            objectiveProgress++;
            if(objectiveProgress >= objectiveFinish){
                objectiveProgress = 0;
                nextObjective();
            }
        }
    } catch(e){

    }
    
})

const fusePoint = async(objective: Entity) => {
    
}

const extractPoint = async(objective: Entity) => {
    const extractRange = Number(objective.getDynamicProperty("extractRange"))
    objectiveProgress++;
    survivors.forEach((player) => {
        if(CollisionFunctions.insideSphere(player.location, objective.location, extractRange, true)){
            objectiveProgress++;
        }
    })
    if(objectiveProgress >= objectiveFinish){
        survivors.forEach((player) => {
            if(!CollisionFunctions.insideSphere(player.location, objective.location, extractRange, true)){
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