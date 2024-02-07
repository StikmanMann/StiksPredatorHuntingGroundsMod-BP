import { EffectType, EffectTypes, ItemTypes, world } from "@minecraft/server";
import { survivorBuff } from "./privateGameVars";

world.afterEvents.itemCompleteUse.subscribe((eventData) => {
    const {itemStack, source} = eventData;

    if(itemStack.typeId == "stikphg:healing_syringe"){
        source.addEffect("absorption", 1000, {amplifier: 50, showParticles: false})
    }
})