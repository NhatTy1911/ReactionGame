import type {
    AimMode,
    AimModeConfig,
    AimScoreKey,
    BenchmarkLevel,
    BenchmarkLevelConfig,
} from "../types/aim";

export const MAX_AIM_HISTORY = 5;

export const COUNTDOWN_START = 3;
export const COUNTDOWN_STEP_MS = 650;

export const GRID_WAVE_SIZE = 6;

export const DEFAULT_TARGET_SIZE = 64;
export const MIN_TARGET_SIZE = 30;

/** Sai số (px) cho phép khi con trỏ nằm ngoài mép target ở mode Tracking. */
export const TRACKING_HIT_PADDING = 5;

export const AIM_SCORE_KEYS: AimScoreKey[] = [
    "assessment-easy",
    "assessment-medium",
    "assessment-hard",
    "speed",
    "grid",
    "tracking",
];

export const BENCHMARK_LEVELS: Record<BenchmarkLevel, BenchmarkLevelConfig> = {
    easy: { label: "Easy", size: 64 },
    medium: { label: "Medium", size: 48 },
    hard: { label: "Hard", size: 36 },
};

export const AIM_MODES: Record<AimMode, AimModeConfig> = {
    assessment: {
        name: "30 Target Benchmark",
        label: "Benchmark",
        description: "Choose a target size, clear 30 targets and find your pace.",
        difficulty: "3 levels",
        targets: 30,
        sizeOffset: 0,
        advancedMark: "Advanced ≤ 20.0s",
    },
    speed: {
        name: "30 Second Rush",
        label: "Endurance",
        description:
            "Targets keep spawning for 30 seconds. Score as many hits as possible.",
        difficulty: "Open score",
        targets: 0,
        sizeOffset: -8,
        durationMs: 30000,
        advancedMark: "Advanced ≥ 55 hits",
    },
    grid: {
        name: "Grid Shot",
        label: "Speed",
        description:
            "Clear waves of six targets as quickly as possible for 30 seconds.",
        difficulty: "Open score",
        targets: 0,
        sizeOffset: 0,
        fixedSize: 48,
        durationMs: 30000,
        advancedMark: "Legendary ≥ 4.5 hits/s",
    },
    tracking: {
        name: "Tracking",
        label: "Control",
        description: "Keep your pointer on the moving target for 30 seconds.",
        difficulty: "Open score",
        targets: 0,
        sizeOffset: 0,
        fixedSize: 68,
        durationMs: 30000,
        advancedMark: "Stay on target",
    },
};

/** Thứ tự hiển thị trong màn chọn mode. */
export const AIM_MODE_ORDER = Object.keys(AIM_MODES) as AimMode[];
export const BENCHMARK_LEVEL_ORDER = Object.keys(
    BENCHMARK_LEVELS,
) as BenchmarkLevel[];
