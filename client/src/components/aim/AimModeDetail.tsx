import { BENCHMARK_LEVEL_ORDER, BENCHMARK_LEVELS } from "../../constants/aim";
import type { AimMode, AimModeConfig, BenchmarkLevel } from "../../types/aim";
import { formatAimScore } from "../../utils/aimScore";
import Icon from "../common/Icon";
import "./AimModeDetail.css";

interface AimModeDetailProps {
    aimMode: AimMode;
    benchmarkLevel: BenchmarkLevel;
    activeMode: AimModeConfig;
    activeTargetSize: number;
    aimBest: number | null;
    recentScores: number[];
    onSelectLevel: (level: BenchmarkLevel) => void;
    onStart: () => void;
}

function AimModeDetail({
    aimMode,
    benchmarkLevel,
    activeMode,
    activeTargetSize,
    aimBest,
    recentScores,
    onSelectLevel,
    onStart,
}: AimModeDetailProps) {
    return (
        <div className="mode-detail">
            <span className="difficulty-tag">Level / {activeMode.difficulty}</span>
            <strong>{activeMode.name}</strong>
            <p>{activeMode.description}</p>

            {aimMode === "assessment" && (
                <div className="benchmark-levels">
                    {BENCHMARK_LEVEL_ORDER.map((level) => (
                        <button
                            key={level}
                            type="button"
                            className={benchmarkLevel === level ? "active" : ""}
                            onClick={() => onSelectLevel(level)}
                        >
                            <strong>{BENCHMARK_LEVELS[level].label}</strong>
                            <span>{BENCHMARK_LEVELS[level].size}px</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="aim-brief">
                <span>
                    <strong>
                        {activeMode.durationMs
                            ? activeMode.durationMs / 1000
                            : activeMode.targets}
                    </strong>{" "}
                    {activeMode.durationMs ? "seconds" : "targets"}
                </span>
                <span>
                    <strong>{activeTargetSize}</strong>{" "}
                    {aimMode === "speed" ? "px setting" : "px fixed"}
                </span>
                <span>
                    <strong>
                        {aimBest !== null ? formatAimScore(aimMode, aimBest, 1) : "—"}
                    </strong>{" "}
                    best
                </span>
            </div>

            {recentScores.length > 0 && (
                <div className="recent-attempts">
                    <span>Recent 5</span>
                    <div>
                        {recentScores.map((score, index) => (
                            <i key={`${score}-${index}`}>
                                {formatAimScore(aimMode, score, 1)}
                            </i>
                        ))}
                    </div>
                </div>
            )}

            <button type="button" className="game-action" onClick={onStart}>
                <Icon name="target" />
                {aimMode === "assessment" ? "Test my level" : "Start training"}
            </button>
        </div>
    );
}

export default AimModeDetail;
