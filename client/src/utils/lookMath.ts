export interface LookState {
    yaw: number;
    pitch: number;
}

/** Radian trên mỗi count của chuột (giá trị cũ của bạn). */
export const DEFAULT_SENSITIVITY = 0.002;

/** Giới hạn ngẩng/cúi, chừa 0.01 rad để không bị gimbal flip ở ±90°. */
export const MAX_PITCH = Math.PI / 2 - 0.01;

/** Một event có delta lớn hơn mức này coi là lỗi của trình duyệt (Chrome đôi khi nhảy vọt khi vừa lock). */
export const MAX_DELTA_PER_EVENT = 1000;

const TWO_PI = Math.PI * 2;

/** Đưa góc về khoảng [-π, π) để yaw không phình to và mất độ chính xác khi xoay nhiều vòng. */
export function wrapAngle(angle: number): number {
    const wrapped = (angle + Math.PI) % TWO_PI;

    return (wrapped < 0 ? wrapped + TWO_PI : wrapped) - Math.PI;
}

/**
 * Cộng delta chuột vào state, 1:1, không làm mượt.
 * Sửa trực tiếp `state` (không tạo object mới) để không sinh rác mỗi event.
 * Trả về false nếu delta bị bỏ qua.
 */
export function applyLookDelta(
    state: LookState,
    movementX: number,
    movementY: number,
    sensitivity: number,
): boolean {
    if (!Number.isFinite(movementX) || !Number.isFinite(movementY)) return false;
    if (
        Math.abs(movementX) > MAX_DELTA_PER_EVENT ||
        Math.abs(movementY) > MAX_DELTA_PER_EVENT
    ) {
        return false;
    }

    state.yaw = wrapAngle(state.yaw - movementX * sensitivity);
    state.pitch = Math.min(
        MAX_PITCH,
        Math.max(-MAX_PITCH, state.pitch - movementY * sensitivity),
    );

    return true;
}
