import { world } from "@minecraft/server";
import { VectorFunctions } from "./vectorFunctions";
import { quadraticFit } from "./MathFunctions";
import { AwaitFunctions } from "./awaitFunctions";
import { CollisionFunctions } from "./collisionFunctions";
import { Logger } from "./Logger";
//import { sys } from "typescript";
//import { sys } from "typescript"
const overworld = world.getDimension("overworld");
export { DrawFunctions };
class DrawFunctions {
    /**
     *
     * @param {*} steps
     * @param {*} startLocation
     * @param {*} endLocation
     * @param {String | undefined} particleName
     * @param {MolangVariableMap | undefined} molangVars
     */
    static drawLine(steps, startLocation, endLocation, particleName, molangVars) {
        if (typeof particleName != "string") {
            particleName = "minecraft:blue_flame_particle";
        }
        //Logger.log(typeof molangVars)
        let normalisedVector = VectorFunctions.normalizeVector(VectorFunctions.subtractVector(endLocation, startLocation));
        let distance = VectorFunctions.vectorLength(VectorFunctions.subtractVector(endLocation, startLocation));
        let stepSize = distance / (steps - 1);
        /**
         * @type {import("@minecraft/server").Vector3}
         */
        let particleLocation = startLocation;
        for (let i = 0; i < steps; i++) {
            //world.sendMessage(`${distance}`)
            // world.sendMessage(`${VectorFunctions.vectorToString(normalisedVector)}`)
            //let test = new MolangVariableMap("variable.color", { red: Math.random(), green: Math.random(), blue: Math.random(), alpha: 1 })
            try {
                overworld.spawnParticle(particleName, particleLocation, molangVars);
            }
            catch { }
            particleLocation = VectorFunctions.addVector(particleLocation, VectorFunctions.multiplyVector(normalisedVector, stepSize));
        }
    }
    static drawSphere(steps, size, centerLocation, particleName, molangVars) {
        if (typeof particleName != "string") {
            particleName = "minecraft:blue_flame_particle";
        }
        // world.sendMessage("drawing sphere")
        particleName = "minecraft:blue_flame_particle";
        const stepSize = 360 / steps;
        const addVector = { x: size, y: 0, z: 0 };
        for (let i = 0; i < steps; i++) {
            let particleLocation = VectorFunctions.addVector(centerLocation, VectorFunctions.rotateVectorY(addVector, i * stepSize));
            //world.sendMessage(VectorFunctions.vectorToString(particleLocation))
            try {
                overworld.spawnParticle(particleName, particleLocation);
            }
            catch { }
        }
    }
    /**
    * @param {import("@minecraft/server").Vector3} a Corner of the Box
    * @param {import("@minecraft/server").Vector3} b Second corner of the Box
    *  @param {MolangVariableMap | undefined} molangVars
    */
    static drawCube(a, b, particleName, molangVars) {
        if (!particleName) {
            particleName = "minecraft:blue_flame_particle";
        }
        let boxStart = {
            x: a.x < b.x ? a.x : b.x,
            y: a.y < b.y ? a.y : b.y,
            z: a.z < b.z ? a.z : b.z,
        };
        let boxEnd = {
            x: a.x > b.x ? a.x : b.x,
            y: a.y > b.y ? a.y : b.y,
            z: a.z > b.z ? a.z : b.z,
        };
        boxEnd = VectorFunctions.addVector(boxEnd, { x: 1, y: 1, z: 1 });
        DrawFunctions.drawLine(2, { x: boxStart.x, y: boxStart.y, z: boxStart.z }, { x: boxEnd.x, y: boxStart.y, z: boxStart.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxStart.x, y: boxStart.y, z: boxStart.z }, { x: boxStart.x, y: boxEnd.y, z: boxStart.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxStart.x, y: boxStart.y, z: boxStart.z }, { x: boxStart.x, y: boxStart.y, z: boxEnd.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxEnd.x, y: boxEnd.y, z: boxEnd.z }, { x: boxStart.x, y: boxEnd.y, z: boxEnd.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxEnd.x, y: boxEnd.y, z: boxEnd.z }, { x: boxEnd.x, y: boxStart.y, z: boxEnd.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxEnd.x, y: boxEnd.y, z: boxEnd.z }, { x: boxEnd.x, y: boxEnd.y, z: boxStart.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxEnd.x, y: boxStart.y, z: boxStart.z }, { x: boxEnd.x, y: boxStart.y, z: boxEnd.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxEnd.x, y: boxStart.y, z: boxStart.z }, { x: boxEnd.x, y: boxEnd.y, z: boxStart.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxStart.x, y: boxStart.y, z: boxEnd.z }, { x: boxEnd.x, y: boxStart.y, z: boxEnd.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxStart.x, y: boxStart.y, z: boxEnd.z }, { x: boxStart.x, y: boxEnd.y, z: boxEnd.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxStart.x, y: boxEnd.y, z: boxStart.z }, { x: boxEnd.x, y: boxEnd.y, z: boxStart.z }, particleName, molangVars);
        DrawFunctions.drawLine(2, { x: boxStart.x, y: boxEnd.y, z: boxStart.z }, { x: boxStart.x, y: boxEnd.y, z: boxEnd.z }, particleName, molangVars);
    }
    /**
     *
     * @param {number} steps
     * @param {import("@minecraft/server").Vector3} startLocation
     * @param {import("@minecraft/server").Vector3} endLocation
     * @param {Player} player
     */
    static async drawGraph(steps, startLocation, endLocation, player) {
        return new Promise(async (resolve) => {
            endLocation = VectorFunctions.addVector(endLocation, { x: 0, y: 1, z: 0 });
            let normalisedVector = VectorFunctions.normalizeVector(VectorFunctions.subtractVector(endLocation, startLocation));
            let distance = VectorFunctions.vectorLengthXZ(VectorFunctions.subtractVector(endLocation, startLocation));
            let rotY = VectorFunctions.getYRotation(normalisedVector) * -1;
            let pathBlocked = false;
            let attempts = 0;
            let rotX = 0;
            let variables;
            do {
                //Logger.log("ATTEMPT " + attempts, "DRAWING")
                // if(rotX>0){rotX = (rotX * -1) - 15}
                //else{rotX = (rotX * -1) + 15}
                //rotX += 5
                if (rotX > 75) {
                    rotX = 0;
                }
                if (rotX < -75) {
                    rotX = 0;
                }
                //Logger.log(`rotX: ${rotX}`, "DRAW")
                attempts++;
                pathBlocked = false;
                let points = [
                    [0, 0],
                    [distance / 2, attempts / 2 + 3 + (endLocation.y - startLocation.y)],
                    [distance, endLocation.y - startLocation.y]
                ];
                //world.sendMessage(points.toString())
                //world.sendMessage(`${distance}`)
                variables = quadraticFit(points);
                //world.sendMessage(`a1: ${variables.a}, a2:  ${variables.b}, a3:  ${variables.c}`)
                let xOffset = 0;
                let lastIncrease = 0;
                /**
                 * @type {import("@minecraft/server").Vector3}
                 */
                let particleLocation = VectorFunctions.addVector(startLocation, { x: xOffset, y: 0, z: 0 });
                let newSteps = steps + Math.floor(Math.abs(rotX) / 10);
                let flank = rotX / newSteps * 2;
                let stepSize = distance / newSteps;
                for (let i = xOffset; i < newSteps; i++) {
                    try {
                        let blockType = overworld.getBlock({ x: (particleLocation.x), y: (particleLocation.y), z: (particleLocation.z) }).typeId;
                        //Logger.log(blockType, "BLOCK")
                        if ((blockType != "minecraft:air" && blockType != "minecraft:water" && blockType != "minecraft:lava") || particleLocation.y < -62) {
                            pathBlocked = true;
                            //world.sendMessage("PATH BLOCKED"); 
                            break;
                        }
                        overworld.spawnParticle("minecraft:villager_happy", particleLocation);
                    }
                    catch {
                        resolve(player);
                    }
                    //world.sendMessage(`${VectorFunctions.vectorToString({x: stepSize, y: xad(stepSize * i, 1, 0, 1),z: 0}))}`)
                    let functionY = xad(stepSize * i, variables.a, variables.b, variables.c);
                    //world.sendMessage(`${xad(stepSize * i, 1, 0, 1)}`)
                    let addVector = VectorFunctions.rotateVectorY(VectorFunctions.rotateVectorY({ x: stepSize, y: functionY - lastIncrease, z: 0 }, (rotY)), rotX);
                    particleLocation = VectorFunctions.addVector(particleLocation, addVector);
                    lastIncrease = functionY;
                    rotX -= flank;
                }
            } while (pathBlocked && attempts < 15);
            if (true) {
                // Logger.log("SUCCES")
                //steps += Math.floor(Math.abs(rotX) / 10)
                /* for(let r = 0; r < 4; r++){
                    rotX *= -1
                    let xOffset = 0
                    let lastIncrease = 0
                    let flank = rotX / steps * 2
                    let stepSize = distance / steps
                 
                    let particleLocation = VectorFunctions.addVector(startLocation, {x:xOffset, y: 0, z: 0})
                    for(let i = xOffset; i < steps; i++){

                        try{
                            let blockType = overworld.getBlock({x: Math.round(particleLocation.x), y: Math.round(particleLocation.y), z: Math.round(particleLocation.z)}).typeId;
                            if(blockType != "minecraft:air" && blockType != "minecraft:water"  && blockType != "minecraft:lava"){
                                pathBlocked = true;
                                //world.sendMessage("PATH BLOCKED");
                                break;
    
                            }
                            overworld.spawnParticle("minecraft:shulker_bullet", particleLocation)
                        }
                        catch{resolve(player) }
                        //world.sendMessage(`${VectorFunctions.vectorToString({x: stepSize, y: xad(stepSize * i, 1, 0, 1),z: 0}))}`)
                        
                        let  functionY =  xad(stepSize*i , variables.a, variables.b, variables.c)
                        //world.sendMessage(`${xad(stepSize * i, 1, 0, 1)}`)
                        
                        particleLocation = VectorFunctions.addVector(particleLocation,VectorFunctions.rotateVectorX(VectorFunctions.rotateVectorY( {x: stepSize, y: functionY - lastIncrease, z: 0}, (rotY)), rotX ))
                        lastIncrease = functionY
                        rotX -= flank
                    }
                    await AwaitFunctions.waitTicks(20)
                } */
                rotX *= -1;
                let xOffset = 0;
                let lastIncrease = 0;
                let newSteps = steps + Math.floor(Math.abs(rotX) / 10);
                let flank = rotX / newSteps * 2;
                let stepSize = distance / newSteps;
                /**
                 * @type {import("@minecraft/server").Vector3}
                 */
                let particleLocation = VectorFunctions.addVector(startLocation, { x: xOffset, y: 0, z: 0 });
                //Logger.log(`rotX: ${rotX}`, "Teleport")
                for (let i = xOffset; i < newSteps; i++) {
                    let functionY = xad(stepSize * i, variables.a, variables.b, variables.c);
                    let boxSize = 1;
                    //if(CollisionFunctions.insideBox(player.location, VectorFunctions.subtractVector(endLocation, {x:boxSize, y:3, z:boxSize}), VectorFunctions.addVector(endLocation, {x:boxSize, y:0, z:boxSize}))){break;}
                    let addVector = VectorFunctions.rotateVectorY(VectorFunctions.rotateVectorY({ x: stepSize, y: functionY - lastIncrease, z: 0 }, (rotY)), rotX);
                    let rotYAdd = VectorFunctions.getYRotation(addVector) + 90;
                    let horizontalStrength = -Math.sin((rotYAdd) * (Math.PI / 180));
                    let verticalStrength = -Math.cos(rotYAdd * (Math.PI / 180));
                    //world.sendMessage("" +  VectorFunctions.getYRotation(normalisedVector))
                    try {
                        player.applyKnockback(horizontalStrength * -1, verticalStrength, stepSize * 1.5, (functionY - lastIncrease));
                    }
                    catch {
                        resolve(player);
                    }
                    if (!CollisionFunctions.insideSphere(player.location, particleLocation, 2.25)) {
                        try {
                            player.teleport(particleLocation);
                        }
                        catch (e) {
                            Logger.log(e, "FAILED TO TP");
                            resolve(player);
                        }
                    }
                    overworld.spawnParticle("minecraft:shulker_bullet", particleLocation);
                    await AwaitFunctions.waitTicks(0);
                    //player.clearVelocity()
                    particleLocation = VectorFunctions.addVector(particleLocation, addVector);
                    lastIncrease = functionY;
                    rotX -= flank;
                }
            }
            player.teleport(endLocation);
            resolve(player);
        });
    }
}
function xad(x, a2, a1, a0) {
    return a2 * x * x + a1 * x + a0;
}
function scheitelpunkt(x, a, d, b) {
    return a * Math.pow((x - d), 2) + b;
}
function nullpunkt(x, a, x1, x2, b1, b2) {
    return (x - x1) * (x - x2) * a;
}
/*
system.runInterval(() => {
    for(const player of GlobalVars.players){
        //DrawFunctions.drawGraph(20, player.location, VectorFunctions.addVector(player.location, VectorFunctions.multiplyVector(VectorFunctions.getForwardVectorFromRotationXY(player.getRotation().x, player.getRotation().y), 5)), player.getRotation().y)
        //DrawFunctions.drawLine(20, player.location, VectorFunctions.addVector(player.location, VectorFunctions.multiplyVector(VectorFunctions.getForwardVectorFromRotationXY(player.getRotation().x, player.getRotation().y), 5)))
        //DrawFunctions.drawLine(40, player.location, VectorFunctions.addVector(player.location, {x: 5, y:0, z:0}))
        //DrawFunctions.drawGraph(40, player.location, VectorFunctions.addVector(player.location, {x: 5, y:3, z:0}))
    
    }
    
}) */ 
