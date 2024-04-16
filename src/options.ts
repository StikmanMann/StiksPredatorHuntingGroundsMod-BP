import { ActionFormData, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { BookData } from "./saveData/bookData";
import { MolangVariableMap, Player, system, world } from "@minecraft/server";
import { AwaitFunctions } from "./staticScripts/awaitFunctions";
import { Logger } from "./staticScripts/Logger";
import { showHUD } from "staticScripts/commandFunctions";

const commandPrefix = "!"

class Options{
    //static gui = 


}


world.beforeEvents.chatSend.subscribe((eventData) => {
    system.run(async () => {
        let message = eventData.message;
        if(!message.startsWith(commandPrefix)) {return}
        
        let player =  eventData.sender // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame

        const msgSplit = message.split(" ")
        switch(msgSplit[0]){
            case "!options":
                /**
                * @type {ModalFormResponse}
                */
                let newGui = new ModalFormData()
                .title("Options")
                .toggle("Wall Jumps", player.hasTag("wallJump"))
                let attempts = 0;
                player.sendMessage("Please close Chat to make the GUI appear!")
                let formResult = await showHUD(player, newGui);
                if(formResult.canceled) {return;}

                if(formResult.formValues[0]){
                    player.addTag("wallJump")
                } else{
                    player.removeTag("wallJump")
                }
                

        }
    })
})
