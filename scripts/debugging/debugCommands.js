import { system, world } from "@minecraft/server";
const commandPrefix = ".";
world.setDynamicProperty("debug:debug", false);
export { DebugOptions };
class DebugOptions {
    static toggleCpDraw() {
        if (world.getDynamicProperty("debug:debug")) {
            world.setDynamicProperty("debug:debug", false);
            this.debug = world.getDynamicProperty("debug:debug");
            world.sendMessage(`Deactivating Debug!`);
        }
        else {
            world.setDynamicProperty("debug:debug", true);
            this.debug = world.getDynamicProperty("debug:debug");
            world.sendMessage(`Activating Debug!`);
        }
    }
    static getCpDraw() {
        return this.debug;
    }
}
DebugOptions.debug = world.getDynamicProperty("debug:debug");
world.beforeEvents.chatSend.subscribe((eventData) => {
    system.run(async () => {
        let message = eventData.message;
        if (!message.startsWith(commandPrefix)) {
            return;
        }
        let player = eventData.sender;
        const msgSplit = message.split(" ");
        switch (msgSplit[0]) {
            case ".toggle":
                DebugOptions.toggleCpDraw();
                break;
        }
    });
});
