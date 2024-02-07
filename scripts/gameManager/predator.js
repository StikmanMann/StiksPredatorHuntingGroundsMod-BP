import { world } from "@minecraft/server";
world.afterEvents.itemCompleteUse.subscribe((eventData) => {
    const { itemStack, source } = eventData;
    if (itemStack.typeId == "stikphg:healing_syringe") {
        source.addEffect("absorption", 1000, { amplifier: 50, showParticles: false });
    }
});
