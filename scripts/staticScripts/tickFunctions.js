import { system } from "@minecraft/server";
export { TickFunctions };
class TickFunction {
    constructor(tickFunction, tick) {
        this.tickFunction = tickFunction;
        if (typeof tick == "undefined") {
            this.tick = 1;
        }
        else {
            this.tick = tick;
        }
    }
}
class TickFunctions {
    static tick() {
        system.runInterval(() => {
            for (const func of this.tickFunctions) {
                if (system.currentTick % func.tick == 0) {
                    func.tickFunction();
                }
            }
        }, 1);
    }
    static addFunction(newFunction, tick) {
        this.tickFunctions.push(new TickFunction(newFunction, tick));
    }
}
TickFunctions.tickFunctions = [];
TickFunctions.tick();
