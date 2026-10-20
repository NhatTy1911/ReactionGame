import { AIM_MODES, BENCHMARK_LEVELS, MIN_TARGET_SIZE } from "../constants/aim";
import type { AimMode, AimScoreKey, BenchmarkLevel } from "../types/aim";

export function getAimScoreKey(
    mode: AimMode,
    benchmarkLevel: BenchmarkLevel,
): AimScoreKey {
    return mode === "assessment" ? `assessment-${benchmarkLevel}` : mode;
}

/** Benchmark tính bằng thời gian (thấp hơn là tốt), các mode còn lại tính điểm (cao hơn là tốt). */
export function isLowerBetter(key: AimScoreKey): boolean {
    return key.startsWith("assessment-");
}

export function getBetterAimScore(
    key: AimScoreKey,
    current: number | null,
    score: number,
): number {
    if (current === null) return score;

    return isLowerBetter(key)
        ? Math.min(current, score)
        : Math.max(current, score);
}

/** Kích thước target thực tế của mode đang chọn. rushTargetSize là giá trị từ Settings. */
export function getActiveTargetSize(
    mode: AimMode,
    benchmarkLevel: BenchmarkLevel,
    rushTargetSize: number,
): number {
    if (mode === "assessment") return BENCHMARK_LEVELS[benchmarkLevel].size;

    const config = AIM_MODES[mode];

    return (
        config.fixedSize ??
        Math.max(MIN_TARGET_SIZE, rushTargetSize + config.sizeOffset)
    );
}

/** Định dạng điểm theo từng mode: tracking = %, benchmark = giây, còn lại = số hit. */
export function formatAimScore(
    mode: AimMode,
    score: number,
    fractionDigits = 2,
): string {
    if (mode === "tracking") return `${score}%`;
    if (mode === "assessment") {
        return `${(score / 1000).toFixed(fractionDigits)} s`;
    }

    return `${score} hits`;
}
