import { Logger } from "./Logger";
function gaussianElimination(matrix) {
    const numRows = matrix.length;
    // Forward Elimination
    for (let i = 0; i < numRows; i++) {
        let pivotRow = i;
        for (let j = i + 1; j < numRows; j++) {
            if (Math.abs(matrix[j][i]) > Math.abs(matrix[pivotRow][i])) {
                pivotRow = j;
            }
        }
        // Swap rows
        [matrix[i], matrix[pivotRow]] = [matrix[pivotRow], matrix[i]];
        const pivot = matrix[i][i];
        for (let j = i + 1; j < numRows; j++) {
            const factor = matrix[j][i] / pivot;
            for (let k = i; k <= numRows; k++) {
                matrix[j][k] -= matrix[i][k] * factor;
            }
        }
    }
    // Back Substitution
    const result = new Array(numRows).fill(0);
    for (let i = numRows - 1; i >= 0; i--) {
        result[i] = matrix[i][numRows] / matrix[i][i];
        for (let j = i - 1; j >= 0; j--) {
            matrix[j][numRows] -= matrix[j][i] * result[i];
        }
    }
    return result;
}
export { quadraticFit };
function quadraticFit(points) {
    const matrix = points.map(([x, y]) => [x ** 2, x, 1, y]);
    const coefficients = gaussianElimination(matrix);
    return {
        a: coefficients[0],
        b: coefficients[1],
        c: coefficients[2],
    };
}
// Example usage
const points = [
    [1, 2],
    [2, 1],
    [3, 4],
];
const result = quadraticFit(points);
Logger.log(result, "MATH");
