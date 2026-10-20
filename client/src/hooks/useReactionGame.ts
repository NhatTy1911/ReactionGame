import { useCallback, useEffect, useRef, useState } from "react";

export type ReactionState = 
    | "idle"
    | "waiting"
    | "ready"
    | "result"
    | "early";

const MAX_HISTORY = 5;
const STORAGE_KEY = "reflex-times";
const BEST_STORAGE_KEY = "reflex-best";

function loadTimes(): number[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(parsed)) return [];

        return parsed.filter(
            (value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0
        ).slice(0, MAX_HISTORY);
    } catch {
        return [];
    }
}

function loadBestTime() : number | null {
    try {
        const saved = localStorage.getItem(BEST_STORAGE_KEY);

        if (saved === null) return null;

        const parsed: unknown = JSON.parse(saved);

        if (typeof parsed === "number" && Number.isFinite(parsed) && parsed >= 0) {
            return parsed;
        }

        return null;
    }
    catch {
        return null;
    }
}

export function useReactionGame() {
    const [reactionState, setReactionState] = useState<ReactionState>("idle");
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [times, setTimes] = useState<number[]>(loadTimes);
    const [bestTime, setBestTime] = useState<number | null>(loadBestTime);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const rafRef = useRef<number | null>(null);

    const clearGameTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const startGame = useCallback(() => {
        clearGameTimer();

        setReactionTime(null);
        startTimeRef.current = null;
        setReactionState("waiting");

        const delay = 1800 + Math.random() * 2800;

        timeoutRef.current = setTimeout(() => {
            timeoutRef.current = null;
            setReactionState("ready");
            rafRef.current = requestAnimationFrame(() => {
                startTimeRef.current = performance.now();
                rafRef.current = null;
            });
        }, delay);
    }, [clearGameTimer]);

    const handleGameClick = useCallback((inputTime: number = performance.now()) => {
        if (reactionState === "waiting") {
            clearGameTimer();
            startTimeRef.current = null;
            setReactionState("early");
            return;
        }

        if (reactionState === "ready") {
            if (startTimeRef.current === null) return;

            const elapsed = Math.max(0, Math.round(inputTime - startTimeRef.current));

            setReactionTime(elapsed);

            setTimes((prev) => [elapsed, ...prev].slice(0, MAX_HISTORY));

            setBestTime((prev) => 
                prev === null ? elapsed : Math.min(prev, elapsed)
            );

            setReactionState("result")
            startTimeRef.current = null;
            return;
        }

        // Idle, early, result => bắt đầu lượt mới
        startGame();
    }, [reactionState, startGame, clearGameTimer]);

    const clearHistory = useCallback(() => {
        setTimes([]);
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
    }, [times]);

    useEffect(() => {
        if (bestTime !== null) {
            localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(bestTime));
        } else {
            localStorage.removeItem(BEST_STORAGE_KEY);
        }
    }, [bestTime]);

    useEffect(() => {
        return () => {
            clearGameTimer();
        }
    }, [clearGameTimer]);

    const average = times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : null;

    return {
        reactionState, reactionTime, times, best: bestTime, average, handleGameClick, clearHistory
    };
}