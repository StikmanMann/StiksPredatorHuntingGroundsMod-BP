import { ChatSendBeforeEvent, Player, system, world } from "@minecraft/server";
import { ActionFormData, ActionFormResponse, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { Logger } from "./Logger";
import { AwaitFunctions } from "./awaitFunctions";
import { playerJoin } from "scoreboard";

export interface CommandValues{
    /**
     * The prefix of the command
     * @example ;;
     */
    commandPrefix : string

    /**
     * The name of the command
     * @example killPLayers
     */
    commandName : string

    /**
     * This does not matter if the player has OP
     * 
     * Tag needed to acces this command
     * @example ["builder", "admin"]
     */
    permissions? : string[];

    /** 
     * This is for the HUD
     * @example "coolCmds/reallyCoolCmds" 
     * 
     * */
    directory : string;

    /**
     * 
     */
    chatFunction : (((chatSendEvent? : ChatSendBeforeEvent) => void))
    
}


let commandValues : CommandValues[] = []


addCommand({commandName: "test", chatFunction: ((event) => {world.sendMessage(`${"event.message"}`)}), directory: "twla/lmao", commandPrefix: "!!"})

export function addCommand(commandValue: CommandValues) {

  if(!commandValue.directory.startsWith("/")){
    commandValue.directory ="/".concat(commandValue.directory)
  }
  if(!commandValue.directory.endsWith("/")){
    commandValue.directory = commandValue.directory.concat("/")
  }


  //commandValue.chatFunction(); // Just testing
    commandValues.push(commandValue);
    
  }

  world.beforeEvents.chatSend.subscribe((event) => {
      
    const sender = event.sender as Player;

    // Iterate through registered commands
    for (const cmd of commandValues) {
      const commandString = `${cmd.commandPrefix}${cmd.commandName}`;

      // Check if the message starts with the command string
      if (event.message.startsWith(commandString)) {
        // Check player tags
        
        if(!cmd.permissions){
          system.run(async () => {cmd.chatFunction(event)});
          break;
        }

        if (cmd.permissions.some((tag) => sender.hasTag(tag))) {
          // Execute the command function
          system.run(async () => {cmd.chatFunction(event)});
          break;
        }
          // Player doesn't have the required tags
        event.cancel = true;
        sender.sendMessage("You don't have the required tags to use this command.");
        
        
      }
    }
  });

  
  function generateForm(parentPath: string, player: Player): ActionFormData {
    commandHUDIndex.length = 0; // Clear the array
    const uniqueButtonNames = new Set<string>(); // Maintain a set of unique button names

    const form = new ActionFormData();

    form.title(parentPath || "Main Menu");
    form.body("Select a command or a submenu");

    if (parentPath) {
        // form.button("Back"); Let's do this later
    }

    commandValues.forEach((cmd, i) => {
        if (cmd.directory.includes(parentPath)) {
            if (!(parentPath.match(cmd.directory))) {
                const buttonName = cmd.directory.substring(parentPath.length).split("/")[0];
                if (!uniqueButtonNames.has(buttonName)) {
                    form.button(buttonName);
                    world.sendMessage(`${parentPath.concat(buttonName).concat("/")}`);
                    commandHUDIndex.push(parentPath.concat(buttonName).concat("/"));
                    uniqueButtonNames.add(buttonName);
                }
            } else {
                const buttonName = cmd.commandName;
                if (!uniqueButtonNames.has(buttonName)) {
                    form.button(buttonName);
                    commandHUDIndex.push(i);
                    uniqueButtonNames.add(buttonName);
                }
            }
        }
    });

    return form;
}

let commandHUDIndex: Array<string | number> = [];

async function commandHud(player: Player, chatSendEvent: ChatSendBeforeEvent, parentPath: string) {
    system.run(async () => {
        const mainMenuForm = generateForm(parentPath, player);

        let response = await showHUD(player, mainMenuForm, 10) as ActionFormResponse;

        const selectedOption = response.selection;
        const selectedCommand = commandHUDIndex[selectedOption];

        world.sendMessage(typeof selectedCommand);
        world.sendMessage(`§d${selectedCommand}`);

        if (typeof selectedCommand === "string") {
            commandHud(player, chatSendEvent, selectedCommand);
        } else if (typeof selectedCommand === "number") {
            world.sendMessage("This is a function!");
            commandValues[selectedCommand].chatFunction(chatSendEvent);
        }
    });
}
 world.beforeEvents.chatSend.subscribe((event) => {

    if(event.message.startsWith(";;commands")){
        commandHud(event.sender, event, "/");
    }
 })

export async function showHUD(player: Player, form: (ActionFormData | ModalFormData), attempts: number): Promise<ActionFormResponse | ModalFormResponse> {
    return new Promise(async (resolve) => {
      let response: ActionFormResponse;
      let attempt = 0;
  
      // Define a function to handle the form response
      const handleResponse = (result: ActionFormResponse) => {
        response = result;
  
        // Check if the form was canceled or if the maximum attempts are reached
        if (response.cancelationReason === "UserBusy" && attempt <= attempts) {
          // Show the form again
          form.show(player).then(handleResponse);
        } else {
          // Resolve the promise with the final response
          resolve(response);
        }
      };
  
      // Show the initial form
      form.show(player).then(handleResponse);
    });
  }