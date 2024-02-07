import { EntityComponentTypes, ItemStack, ItemTypes, world } from "@minecraft/server";
world.afterEvents.itemCompleteUse.subscribe((eventData) => {
    const { itemStack, source } = eventData;
    if (!source.hasTag("survivor")) {
        return;
    }
    if (itemStack.typeId == "stikphg:healing_syringe") {
        source.addEffect("absorption", 100000, { amplifier: 2, showParticles: false });
    }
});
const predatorKit = [
    new ItemStack(ItemTypes.get("stikphg:healing_syringe")),
    new ItemStack(ItemTypes.get("minecraft:diamond_sword")),
    new ItemStack(ItemTypes.get("minecraft:compass")),
];
export const giveSurvivorKit = (player) => {
    const inventory = player.getComponent(EntityComponentTypes.Inventory).container;
    for (const item of predatorKit) {
        inventory.addItem(item);
    }
};
