import { system, world, Player } from "@minecraft/server";
import { DataType } from "dataTypes/dataTypeHud";
import { GlobalVars } from "globalVars";
import { WorldData } from "saveData/worldData";
import { TickFunctions } from "staticScripts/tickFunctions";
export { SprintClass };
Object.defineProperties(Player.prototype, {
    maxStamina: {
        get() {
            return this.getDynamicProperty("maxStamina");
        },
        set(value) {
            this.setDynamicProperty("maxStamina", value);
        }
    },
    stamina: {
        get() {
            return this.getDynamicProperty("stamina");
        },
        set(value) {
            this.setDynamicProperty("stamina", Math.min(Math.max(value, 0), this.maxStamina));
        }
    },
    sprintMultiplier: {
        get() {
            return this.getDynamicProperty("sprintMultiplier");
        },
        set(value) {
            this.setDynamicProperty("sprintMultiplier", value);
        }
    },
    staminaRegenRate: {
        get() {
            return this.getDynamicProperty("staminaRegenRate");
        },
        set(value) {
            this.setDynamicProperty("staminaRegenRate", value);
        }
    }
});
world.afterEvents.dataDrivenEntityTrigger.subscribe((event) => {
});
TickFunctions.addFunction(() => {
    const players = GlobalVars.players;
    const playerMovementMap = SprintClass.movementComponentMap;
    players.forEach((player, index) => {
        player.startItemCooldown("chorus_fruit", 2);
        let playerMovement = playerMovementMap.get(player);
        if (player.isSprinting) {
            player.stamina--;
            if (player.stamina > 0) {
                playerMovement.setCurrentValue(playerMovement.defaultValue * player.sprintMultiplier);
            }
            else {
                playerMovement.setCurrentValue(playerMovement.defaultValue);
            }
        }
        else {
            player.stamina += player.staminaRegenRate; // Regenerate stamina based on the regen rate
        }
        player.stamina = Math.min(Math.max(player.stamina, 0), player.maxStamina); // Ensure stamina is within valid range
        player.resetLevel();
        player.addExperience((player.totalXpNeededForNextLevel / player.maxStamina) * player.stamina);
    });
}, 5);
class SprintValues {
    constructor(data) {
        const values = data.split(" ");
        this.id = values[0];
        this.maxStamina = parseInt(values[1]);
        this.stamina = parseInt(values[1]);
        this.sprintMultiplier = parseFloat(values[2]);
        this.staminaRegenRate = parseFloat(values[3]); // New property for stamina regen rate
    }
}
class SprintClass extends WorldData {
    constructor(saveId, logerId, scoreboardName) {
        super(saveId, logerId, scoreboardName, [{ dataType: DataType.string, tooltip: "Id", example: "coolSprint" },
            { dataType: DataType.number, tooltip: "Max Stamina", example: "10" },
            { dataType: DataType.float, tooltip: "Sprint Multiplier", example: "1.5" },
            { dataType: DataType.float, tooltip: "Stamina Regen Rate", example: "2" }]);
        SprintClass.classes = [...SprintClass.classes];
        world.beforeEvents.chatSend.subscribe((event) => {
            if (!event.message.startsWith(SprintClass.commandPrefix)) {
                return;
            }
            const messageSplit = event.message.split(" ");
            switch (messageSplit[0]) {
                case ";;addData":
                    if (messageSplit.length != this.expectedValues + 1) {
                        world.sendMessage("Wrong amount of values!");
                        return;
                    }
                    this.addData(event.message.substring(";;addData".length + 1));
                    break;
                case ";;removeData":
                    if (isNaN(parseInt(messageSplit[2]))) {
                        return;
                    }
                    this.removeData(event.message);
                    break;
                case ";;changeClass":
                    this.changeClass(event.message.substring(";;changeClass".length + 1), event.sender);
            }
        });
    }
    updateData() {
        SprintClass.classes = [SprintClass.defaultSprintValues];
        super.updateData();
        this.worldData.forEach((data, index) => {
            const values = new SprintValues(data);
            SprintClass.classes = [...SprintClass.classes, values];
        });
    }
    changeClass(id, player) {
        world.sendMessage("Changed class to " + id);
        this.updateData();
        if (!SprintClass.movementComponentMap.has(player)) {
            SprintClass.movementComponentMap.set(player, player.getComponent("movement"));
        }
        //console.table(SprintClass.classes)
        SprintClass.classes.forEach((values, index) => {
            this.logger.log(`Class ${values.id}`);
        });
        const values = SprintClass.classes.find(values => values.id.match(id));
        if (values) {
            this.logger.log(`Changed class to ${values.id}`);
            player.maxStamina = values.maxStamina;
            player.stamina = values.stamina;
            player.sprintMultiplier = values.sprintMultiplier;
            player.staminaRegenRate = values.staminaRegenRate;
        }
        else {
            world.sendMessage("Class not found!");
        }
    }
    changeClassCustom(str, player) {
        let splitStr = str.split(" ");
        if (splitStr.every(str => !isNaN(Number(str)))) {
            this.logger.log(`Changed class to ${str}`);
            player.maxStamina = Number(splitStr[0]);
            player.stamina = Number(splitStr[0]);
            player.sprintMultiplier = Number(splitStr[1]);
            player.staminaRegenRate = Number(splitStr[2]);
        }
    }
}
SprintClass.defaultSprintValues = new SprintValues("default 10 10 1.5 2");
SprintClass.movementComponentMap = new Map();
SprintClass.classes = [SprintClass.defaultSprintValues];
SprintClass.commandPrefix = ";;";
export let sprintClass = new SprintClass("sprint", "sprint", "sprint");
system.run(() => {
    const players = GlobalVars.players;
    players.forEach((player, index) => {
        SprintClass.movementComponentMap.set(player, player.getComponent("movement"));
        sprintClass.changeClass("default", player);
    });
});
