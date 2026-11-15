import { memo, useCallback, useRef, useState } from "react";
import type { Screen } from "../types/game";
import FpsCanvas from "../components/aim3D/FpsCanvas";
import FpsResults from "../components/aim3D/FpsResults";
import { LOW_TIME_SECONDS, ROUND_SECONDS } from "../constants/fps";
import { useFpsSession } from "../hooks/useFpsSession";
import { calcAccuracy, calcScore } from "../utils/fpsScore";
import { loadBestScore, saveBestScore } from "../utils/fpsStorage";
import { HitMarkerStore, type WorldPoint } from "../utils/hitMarkerStore";
import "./FpsTrainerPage.css";

// memo: bắn trúng làm page render lại (đổi điểm), nhưng canvas 3D không cần render theo
const StableFpsCanvas = memo(FpsCanvas);

interface FpsTrainerPageProps {
    onNavigate: (screen: Screen) => void;
}

function FpsTrainerPage({ onNavigate }: FpsTrainerPageProps) {
    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [best, setBest] = useState(loadBestScore);
    const [isNewBest, setIsNewBest] = useState(false);
    const [markers] = useState(() => new HitMarkerStore());

    const setHitLayer = useCallback(
        (element: HTMLDivElement | null) => {
            markers.setContainer(element);
        },
        [markers],
    );

    // Bản sao của hits/misses/best để callback hết giờ đọc được giá trị mới nhất
    const statsRef = useRef({ hits: 0, misses: 0 });
    const bestRef = useRef(best);

    const resetRound = useCallback(() => {
        statsRef.current = { hits: 0, misses: 0 };
        setHits(0);
        setMisses(0);
        setIsNewBest(false);
    }, []);

    const finishRound = useCallback(() => {
        const score = calcScore(statsRef.current.hits, statsRef.current.misses);

        if (score > bestRef.current) {
            bestRef.current = score;
            saveBestScore(score);
            setBest(score);
            setIsNewBest(true);
        }
    }, []);

    const { phase, count, timeLeft, phaseRef, restart, exit } = useFpsSession({
        onCountdownStart: resetRound,
        onFinish: finishRound,
    });

    // Chỉ tính điểm khi đang trong giờ chơi. position = vị trí quả bóng trong thế giới 3D.
    const handleHit = useCallback((position: WorldPoint) => {
        if (phaseRef.current !== "playing") return;

        statsRef.current.hits += 1;
        setHits((prev) => prev + 1);
        markers.add(position);
    }, [phaseRef, markers]);

    const handleMiss = useCallback(() => {
        if (phaseRef.current !== "playing") return;

        statsRef.current.misses += 1;
        setMisses((prev) => prev + 1);
    }, [phaseRef]);

    const score = calcScore(hits, misses);
    const accuracy = calcAccuracy(hits, misses);
    const isLowTime = phase === "playing" && timeLeft <= LOW_TIME_SECONDS;

    return (
        <section className="play-screen fps-screen">
            <header className="fps-toolbar">
                <button
                    type="button"
                    onClick={() => onNavigate("games")}
                >
                    ← Back
                </button>

                <div className="fps-title">
                    <h1>FPS Trainer</h1>
                    <span>3D Aim Training</span>
                </div>

                <span className="fps-status">PROTOTYPE</span>
            </header>

            <div id="fps-arena" className="fps-arena">
                <StableFpsCanvas onHit={handleHit} onMiss={handleMiss} markers={markers} canShoot={phase === "playing"}/>

                <div className="fps-crosshair" aria-hidden="true">
                    <span />
                    <span />
                </div>

                {/* Lớp chứa các dấu X bắn trúng (HitMarkers trong canvas đặt vị trí từng frame) */}
                <div className="fps-hit-layer" ref={setHitLayer} aria-hidden="true" />

                <div className="fps-hud">
                    <div className="fps-hud-side">
                        <div className="fps-hud-item">
                            <span>SCORE</span>
                            <strong>{score}</strong>
                        </div>

                        <div className="fps-hud-item">
                            <span>ACCURACY</span>
                            <strong>{accuracy.toFixed(1)}%</strong>
                        </div>
                    </div>

                    <div className={isLowTime ? "fps-timer is-low" : "fps-timer"}>
                        <span>TIME</span>
                        <strong>{timeLeft}</strong>
                    </div>

                    <div className="fps-hud-side is-right">
                        <div className="fps-hud-item">
                            <span>HITS</span>
                            <strong>{hits}</strong>
                        </div>

                        <div className="fps-hud-item">
                            <span>MISSES</span>
                            <strong>{misses}</strong>
                        </div>
                    </div>
                </div>

                {phase === "idle" && (
                    <div className="fps-instructions">
                        <h2>FPS Trainer 3D</h2>
                        <p>Hit as many targets as you can in {ROUND_SECONDS} seconds.</p>
                        <p>Click to go fullscreen and start. Press ESC to exit.</p>
                        {best > 0 && <p>Best score: {best}</p>}
                    </div>
                )}

                {phase === "countdown" && (
                    <div className="fps-countdown" role="status" aria-live="assertive">
                        <span key={count}>{count}</span>
                    </div>
                )}

                {phase === "finished" && (
                    <FpsResults
                        score={score}
                        best={best}
                        isNewBest={isNewBest}
                        hits={hits}
                        misses={misses}
                        accuracy={accuracy}
                        onRestart={restart}
                        onExit={exit}
                    />
                )}
            </div>
        </section>
    );
}

export default FpsTrainerPage;
