import type { AimMode, AimModeConfig } from "../../types/aim";
import { formatAimScore } from "../../utils/aimScore";
import type { AimStats } from "../../utils/aimStats";
import Icon from "../common/Icon";
import "./AimResults.css";

interface AimResultsProps {
    aimMode: AimMode;
    activeMode: AimModeConfig;
    aimBest: number | null;
    hits: number;
    misses: number;
    aimTime: number;
    trackingTime: number;
    bestStreak: number;
    stats: AimStats;
    onRestart: () => void;
    onChooseAnother: () => void;
}

interface ResultMetric {
    label: string;
    value: string | number;
}

function getAdvice(aimMode: AimMode, accuracy: number): string {
    if (aimMode === "tracking") {
        return accuracy >= 70
            ? "Strong control. Keep the movement smooth and centered."
            : "Stay relaxed and guide the pointer through the target's center.";
    }

    return accuracy >= 90
        ? "Keep the control and gradually push your acquisition speed."
        : "Slow down enough to confirm each target before clicking.";
}

function AimResults({
    aimMode,
    activeMode,
    aimBest,
    hits,
    misses,
    aimTime,
    trackingTime,
    bestStreak,
    stats,
    onRestart,
    onChooseAnother,
}: AimResultsProps) {
    const { grade, accuracy, trackingPercent, shotsPerSecond, averageTargetMs } = stats;
    const isTracking = aimMode === "tracking";
    const bestText = aimBest !== null ? formatAimScore(aimMode, aimBest) : "—";

    const headline = isTracking
        ? { value: trackingPercent, unit: "%" }
        : activeMode.durationMs
          ? { value: hits, unit: "hits" }
          : { value: (aimTime / 1000).toFixed(2), unit: "s" };

    const metrics: ResultMetric[] = [
        isTracking
            ? { label: "Time on target", value: `${(trackingTime / 1000).toFixed(1)} s` }
            : aimMode === "grid"
              ? { label: "Hit rate", value: `${shotsPerSecond.toFixed(1)}/s` }
              : { label: "Avg. target", value: `${averageTargetMs} ms` },
        { label: "Accuracy", value: `${accuracy}%` },
        isTracking
            ? { label: "Duration", value: `${(activeMode.durationMs ?? 0) / 1000} s` }
            : { label: "Misses", value: misses },
        isTracking || aimMode === "grid"
            ? { label: "Personal best", value: bestText }
            : { label: "Best streak", value: bestStreak },
    ];

    return (
        <div className="aim-results">
            <div className="result-lead">
                <span className="kicker">{grade} / Drill complete</span>
                <strong>
                    {headline.value}
                    <small>{headline.unit}</small>
                </strong>
                <p>
                    Your {activeMode.name.toLowerCase()} rating is <strong>{grade}</strong>.{" "}
                    {getAdvice(aimMode, accuracy)}
                </p>
                <div className="result-actions">
                    <button type="button" className="game-action" onClick={onRestart}>
                        <Icon name="rotate" />
                        Train again
                    </button>
                    <button
                        type="button"
                        className="result-secondary"
                        onClick={onChooseAnother}
                    >
                        Choose another drill
                    </button>
                </div>
            </div>

            <div className="result-metrics">
                {metrics.map((metric) => (
                    <div key={metric.label}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AimResults;
