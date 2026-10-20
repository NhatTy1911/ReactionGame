import type { AimMode, AimModeConfig, AimState } from "../types/aim";

export interface AimStatsInput {
    mode: AimMode;
    state: AimState;
    config: AimModeConfig;
    hits: number;
    misses: number;
    /** Thời gian chốt khi kết thúc (ms). */
    aimTime: number;
    /** Thời gian đang chạy (ms). */
    liveAimTime: number;
    /** Thời gian con trỏ nằm trên target ở mode Tracking (ms). */
    trackingTime: number;
}

export interface AimStats {
    trackingPercent: number;
    accuracy: number;
    averageTargetMs: number;
    shotsPerSecond: number;
    progressPercent: number;
    /** Thời gian hiển thị ở toolbar: đếm ngược với mode có thời lượng, đếm lên với benchmark. */
    displayedTime: number;
    grade: string;
}

interface GradeInput {
    mode: AimMode;
    hits: number;
    liveAimTime: number;
    trackingPercent: number;
    paceTime: number;
    projectedHits: number;
    shotsPerSecond: number;
}

function getGrade({
    mode,
    hits,
    liveAimTime,
    trackingPercent,
    paceTime,
    projectedHits,
    shotsPerSecond,
}: GradeInput): string {
    const isCalibrating = mode === "tracking" ? liveAimTime === 0 : hits === 0;

    if (isCalibrating) return "Calibrating";

    switch (mode) {
        case "assessment":
            if (paceTime <= 15000) return "Elite";
            if (paceTime <= 20000) return "Advanced";
            if (paceTime <= 30000) return "Intermediate";
            return "Foundation";
        case "speed":
            if (projectedHits >= 75) return "Elite";
            if (projectedHits >= 55) return "Advanced";
            if (projectedHits >= 35) return "Intermediate";
            return "Foundation";
        case "grid":
            if (shotsPerSecond >= 4.5) return "Legendary";
            if (shotsPerSecond >= 3.5) return "Professional";
            if (shotsPerSecond >= 2.5) return "Skilled";
            if (shotsPerSecond >= 1.5) return "Intermediate";
            return "Beginner";
        case "tracking":
            return `${trackingPercent}%`;
    }
}

export function calculateAimStats({
    mode,
    state,
    config,
    hits,
    misses,
    aimTime,
    liveAimTime,
    trackingTime,
}: AimStatsInput): AimStats {
    const trackingPercent =
        liveAimTime > 0
            ? Math.min(100, Math.round((trackingTime / liveAimTime) * 100))
            : 0;

    const accuracy =
        mode === "tracking"
            ? trackingPercent
            : hits + misses > 0
                ? Math.round((hits / (hits + misses)) * 100)
                : 0;

    const averageTargetMs = aimTime && hits ? Math.round(aimTime / hits) : 0;

    // Thời gian dự kiến để xong benchmark theo nhịp hiện tại
    const paceTime = state === "result" ? aimTime : hits > 0 ? (liveAimTime / hits) * config.targets : 0;

    // Số hit dự kiến khi hết giờ theo nhịp hiện tại
    const projectedHits =
        state === "result"
            ? hits
            : liveAimTime > 0
                ? Math.round((hits / liveAimTime) * (config.durationMs ?? 0))
                : 0;

    const shotsPerSecond = liveAimTime > 0 ? hits / (liveAimTime / 1000) : 0;

    const progressPercent = Math.min(
        100,
        config.durationMs
            ? (liveAimTime / config.durationMs) * 100
            : config.targets > 0
                ? (hits / config.targets) * 100
                : 0,
    );

    const displayedTime = config.durationMs
        ? Math.max(0, config.durationMs - liveAimTime)
        : liveAimTime;

    return {
        trackingPercent,
        accuracy,
        averageTargetMs,
        shotsPerSecond,
        progressPercent,
        displayedTime,
        grade: getGrade({
            mode,
            hits,
            liveAimTime,
            trackingPercent,
            paceTime,
            projectedHits,
            shotsPerSecond,
        }),
    };
}
