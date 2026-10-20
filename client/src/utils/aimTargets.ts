import { GRID_WAVE_SIZE, TRACKING_HIT_PADDING } from "../constants/aim";
import type { FieldSize, GridTarget, Point } from "../types/aim";

export const DEFAULT_FIELD_SIZE: FieldSize = { width: 900, height: 520 };

const EDGE_PADDING_X = 24;
const EDGE_PADDING_Y = 44;
const MIN_JUMP_RATIO = 0.28;
const NEXT_TARGET_ATTEMPTS = 8;
const GRID_PLACE_ATTEMPTS = 30;
const GRID_GAP = 28;

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Lề (theo %) để target không bị cắt ở mép vùng chơi. */
function getMargins(field: FieldSize, targetSize: number): Point {
    return {
        x: ((targetSize / 2 + EDGE_PADDING_X) / field.width) * 100,
        y: ((targetSize / 2 + EDGE_PADDING_Y) / field.height) * 100,
    };
}

function randomPoint(margins: Point): Point {
    return {
        x: margins.x + Math.random() * (100 - margins.x * 2),
        y: margins.y + Math.random() * (100 - margins.y * 2),
    };
}

function distanceInPixels(a: Point, b: Point, field: FieldSize): number {
    return Math.hypot(
        (a.x - b.x) * (field.width / 100),
        (a.y - b.y) * (field.height / 100),
    );
}

/** Chọn vị trí target kế tiếp, cố gắng cách target cũ đủ xa (thử tối đa 8 lần). */
export function getNextTarget(
    previous: Point,
    field: FieldSize,
    targetSize: number,
): Point {
    const margins = getMargins(field, targetSize);
    const minDistance = Math.min(field.width, field.height) * MIN_JUMP_RATIO;
    let next = previous;

    for (let attempt = 0; attempt < NEXT_TARGET_ATTEMPTS; attempt += 1) {
        next = randomPoint(margins);

        if (distanceInPixels(next, previous, field) > minDistance) break;
    }

    return next;
}

/** Tạo một đợt 6 target không đè lên nhau. id bắt đầu từ startId + 1. */
export function createGridTargets(
    startId: number,
    field: FieldSize,
    targetSize: number,
): GridTarget[] {
    const margins = getMargins(field, targetSize);
    const minDistance = targetSize + GRID_GAP;
    const targets: GridTarget[] = [];

    for (let index = 0; index < GRID_WAVE_SIZE; index += 1) {
        let candidate = randomPoint(margins);

        for (let attempt = 1; attempt < GRID_PLACE_ATTEMPTS; attempt += 1) {
            const overlaps = targets.some(
                (placed) =>
                    distanceInPixels(candidate, placed, field) < minDistance,
            );

            if (!overlaps) break;

            candidate = randomPoint(margins);
        }

        targets.push({ id: startId + index + 1, ...candidate });
    }

    return targets;
}

/** Vị trí target ở mode Tracking theo thời gian đã trôi qua (ms). */
export function getTrackingPosition(elapsedMs: number): Point {
    const t = elapsedMs / 1000;

    return {
        x: clamp(50 + Math.sin(t * 1.75) * 31 + Math.sin(t * 3.4) * 8, 9, 91),
        y: clamp(50 + Math.sin(t * 2.15 + 1.2) * 27 + Math.cos(t * 3.1) * 7, 13, 87),
    };
}

/** Con trỏ (toạ độ màn hình) có đang nằm trên target không. */
export function isPointerOnTarget(
    pointer: Point,
    bounds: DOMRect,
    target: Point,
    targetSize: number,
): boolean {
    const centerX = bounds.left + (target.x / 100) * bounds.width;
    const centerY = bounds.top + (target.y / 100) * bounds.height;

    return (
        Math.hypot(pointer.x - centerX, pointer.y - centerY) <=
        targetSize / 2 + TRACKING_HIT_PADDING
    );
}
