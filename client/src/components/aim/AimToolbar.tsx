import { BENCHMARK_LEVELS } from "../../constants/aim";
import type {
    AimMode,
    AimModeConfig,
    AimState,
    BenchmarkLevel,
} from "../../types/aim";
import { formatAimScore } from "../../utils/aimScore";
import "./AimToolbar.css";

interface AimToolbarProps {
    aimState: AimState;
    aimMode: AimMode;
    benchmarkLevel: BenchmarkLevel;
    activeMode: AimModeConfig;
    activeTargetSize: number;
    aimBest: number | null;
    displayedTime: number;
    accuracy: number;
    streak: number;
    onBack: () => void;
}

function AimToolbar({
    aimState,
    aimMode,
    benchmarkLevel,
    activeMode,
    activeTargetSize,
    aimBest,
    displayedTime,
    accuracy,
    streak,
    onBack,
}: AimToolbarProps) {
    const isIdle = aimState === "idle";

    return (
        <div className="play-toolbar aim-toolbar">
            <button type="button" className="back-button" onClick={onBack}>
                ← Games
            </button>

            <div>
                <span>{isIdle ? "Selected drill" : "Time"}</span>
                <strong>
                    {isIdle
                        ? activeMode.label
                        : `${(displayedTime / 1000).toFixed(2)} s`}
                </strong>
            </div>

            <div>
                <span>{isIdle ? "Target size" : "Accuracy"}</span>
                <strong>{isIdle ? `${activeTargetSize}px` : `${accuracy}%`}</strong>
            </div>

            <div>
                <span>{isIdle ? "Difficulty" : "Streak"}</span>
                <strong>{isIdle ? activeMode.difficulty : streak}</strong>
            </div>

            <div>
                <span>
                    {aimMode === "assessment"
                        ? `${BENCHMARK_LEVELS[benchmarkLevel].label} best`
                        : "Mode best"}
                </span>
                <strong>
                    {aimBest !== null ? formatAimScore(aimMode, aimBest) : "—"}
                </strong>
            </div>
        </div>
    );
}

export default AimToolbar;
