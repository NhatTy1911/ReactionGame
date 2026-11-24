export type TargetPosition = [number, number, number];

/** Vị trí mắt (camera) người chơi. FpsCanvas dùng chung hằng số này để hai bên không lệch nhau. */
export const PLAYER_EYE: TargetPosition = [0, 1.7, 8];

/** Mọi bóng đều cách mắt đúng khoảng này, nên kích thước hiện trên màn hình luôn như nhau. */
export const TARGET_DISTANCE = 14;

/** Vùng sinh bóng tính theo góc nhìn từ camera (độ), không phải toạ độ thế giới. */
const YAW_LIMIT_DEG = 30;
const PITCH_MIN_DEG = -2; // thấp hơn nữa bóng sẽ chạm sàn
const PITCH_MAX_DEG = 16;

/** Bóng mới phải lệch ít nhất góc này so với bóng vừa bắn, để mỗi lần đều phải di chuột. */
export const MIN_SEPARATION_DEG = 15;

const MAX_TRIES = 24;
const DEG = Math.PI / 180;

function toPosition(yawDeg: number, pitchDeg: number): TargetPosition {
    const yaw = yawDeg * DEG;
    const pitch = pitchDeg * DEG;
    const horizontal = Math.cos(pitch) * TARGET_DISTANCE;

    return [
        PLAYER_EYE[0] + Math.sin(yaw) * horizontal,
        PLAYER_EYE[1] + Math.sin(pitch) * TARGET_DISTANCE,
        PLAYER_EYE[2] - Math.cos(yaw) * horizontal,
    ];
}

/** Góc (độ) giữa hai bóng khi nhìn từ mắt người chơi. */
export function angleBetweenTargets(a: TargetPosition, b: TargetPosition): number {
    const ax = a[0] - PLAYER_EYE[0];
    const ay = a[1] - PLAYER_EYE[1];
    const az = a[2] - PLAYER_EYE[2];
    const bx = b[0] - PLAYER_EYE[0];
    const by = b[1] - PLAYER_EYE[1];
    const bz = b[2] - PLAYER_EYE[2];

    const dot = ax * bx + ay * by + az * bz;
    const lengths = Math.hypot(ax, ay, az) * Math.hypot(bx, by, bz);

    if (lengths === 0) return 0;

    return Math.acos(Math.min(1, Math.max(-1, dot / lengths))) / DEG;
}

/**
 * Chọn vị trí bóng tiếp theo.
 * - Nằm trên mặt cầu quanh mắt (cùng khoảng cách) trong vùng nhìn phía trước.
 * - Nếu có `previous`: lệch ít nhất MIN_SEPARATION_DEG so với bóng đó.
 *   Thử ngẫu nhiên nhiều lần; nếu vẫn không được thì lấy phương án xa nhất đã thử.
 */
export function getRandomTargetPosition(
    previous?: TargetPosition,
    random: () => number = Math.random,
): TargetPosition {
    let best: TargetPosition | null = null;
    let bestAngle = -1;

    for (let i = 0; i < MAX_TRIES; i += 1) {
        const yaw = (random() * 2 - 1) * YAW_LIMIT_DEG;
        const pitch = PITCH_MIN_DEG + random() * (PITCH_MAX_DEG - PITCH_MIN_DEG);
        const candidate = toPosition(yaw, pitch);

        if (!previous) return candidate;

        const angle = angleBetweenTargets(previous, candidate);

        if (angle >= MIN_SEPARATION_DEG) return candidate;

        if (angle > bestAngle) {
            best = candidate;
            bestAngle = angle;
        }
    }

    return best ?? toPosition(0, (PITCH_MIN_DEG + PITCH_MAX_DEG) / 2);
}
