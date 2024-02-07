import {world, system, Player} from '@minecraft/server';
//import "./checkpoints"
import "./betterChat"
import "./scoreboard"
import "./customName"
import "./hud"
import "./staticScripts/tickFunctions"
import "./testing"
//import "./worldEdit/mainEdit"
import "./playerChange"
import "./staticScripts/drawFunctions"
import "./launchpads"
import "./playerMovement/jumpFunctions"
import "./options"
import "./saveData/chestData"
import "./debugging/debugCommands"
import "./tagAreas"
import "./playerMovement/playerBoost"
import "./playerMovement/treeJump"
import "./playerMovement/sprint"
import "./staticScripts/commandFunctions"
import "./gameManager/gameMain"
import { Logger } from './staticScripts/Logger';

//import "C:/Users/flori/AppData/Local/ Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/test BP/scripts/main" // world Edit :D


world.sendMessage("If you jsut startetd the world up, pelase type /retry")
export {getPlayerObject}
//import * as ui from '@minecraft/server-ui';
//import * as gt from '@minecraft/server-gametest';
world.sendMessage("1");
world.sendMessage("2")
const commandPrefix = "!!";
console.warn("Script is running and switched");

class PlayerClass{
    /**
    * @type {Player}
    */
    #player

    index: number;

    /**
     * @param {Player} player 
     */
    constructor(player, index){
        this.#player = player;
        this.index = index;
    }

    /**
     * 
     * @returns {Player}
     */
    getPlayer(){
        return this.#player;
    }
    
}

/**
 * @type {PlayerClass[]}
 */
var players = []//world.getAllPlayers();

var playerArry = world.getAllPlayers();
for (let index = 0; index < playerArry.length; ++index) {
    players[index] = new PlayerClass(playerArry[index], index)
    //players[index].getPlayer().sendMessage("HI IM YOU")
    // ...use `element`...
}
//const item = new server.ItemStack("minecraft:redDye", 1);





/**
 *  @param {Player} player 
 * @returns {PlayerClass}
 */
function getPlayerObject(player){

    for(const playerObject of players)
    {
       // console.warn(`Checkign Object Player ${playerObject.getPlayer().name} with ${player.name}`)
        if(playerObject.getPlayer().name == player.name){
            //console.warn("Success")
            return playerObject;
        }
    }

    console.warn("You shouldnt se this message")
};

for(const element of world.getAllPlayers()){
    //console.warn(getPlayerObject(element).getPlayer().name)
   // getPlayerObject(element).getPlayer().sendMessage("DASLDJALJKDS")
}



/*
const form = new ui.ActionFormData()
form.title("Months");
form.body("Choose your favorite month!");
form.button("January");
form.button("February");
form.button("March");
form.button("April");
form.button("May");
*/
var getOuttaChat ={x: 0 , y: 1, z:0};

var counter = 0;

var lastPlayer = "test";

var showForm = false;

/*
server.world.events.beforeChat.subscribe(cb => {
    switch (cb.message) {
        case "!!myscores":
            form.show(cb.sender).then(response => {
                if (response.selection === 3) {
                    cb.sender.runCommandAsync(`say L86`)
                }
            })
            break;
    }
});
*/



world.afterEvents.playerJoin.subscribe(async (eventData) => {
    //const player = eventData.playerId;
   // player.
    //player.kill();

});
///*
world.beforeEvents.chatSend.subscribe(async (eventData) => {
    system.run(async () => {
        const player = eventData.sender;

        if (!eventData.message.startsWith(commandPrefix)) {return;}
        var msg = eventData.message;
        var splitMsg = msg.split(" ");

        switch (splitMsg.length) {
            case 1:
                console.warn("upperSwitch");
                switch (msg) {

                    case '!!gmc':
                        if (!player.hasTag('Admin')) return;
                        eventData.cancel = true;
                        await player.runCommandAsync('gamemode c');
                        break;


                    case '!!gms':
                        if (!player.hasTag('Admin')) return;
                        eventData.cancel = true;
                        await player.runCommandAsync('gamemode s');
                        break;


                    default:
                        //S eventData.cancel = true;
                        //player.runCommandAsync('tell @s ' + eventData.message + ' is not a valid cmd');
                }
                break;



            case 2:
                console.warn("bottom");
                
                break;
            default:
               // eventData.cancel = true;
               // player.runCommandAsync('tell @s ' + eventData.message + ' is not a valid cmd');
        }
    });
});
//*/