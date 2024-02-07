import { world, Vector3 } from "@minecraft/server";

export {VectorFunctions}

class VectorFunctions{
    /**
     * 
     * @param {import("@minecraft/server").Vector3} a 
     * @param {import("@minecraft/server").Vector3} b 
     * @returns {import("@minecraft/server").Vector3}
     */
    static addVector(a, b){
        return {x: a.x + b.x, y: a.y + b.y, z: a.z + b.z}
    }

    /**
     * 
     * @param {import("@minecraft/server").Vector3} a 
     * @param {import("@minecraft/server").Vector3} b 
     * @returns {import("@minecraft/server").Vector3}
     */
    static subtractVector(a, b){
        return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z}
    }
    /*
    * Multiply a vector by a scalar.
    * @param {import("@minecraft/server").Vector3} vector - The vector to multiply.
    * @param {number} scalar - The scalar value to multiply the vector by.
    * @returns {import("@minecraft/server").Vector3} - The result of the vector multiplication.
    */
    static multiplyVector(vector, scalar) {
        return {
        x: vector.x * scalar,
        y: vector.y * scalar,
        z: vector.z * scalar,
        };
    }

    /**
     * 
     * @param {import('@minecraft/server').Vector3} vector 
     * @returns {String}
     */
    static vectorToString(vector){
        return `x:${vector.x} y:${vector.y} z:${vector.z}`
    }

    /**
     * 
     * @param {import("@minecraft/server").Vector3} a 
     * @returns {number}
     */
    static vectorLength(a){
        return Math.sqrt(Math.pow(a.x, 2) + Math.pow(a.y, 2) + Math.pow(a.z, 2))
    }

    
/**
 * Calculate the 2D distance in the xz-plane for a Vector3 (ignores the y-coordinate).
 * @param {Vector3} vector - The vector.
 * @returns {number} The xz-plane distance of the vector.
 */
  static vectorLengthXZ(vector: Vector3): number {
    const xzLength = Math.sqrt(vector.x * vector.x + vector.z * vector.z);
    return xzLength;
  }


    /**
     * Get the forward vector from the rotation angles in the XY plane.
     * @param {number} rotationX - Rotation angle in the X-axis.
     * @param {number} rotationY - Rotation angle in the Y-axis.
     * @returns {import("@minecraft/server").Vector3} - The forward vector.
     */

    /**
   * Normalize a 3D vector.
   * @param {import("@minecraft/server").Vector3} vector - The vector to normalize.
   * @returns {import("@minecraft/server").Vector3} - The normalized vector.
   */
  static normalizeVector(vector){
    const length = this.vectorLength(vector)

    // Avoid division by zero
    const scaleFactor = length !== 0 ? 1 / length : 0;

    let normalisedVector = this.multiplyVector(vector, scaleFactor)
    //world.sendMessage(`${this.vectorToString(normalisedVector)}`)
    return normalisedVector
  }

    static getForwardVectorFromRotationXY(rotationX, rotationY) {
        //world.sendMessage(`x: ${rotationX}, y: ${rotationY}`)
        const radX = rotationX * -1 *(Math.PI / 180);
        const radY = (rotationY + 90) * (Math.PI / 180);
        const x = Math.cos(radY) * Math.cos(radX);
        const y = Math.sin(radX);
        const z = Math.sin(radY) * Math.cos(radX);
        const vector =  {x: x, y: y, z: z }
        //world.sendMessage(VectorFunctions.vectorToString(vector))
        return vector;
    }

    /**
   * Rotate a 3D vector around the origin.
   * @param {import("@minecraft/server").Vector3} vector - The vector to rotate.
   * @param {number} angleX - The rotation angle around the X-axis (in deg).
   * @param {number} angleY - The rotation angle around the Y-axis (in deg).
   * @param {number} angleZ - The rotation angle around the Z-axis (in deg).
   * @returns {import("@minecraft/server").Vector3} - The rotated vector.
   */
    static rotateVector(vector, angleXdeg, angleYdeg, angleZdeg) {
        // Convert angles to radians
        const angleX = angleXdeg * (Math.PI / 180);
        const angleY = angleYdeg * (Math.PI / 180);
        const angleZ = angleZdeg * (Math.PI / 180);

        // Calculate trigonometric values for the angles
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);

        // Extract vector components
        const x = vector.x;
        const y = vector.y;
        const z = vector.z;

        // Rotation around Y-axis (considered "up" axis)
        const rotatedY = y * cosY - z * sinY;

        // Rotation around X-axis
        const temp = x * cosX + z * sinX;

        // Rotation around Z-axis
        const rotatedX = temp * cosZ - y * sinZ;
        const rotatedZ = temp * sinZ + y * cosZ;

        // Return the rotated vector
        return {
            x: rotatedX,
            y: rotatedY,
            z: rotatedZ,
        };
    };


    /**
     * Rotate a 3D vector around the Y-axis.
     * @param {Object} vector - The input vector {x, y, z}.
     * @param {number} angleDeg - The rotation angle in degrees.
     * @returns {Object} - The rotated vector.
     */
    static rotateVectorY(vector, angleDeg) {
        const angleRad = (angleDeg * Math.PI) / 180;
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);
    
        const x = vector.x;
        const z = vector.z;
    
        // Apply rotation matrix for Y-axis
        const rotatedX = x * cosA + z * sinA;
        const rotatedZ = -x * sinA + z * cosA;
    
        // Return the rotated vector
        return {
        x: rotatedX,
        y: vector.y,
        z: rotatedZ,
        };
    }

    /**
 * Rotate a 3D vector around the X-axis (pitch).
 * @param {Object} vector - The input vector {x, y, z}.
 * @param {number} angleXdeg - The rotation angle in degrees.
 * @returns {Object} - The rotated vector {x, y, z}.
 */
  static rotateVectorX(vector, angleXdeg) {
    const angleX = angleXdeg * (Math.PI / 180);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
  
    const x = vector.x;
    const y = vector.y;
    const z = vector.z;
  
    // Perform the rotation
    const rotatedX = x;
    const rotatedY = y * cosX - z * sinX;
    const rotatedZ = y * sinX + z * cosX;
  
    return {
      x: rotatedX,
      y: rotatedY,
      z: rotatedZ,
    };
  }

    /**
     * Get the Y-axis rotation (yaw) of a 3D vector.
     * @param {Object} vector - The input vector {x, y, z}.
     * @returns {number} - The Y-axis rotation in degrees.
     */
    static getYRotation(vector) {
      // Calculate the angle using arctangent
      const angleRad = Math.atan2(vector.z, vector.x);
    
      // Convert radians to degrees
      const angleDeg = (angleRad * 180) / Math.PI;
    
      // Adjust the angle to be between 0 and 360 degrees
      const adjustedAngle = (angleDeg + 360) % 360;
    
      return adjustedAngle;
    }

    static stringToVector(inputString: string): Vector3 {
      const [xStr, yStr, zStr] = inputString.split(' ');
      
      // Convert string values to numbers
      const x = parseFloat(xStr);
      const y = parseFloat(yStr);
      const z = parseFloat(zStr);
  
      // Check if conversion was successful
      if (isNaN(x) || isNaN(y) || isNaN(z)) {
        throw new Error("Invalid input: Each component of the vector must be a number.");
      }
  
      return {x: x, y: y, z: z};
    }

  /**
   * Get the rotation angles (in radians) to rotate one vector to another.
   * @param {Vector3} fromVector - The starting vector.
   * @param {Vector3} toVector - The target vector.
   * @returns {{import("@minecraft/server").Vector3}} - The rotation angles.
   */
 /*  static getVectorRotation(fromVector, toVector){
    const epsilon = 0.000001; // A small value to handle floating-point errors

    // Ensure vectors are normalized
    this.normalizeVector()
    const normalize = (v: Vector3) => {
      const length = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
      return { x: v.x / length, y: v.y / length, z: v.z / length };
    };

    const fromNormalized = normalize(fromVector);
    const toNormalized = normalize(toVector);

    // Calculate dot product and cross product
    const dotProduct = fromNormalized.x * toNormalized.x + fromNormalized.y * toNormalized.y + fromNormalized.z * toNormalized.z;
    const crossProduct = {
      x: fromNormalized.y * toNormalized.z - fromNormalized.z * toNormalized.y,
      y: fromNormalized.z * toNormalized.x - fromNormalized.x * toNormalized.z,
      z: fromNormalized.x * toNormalized.y - fromNormalized.y * toNormalized.x,
    };

    // Calculate angles
    const angleX = Math.asin(crossProduct.y);
    const angleY = Math.atan2(-crossProduct.x, crossProduct.z);
    const angleZ = Math.atan2(-fromNormalized.y, fromNormalized.x);

    // Ensure angles are within the correct range
    const clampAngle = (angle) => {
      while (angle > Math.PI) angle -= 2 * Math.PI;
      while (angle < -Math.PI) angle += 2 * Math.PI;
      return angle;
    };

    return {
        x: clampAngle(angleX),
        y: clampAngle(angleY),
        z: clampAngle(angleZ)
    }; */
}

declare global {
  interface String {
    /**Converts a string to Vector3
     * @throws {Error} If the string cannot be converted to a Vector3
     */
    toVector3(): Vector3;
  }
}

String.prototype.toVector3 = function(): Vector3 { return VectorFunctions.stringToVector(this) }