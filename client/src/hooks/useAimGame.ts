import { useCallback, useEffect, useRef, useState } from "react";
import {
    AIM_MODES,
    COUNTDOWN_START,
    COUNTDOWN_STEP_MS,
} from "../constants/aim";
import type {
    AimMode,
    AimState,
    BenchmarkLevel,
    FieldSize,
    GridTarget,
    HitMarker,
    Point,
} from "../types/aim";
import { getActiveTargetSize, getAimScoreKey } from "../utils/aimScore";
import { calculateAimStats } from "../utils/aimStats";
import {
    DEFAULT_FIELD_SIZE,
    createGridTargets,
    getNextTarget,
    getTrackingPosition,
    isPointerOnTarget,
} from "../utils/aimTargets";
import { useAimHistory } from "./useAimHistory";
import { usePointerTracker } from "./usePointerTracker";

interface UseAimGameOptions {
    /** Target size của mode Rush, lấy từ Settings. */
    targetSize: number;
}

const CENTER: Point = { x: 50, y: 50 };

export function useAimGame({ targetSize }: UseAimGameOptions) {
    const [aimState, setAimState] = useState<AimState>("idle");
    const [aimMode, setAimMode] = useState<AimMode>("assessment");
    const [benchmarkLevel, setBenchmarkLevel] = useState<BenchmarkLevel>("medium");

    const [hits, setHits] = useState(0);
    const [misses, setMisses] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [aimTime, setAimTime] = useState(0);
    const [liveAimTime, setLiveAimTime] = useState(0);
    const [lastSplit, setLastSplit] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(COUNTDOWN_START);
    const [trackingTime, setTrackingTime] = useState(0);
    const [hitMarker, setHitMarker] = useState<HitMarker>({ ...CENTER, id: 0 });
    const [target, setTarget] = useState<Point>(CENTER);
    const [gridTargets, setGridTargets] = useState<GridTarget[]>([]);

    const { history, bests, recordScore } = useAimHistory();
    const { pointerRef, handlePointerMove, handlePointerLeave, resetPointer } =
        usePointerTracker();

    const aimFieldRef = useRef<HTMLDivElement>(null);
    const isPlayingRef = useRef(false);
    const aimStartRef = useRef(0);
    const lastHitRef = useRef(0);
    const hitsRef = useRef(0);
    const streakRef = useRef(0);
    const trackingTimeRef = useRef(0);
    const targetRef = useRef<Point>(CENTER);
    const gridTargetsRef = useRef<GridTarget[]>([]);

    const activeMode = AIM_MODES[aimMode];
    const activeScoreKey = getAimScoreKey(aimMode, benchmarkLevel);
    const activeTargetSize = getActiveTargetSize(aimMode, benchmarkLevel, targetSize);

    const getFieldSize = useCallback((): FieldSize => {
        const field = aimFieldRef.current;

        return {
            width: field?.clientWidth || DEFAULT_FIELD_SIZE.width,
            height: field?.clientHeight || DEFAULT_FIELD_SIZE.height,
        };
    }, []);

    const placeTarget = useCallback((next: Point) => {
        targetRef.current = next;
        setTarget(next);
    }, []);

    const placeGridTargets = useCallback((next: GridTarget[]) => {
        gridTargetsRef.current = next;
        setGridTargets(next);
    }, []);

    const moveTarget = useCallback(() => {
        placeTarget(getNextTarget(targetRef.current, getFieldSize(), activeTargetSize));
    }, [activeTargetSize, getFieldSize, placeTarget]);

    const spawnGridWave = useCallback(() => {
        placeGridTargets(
            createGridTargets(hitsRef.current, getFieldSize(), activeTargetSize),
        );
    }, [activeTargetSize, getFieldSize, placeGridTargets]);

    const beginAim = useCallback(() => {
        isPlayingRef.current = false;
        hitsRef.current = 0;
        streakRef.current = 0;
        trackingTimeRef.current = 0;
        resetPointer();
        placeGridTargets([]);

        setHits(0);
        setMisses(0);
        setStreak(0);
        setBestStreak(0);
        setAimTime(0);
        setLiveAimTime(0);
        setTrackingTime(0);
        setLastSplit(null);
        setHitMarker((previous) => ({ ...previous, id: 0 }));
        setCountdown(COUNTDOWN_START);
        setAimState("countdown");
    }, [placeGridTargets, resetPointer]);

    const backToModeSelect = useCallback(() => {
        isPlayingRef.current = false;
        setAimState("idle");
    }, []);

    const finishGame = useCallback(
        (score: number, elapsed: number) => {
            isPlayingRef.current = false;
            resetPointer();
            setAimTime(elapsed);
            setLiveAimTime(elapsed);
            recordScore(activeScoreKey, score);
            setAimState("result");
        },
        [activeScoreKey, recordScore, resetPointer],
    );

    // 1) Đếm ngược 3 → 2 → 1 rồi vào game
    useEffect(() => {
        if (aimState !== "countdown") return;

        const timer = window.setTimeout(() => {
            if (countdown > 1) {
                setCountdown((value) => value - 1);
                return;
            }

            const now = performance.now();
            aimStartRef.current = now;
            lastHitRef.current = now;
            isPlayingRef.current = true;
            setLiveAimTime(0);

            if (aimMode === "grid") {
                spawnGridWave();
            } else {
                moveTarget();
            }

            setAimState("playing");
        }, COUNTDOWN_STEP_MS);

        return () => window.clearTimeout(timer);
    }, [aimState, countdown, aimMode, spawnGridWave, moveTarget]);

    // 2) Đồng hồ chạy mỗi frame (kèm di chuyển target + tính thời gian trên target ở mode Tracking)
    useEffect(() => {
        if (aimState !== "playing") return;

        const duration = activeMode.durationMs;
        let frame = 0;
        let previousFrame = performance.now();

        const tick = () => {
            const now = performance.now();
            const rawElapsed = now - aimStartRef.current;
            const elapsed = Math.round(
                duration !== undefined ? Math.min(rawElapsed, duration) : rawElapsed,
            );

            setLiveAimTime(elapsed);

            if (aimMode === "tracking") {
                const nextTarget = getTrackingPosition(elapsed);
                placeTarget(nextTarget);

                const bounds = aimFieldRef.current?.getBoundingClientRect();
                const pointer = pointerRef.current;
                const isHeld =
                    bounds !== undefined &&
                    pointer.active &&
                    document.visibilityState === "visible" &&
                    document.hasFocus() &&
                    isPointerOnTarget(pointer, bounds, nextTarget, activeTargetSize);

                if (isHeld) {
                    const trackingEnd = aimStartRef.current + (duration ?? elapsed);
                    const frameEnd = Math.min(now, trackingEnd);

                    trackingTimeRef.current += Math.max(0, frameEnd - previousFrame);
                    setTrackingTime(Math.round(trackingTimeRef.current));
                }
            }

            previousFrame = now;
            frame = window.requestAnimationFrame(tick);
        };

        frame = window.requestAnimationFrame(tick);

        return () => window.cancelAnimationFrame(frame);
    }, [
        aimState,
        aimMode,
        activeMode.durationMs,
        activeTargetSize,
        placeTarget,
        pointerRef,
    ]);

    // 3) Hết giờ với các mode có thời lượng (rush, grid, tracking)
    useEffect(() => {
        const duration = activeMode.durationMs;

        if (aimState !== "playing" || duration === undefined) return;

        // Tính phần thời gian còn lại từ mốc bắt đầu thật, không phải từ lúc effect chạy
        const remaining = Math.max(
            0,
            duration - (performance.now() - aimStartRef.current),
        );

        const timer = window.setTimeout(() => {
            const isTracking = aimMode === "tracking";
            const score = isTracking
                ? Math.round((trackingTimeRef.current / duration) * 100)
                : hitsRef.current;

            if (isTracking) {
                setTrackingTime(Math.round(trackingTimeRef.current));
            } else {
                setHits(score);
            }

            finishGame(score, duration);
        }, remaining);

        return () => window.clearTimeout(timer);
    }, [aimState, aimMode, activeMode.durationMs, finishGame]);

    /**
     * Bắn trúng target. Với mode grid truyền target vừa bắn; các mode khác không cần tham số
     * (vị trí lấy từ ref nên luôn mới nhất).
     */
    const hitTarget = useCallback(
        (gridTarget?: GridTarget) => {
            if (!isPlayingRef.current) return;

            const now = performance.now();
            const position = gridTarget ?? targetRef.current;
            const nextHits = hitsRef.current + 1;
            const nextStreak = streakRef.current + 1;

            hitsRef.current = nextHits;
            streakRef.current = nextStreak;

            setHits(nextHits);
            setStreak(nextStreak);
            setBestStreak((previous) => Math.max(previous, nextStreak));
            setLastSplit(Math.round(now - lastHitRef.current));
            setHitMarker({ x: position.x, y: position.y, id: nextHits });
            lastHitRef.current = now;

            // Benchmark: đủ số target thì kết thúc, điểm là thời gian hoàn thành
            if (!activeMode.durationMs && nextHits >= activeMode.targets) {
                const elapsed = Math.round(now - aimStartRef.current);
                finishGame(elapsed, elapsed);
                return;
            }

            if (aimMode === "grid" && gridTarget) {
                const remaining = gridTargetsRef.current.filter(
                    (item) => item.id !== gridTarget.id,
                );

                if (remaining.length === 0) {
                    spawnGridWave();
                } else {
                    placeGridTargets(remaining);
                }
            } else {
                moveTarget();
            }
        },
        [
            activeMode.durationMs,
            activeMode.targets,
            aimMode,
            finishGame,
            moveTarget,
            placeGridTargets,
            spawnGridWave,
        ],
    );

    const missTarget = useCallback(() => {
        if (!isPlayingRef.current || aimMode === "tracking") return;

        streakRef.current = 0;
        setMisses((value) => value + 1);
        setStreak(0);
    }, [aimMode]);

    const stats = calculateAimStats({
        mode: aimMode,
        state: aimState,
        config: activeMode,
        hits,
        misses,
        aimTime,
        liveAimTime,
        trackingTime,
    });

    return {
        // ref + handler cho vùng chơi
        aimFieldRef,
        handlePointerMove,
        handlePointerLeave,

        // trạng thái game
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

        // dữ liệu đã lưu của mode đang chọn
        recentScores: history[activeScoreKey],
        aimBest: bests[activeScoreKey],

        // số liệu suy ra (accuracy, grade, progress...)
        stats,

        // hành động
        setAimMode,
        setBenchmarkLevel,
        beginAim,
        backToModeSelect,
        hitTarget,
        missTarget,
    };
}
