import { Vector3 } from "@minecraft/server"
import { DrawFunctions } from "./drawFunctions"
import { VectorFunctions } from "./vectorFunctions"
export {CollisionFunctions}
class CollisionFunctions{
    /**
     * @param {import("@minecraft/server").Vector3} position For example the players Position
     * @param {import("@minecraft/server").Vector3} a Corner of the Box
     * @param {import("@minecraft/server").Vector3} b Second corner of the Box
     * @param {boolean | undefined} draw
     * @returns {boolean}
     */
    static insideBox(position, a, b, draw?, particleName?){
        let boxStart = {
            x: a.x < b.x ? a.x : b.x,
            y: a.y < b.y ? a.y : b.y,
            z: a.z < b.z ? a.z : b.z,
        }
        let boxEnd = {
            x: a.x > b.x ? a.x : b.x,
            y: a.y > b.y ? a.y : b.y,
            z: a.z > b.z ? a.z : b.z,
        }
        boxEnd = VectorFunctions.addVector(boxEnd, {x: 1, y: 1, z: 1})
        boxStart = VectorFunctions.subtractVector(boxStart, {x: 0, y: 0.1, z: 0})
        
        if(draw){ DrawFunctions.drawCube(a, b, particleName) }

        let isInBox = (
            position.x > boxStart.x && position.x < boxEnd.x &&
            position.y > boxStart.y && position.y < boxEnd.y &&
            position.z > boxStart.z && position.z < boxEnd.z ? true : false
        )
        return isInBox
    }

    /**
     * @param {import("@minecraft/server").Vector3} position For example the players Position
     * @param {import("@minecraft/server").Vector3} radiusLocation Origin of circle
     * @param {import("@minecraft/server").Vector3} radius Size of sphere
     * @returns {boolean}
     */
    static insideSphere(position : Vector3, radiusLocation : Vector3, radius : number, draw? : boolean){
        
        let isInSphere= (
            VectorFunctions.vectorLength(VectorFunctions.subtractVector(position, radiusLocation)) < radius ? true : false
        )
        if(draw){
            DrawFunctions.drawSphere(25, radius, radiusLocation)
        }
        return isInSphere
    }
}