
export type TargetPosition = [number, number, number];

const TARGET_BOUNDS = {
    minX: -8,
    maxX: 8,
    minY: 1,
    maxY: 5,
    minZ: -11,
    maxZ: -5,
};

export function getRandomTargetPosition(): TargetPosition {
    const x =
        Math.random() * (TARGET_BOUNDS.maxX - TARGET_BOUNDS.minX) +
        TARGET_BOUNDS.minX;

    const y =
        Math.random() * (TARGET_BOUNDS.maxY - TARGET_BOUNDS.minY) +
        TARGET_BOUNDS.minY;

    const z =
        Math.random() * (TARGET_BOUNDS.maxZ - TARGET_BOUNDS.minZ) +
        TARGET_BOUNDS.minZ;

    return [x, y, z];
}
