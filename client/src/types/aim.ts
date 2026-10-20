export type AimState = "idle" | "countdown" | "playing" | "result";
export type AimMode = "assessment" | "speed" | "grid" | "tracking";
export type BenchmarkLevel = "easy" | "medium" | "hard";

/** Key dùng để lưu lịch sử / best: benchmark tách theo level, các mode khác dùng tên mode. */
export type AimScoreKey =
    | `assessment-${BenchmarkLevel}`
    | Exclude<AimMode, "assessment">;

export type AimHistory = Record<AimScoreKey, number[]>;
export type AimBests = Record<AimScoreKey, number | null>;

/** Toạ độ theo phần trăm (0-100) bên trong vùng chơi. */
export interface Point {
    x: number;
    y: number;
}

export interface GridTarget extends Point {
    id: number;
}

export interface HitMarker extends Point {
    id: number;
}

/** Kích thước vùng chơi tính bằng px. */
export interface FieldSize {
    width: number;
    height: number;
}

export interface BenchmarkLevelConfig {
    label: string;
    size: number;
}

export interface AimModeConfig {
    name: string;
    label: string;
    description: string;
    difficulty: string;
    /** Số target cần bắn (chỉ dùng cho mode không có thời gian). */
    targets: number;
    /** Chênh lệch so với target size trong Settings (chỉ mode speed dùng). */
    sizeOffset: number;
    fixedSize?: number;
    durationMs?: number;
    advancedMark: string;
}
