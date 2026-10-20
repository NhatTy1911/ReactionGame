import AimCountdown from "../components/aim/AimCountdown";
import AimModeSelect from "../components/aim/AimModeSelect";
import AimPlaying from "../components/aim/AimPlaying";
import AimResults from "../components/aim/AimResults";
import AimToolbar from "../components/aim/AimToolbar";
import { DEFAULT_TARGET_SIZE } from "../constants/aim";
import { useAimGame } from "../hooks/useAimGame";
import type { Screen } from "../types/game";
import "./AimGamePage.css";

interface AimGamePageProps {
    onNavigate: (screen: Screen) => void;
    /** Target size của mode Rush lấy từ Settings (S/M/L = 48/64/80). */
    targetSize?: number;
}

function AimGamePage({ onNavigate, targetSize = DEFAULT_TARGET_SIZE }: AimGamePageProps) {
    const {
        aimFieldRef,
        handlePointerMove,
        handlePointerLeave,
        aimState,
        aimMode,
        benchmarkLevel,
        activeMode,
        activeTargetSize,
        countdown,
        hits,
        misses,
        streak,
        bestStreak,
        aimTime,
        trackingTime,
        lastSplit,
        hitMarker,
        target,
        gridTargets,
        recentScores,
        aimBest,
        stats,
        setAimMode,
        setBenchmarkLevel,
        beginAim,
        backToModeSelect,
        hitTarget,
        missTarget,
    } = useAimGame({ targetSize });

    return (
        <section className="play-screen aim-screen page-center">
            <AimToolbar
                aimState={aimState}
                aimMode={aimMode}
                benchmarkLevel={benchmarkLevel}
                activeMode={activeMode}
                activeTargetSize={activeTargetSize}
                aimBest={aimBest}
                displayedTime={stats.displayedTime}
                accuracy={stats.accuracy}
                streak={streak}
                onBack={() => onNavigate("games")}
            />

            <div
                ref={aimFieldRef}
                className={`aim-field aim-${aimState} aim-mode-${aimMode}`}
                onPointerDown={missTarget}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
            >
                {aimState === "idle" && (
                    <AimModeSelect
                        aimMode={aimMode}
                        benchmarkLevel={benchmarkLevel}
                        activeMode={activeMode}
                        activeTargetSize={activeTargetSize}
                        aimBest={aimBest}
                        recentScores={recentScores}
                        onSelectMode={setAimMode}
                        onSelectLevel={setBenchmarkLevel}
                        onStart={beginAim}
                    />
                )}

                {aimState === "countdown" && <AimCountdown countdown={countdown} />}

                {aimState === "playing" && (
                    <AimPlaying
                        aimMode={aimMode}
                        activeMode={activeMode}
                        hits={hits}
                        grade={stats.grade}
                        trackingPercent={stats.trackingPercent}
                        shotsPerSecond={stats.shotsPerSecond}
                        lastSplit={lastSplit}
                        hitMarker={hitMarker}
                        activeTargetSize={activeTargetSize}
                        target={target}
                        gridTargets={gridTargets}
                        progressPercent={stats.progressPercent}
                        onHitTarget={hitTarget}
                    />
                )}

                {aimState === "result" && (
                    <AimResults
                        aimMode={aimMode}
                        activeMode={activeMode}
                        aimBest={aimBest}
                        hits={hits}
                        misses={misses}
                        aimTime={aimTime}
                        trackingTime={trackingTime}
                        bestStreak={bestStreak}
                        stats={stats}
                        onRestart={beginAim}
                        onChooseAnother={backToModeSelect}
                    />
                )}
            </div>
        </section>
    );
}

export default AimGamePage;
