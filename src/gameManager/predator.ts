import { EffectType, EffectTypes, EntityComponentTypes, ItemStack, ItemTypes, Player, world } from "@minecraft/server";
import { survivorBuff } from "./privateGameVars";

world.afterEvents.itemCompleteUse.subscribe((eventData) => {
    const {itemStack, source} = eventData;
    if(!source.hasTag("predator")){return;}
    if(itemStack.typeId == "stikphg:healing_syringe"){
        source.addEffect("absorption", 100000, {amplifier: 50, showParticles: false})
    }
})
const predatorKit : ItemStack[] = [
    new ItemStack(ItemTypes.get("stikphg:healing_syringe")),
    new ItemStack(ItemTypes.get("minecraft:diamond_sword")),
]
export const givePredatorKit = (player : Player) =>{
    const inventory = player.getComponent(EntityComponentTypes.Inventory).container;
    for(const item of predatorKit){
        inventory.addItem(item)
    }

}