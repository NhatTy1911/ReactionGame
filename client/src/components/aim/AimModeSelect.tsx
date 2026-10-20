import type { AimMode, AimModeConfig, BenchmarkLevel } from "../../types/aim";
import AimModeDetail from "./AimModeDetail";
import AimModeList from "./AimModeList";
import "./AimModeSelect.css";

interface AimModeSelectProps {
    aimMode: AimMode;
    benchmarkLevel: BenchmarkLevel;
    activeMode: AimModeConfig;
    activeTargetSize: number;
    aimBest: number | null;
    recentScores: number[];
    onSelectMode: (mode: AimMode) => void;
    onSelectLevel: (level: BenchmarkLevel) => void;
    onStart: () => void;
}

function AimModeSelect({
    aimMode,
    benchmarkLevel,
    activeMode,
    activeTargetSize,
    aimBest,
    recentScores,
    onSelectMode,
    onSelectLevel,
    onStart,
}: AimModeSelectProps) {
    return (
        <div className="aim-mode-select">
            <div className="mode-heading">
                <span className="kicker">Choose your training protocol</span>
                <strong>Train with purpose.</strong>
                <p>
                    Take the assessment first to find your level, or target a
                    specific weakness with a focused drill.
                </p>
            </div>

            <div className="mode-layout">
                <AimModeList aimMode={aimMode} onSelect={onSelectMode} />
                <AimModeDetail
                    aimMode={aimMode}
                    benchmarkLevel={benchmarkLevel}
                    activeMode={activeMode}
                    activeTargetSize={activeTargetSize}
                    aimBest={aimBest}
                    recentScores={recentScores}
                    onSelectLevel={onSelectLevel}
                    onStart={onStart}
                />
            </div>
        </div>
    );
}

export default AimModeSelect;
