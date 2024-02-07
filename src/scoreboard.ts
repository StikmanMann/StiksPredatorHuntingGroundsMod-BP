import { DisplaySlotId, ObjectiveSortOrder, Player, ScoreboardIdentity, ScoreboardObjective, system, world } from "@minecraft/server"
//export {ScoreboardFunctions}
import { ScoreboardFunctions } from "./staticScripts/scoreboardFunctions"
import { GlobalVars } from "./globalVars"

export {playerJoin, playerLeft}
class ScoreboardName{
    objectiveId: any
    displayName: any
 

    constructor(objectiveId, displayName){
        /**
         * @type {String}
         */
        this.objectiveId = objectiveId

        /**
         * @type {String}
         */
        this.displayName = displayName
    }
}
let scoreboardNames = [new ScoreboardName("currentCp", "§aCurrent Checkpoint"), new ScoreboardName("maxCp", "Checkpoint Record"), new ScoreboardName("ticks", "tick"), new ScoreboardName("deaths", "§4Deaths")]


/**
 * THIS IS A VERY BAD IMPLEMENTAION
 */

let overworld = world.getDimension("overworld")

system.run(async() => {
    //await scoreboardIdentityFailcheck()

    world.scoreboard.getObjectives().forEach(scoreboard => {
        let allPlayers = GlobalVars.players
        
        allPlayers.forEach(async player => {
            if(!scoreboard.hasParticipant(player.nameTag)){
                //world.sendMessage("NO PARTICPANTE")
                ScoreboardFunctions.setScore(player, scoreboard.id, 0)
            }
            //world.sendMessage(`${scoreboard.id} §a${player.nameTag}§4 ${ScoreboardFunctions.getScore(player, scoreboard.id)}`)
           
    
        })
        if(scoreboard.displayName.endsWith("Save")) {return}
        for(const paricipant of scoreboard.getParticipants()){
           
            let foundPlayer = false;
            
            allPlayers.forEach(player => { /* world.sendMessage(`${paricipant.displayName} == ${player.nameTag}`); */ if(paricipant.displayName == player.nameTag) { foundPlayer = true;}})
            if(!foundPlayer) {/* world.sendMessage(`Removing: ${paricipant.displayName}`); */scoreboard.removeParticipant(paricipant)}
        }
    })
})

function waitTicks(){

}

//Rename on join
/**
 * 
 * @param {Player} player 
 */
function playerJoin(player){
    system.run(async() => {
        world.scoreboard.getObjectives().forEach(async scoreboard => {
            if(scoreboard.displayName.endsWith("Save")) {return}
            try{
                if(!scoreboard.hasParticipant(player.nameTag)){
                    ScoreboardFunctions.setScore(player, scoreboard.id, 0)
                }
                world.sendMessage(`${scoreboard.id} §a${player.name}§4 ${ScoreboardFunctions.getScore(player, scoreboard.id)}`)
                const scoreboardSave = world.scoreboard.getObjective(scoreboard.id + "Save");
                world.sendMessage(`${scoreboardSave.id} §a${player.name}§4 ${ScoreboardFunctions.getScore(player, scoreboardSave)}`)
               ScoreboardFunctions.setScore(player, scoreboard, ScoreboardFunctions.getScore(player, scoreboardSave.id))
            }
            catch{

            }
                    
        })
    })
    
}
/**
 * 
 * @param {String} playerName 
 */
function playerLeft(playerName){
    world.scoreboard.getObjectives().forEach(scoreboard => {
        if(scoreboard.displayName.endsWith("Save")) {return}
        //world.sendMessage(`removing ${playerName} at ${scoreboard.id}`)
        const scoreboardSave = world.scoreboard.getObjective(scoreboard.id + "Save");
        //world.sendMessage(`Saving ${playerName} at ${scoreboardSave.id}`)
        ScoreboardFunctions.setScore(playerName, scoreboardSave.id, ScoreboardFunctions.getScore(playerName, scoreboard.id))
        ScoreboardFunctions.removeParticipant(playerName, scoreboard) 
    })
}


scoreboardNames.forEach(scoreboard => {
    try{
        world.scoreboard.addObjective(scoreboard.objectiveId, scoreboard.displayName)
        world.scoreboard.addObjective(scoreboard.objectiveId + "Save", scoreboard.displayName + "Save")
        world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
            objective: world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar).objective,
            sortOrder: world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar).sortOrder
        })
    }
    catch{
        world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
            objective: world.scoreboard.getObjective(scoreboardNames[0].objectiveId),
            sortOrder: ObjectiveSortOrder.Ascending
        })
    }

})

world.beforeEvents.chatSend.subscribe((E) => {
    system.run(() => {
        if(E.message == "FUCK")
        {
            
            world.scoreboard.getObjectives().forEach(scoreboard => {
                world.scoreboard.removeObjective(scoreboard)
            })
        }
    })
   
})
