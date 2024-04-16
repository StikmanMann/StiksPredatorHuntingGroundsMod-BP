import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
let commandValues = [];
addCommand({ commandName: "test", chatFunction: ((event) => { world.sendMessage(`${"event.message"}`); }), directory: "twla/lmao", commandPrefix: "!!" });
export function addCommand(commandValue) {
    if (!commandValue.directory.startsWith("/")) {
        commandValue.directory = "/".concat(commandValue.directory);
    }
    if (!commandValue.directory.endsWith("/")) {
        commandValue.directory = commandValue.directory.concat("/");
    }
    commandValues.push(commandValue);
}
world.beforeEvents.chatSend.subscribe((event) => {
    const sender = event.sender;
    if (event.message.startsWith(";;help")) {
        for (const cmd of commandValues) {
            sender.sendMessage(cmd.commandPrefix + cmd.commandName);
        }
        return;
    }
    // Iterate through registered commands
    for (const cmd of commandValues) {
        const commandString = `${cmd.commandPrefix}${cmd.commandName}`;
        // Check if the message starts with the command string
        if (!event.message.startsWith(commandString)) {
            // Check player tags
            continue;
        }
        if (!cmd.permissions) {
            system.run(async () => { cmd.chatFunction(event); });
            break;
        }
        if (cmd.permissions.some((tag) => sender.hasTag(tag))) {
            // Execute the command function
            system.run(async () => { cmd.chatFunction(event); });
            break;
        }
        event.cancel = true;
        sender.sendMessage("You don't have the required tags to use this command.");
    }
});
function generateForm(parentPath, player) {
    commandHUDIndex.length = 0; // Clear the array
    const uniqueButtonNames = new Set(); // Maintain a set of unique button names
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
            }
            else {
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
let commandHUDIndex = [];
async function commandHud(player, chatSendEvent, parentPath) {
    system.run(async () => {
        const mainMenuForm = generateForm(parentPath, player);
        let response = await showHUD(player, mainMenuForm, 10);
        const selectedOption = response.selection;
        const selectedCommand = commandHUDIndex[selectedOption];
        world.sendMessage(typeof selectedCommand);
        world.sendMessage(`§d${selectedCommand}`);
        if (typeof selectedCommand === "string") {
            commandHud(player, chatSendEvent, selectedCommand);
        }
        else if (typeof selectedCommand === "number") {
            world.sendMessage("This is a function!");
            commandValues[selectedCommand].chatFunction(chatSendEvent);
        }
    });
}
world.beforeEvents.chatSend.subscribe((event) => {
    if (event.message.startsWith(";;commands")) {
        commandHud(event.sender, event, "/");
    }
});
export async function showHUD(player, form, attempts = 10) {
    return new Promise(async (resolve) => {
        let response;
        let attempt = 0;
        // Define a function to handle the form response
        const handleResponse = (result) => {
            response = result;
            // Check if the form was canceled or if the maximum attempts are reached
            if (response.cancelationReason === "UserBusy" && attempt <= attempts) {
                // Show the form again
                form.show(player).then(handleResponse);
            }
            else {
                // Resolve the promise with the final response
                resolve(response);
            }
        };
        // Show the initial form
        form.show(player).then(handleResponse);
    });
}
