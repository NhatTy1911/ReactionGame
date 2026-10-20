import "./AimHud.css";
import type { AimMode, AimModeConfig, HitMarker } from "../../types/aim";

export interface AimHudProps {
    aimMode: AimMode;
    activeMode: AimModeConfig;
    hits: number;
    grade: string;
    trackingPercent: number;
    shotsPerSecond: number;
    lastSplit: number | null;
    hitMarker: HitMarker;
}

/** Các nhãn nổi trên vùng chơi: tiến độ, live rating, split time, hiệu ứng trúng. */
function AimHud({
    aimMode,
    activeMode,
    hits,
    grade,
    trackingPercent,
    shotsPerSecond,
    lastSplit,
    hitMarker,
}: AimHudProps) {
    const isTracking = aimMode === "tracking";

    const stageProgress = isTracking
        ? `${trackingPercent}% tracked`
        : activeMode.durationMs
            ? `${hits} hits`
            : `${String(hits + 1).padStart(2, "0")} of ${activeMode.targets}`;

    const rankNote =
        aimMode === "grid"
            ? `${shotsPerSecond.toFixed(1)} hits/s · ${activeMode.advancedMark}`
            : isTracking
                ? `${trackingPercent}% time on target`
                : activeMode.advancedMark;

    return (
        <>
            <span className="aim-stage-label">
                {activeMode.name} / {stageProgress}
            </span>

            <span
                className={`live-rank rank-${isTracking ? "tracking" : grade.toLowerCase()}`}
            >
                <small>Live rating</small>
                <strong>{grade}</strong>
                <i>{rankNote}</i>
            </span>

            {lastSplit ? <span className="split-feedback">+ {lastSplit} ms</span> : null}

            {hitMarker.id > 0 && (
                <span
                    key={hitMarker.id}
                    className="hit-confirm"
                    style={{ left: `${hitMarker.x}%`, top: `${hitMarker.y}%` }}
                />
            )}
        </>
    );
}

export default AimHud;
