import { useCallback, useEffect, useRef, useState } from "react";

export type ReactionState = 
    | "idle"
    | "waiting"
    | "ready"
    | "result"
    | "early";

const MAX_HISTORY = 5;
const STORAGE_KEY = "reflex-times";

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

export function useReactionGame() {
    const [reactionState, setReactionState] = useState<ReactionState>("idle");
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [times, setTimes] = useState<number[]>(loadTimes);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const clearGameTimer = useCallback(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const startGame = useCallback(() => {
        clearGameTimer();

        setReactionTime(null);
        startTimeRef.current = null;
        setReactionState("waiting");

        const delay = 1800 + Math.random() * 2800;

        timeoutRef.current = setTimeout(() => {
            startTimeRef.current = performance.now();
            setReactionState("ready");
            timeoutRef.current = null;
        }, delay)
    }, [clearGameTimer]);

    const handleGameClick = useCallback(() => {
        if (reactionState === "waiting") {
            clearGameTimer();
            startTimeRef.current = null;
            setReactionState("early");
            return;
        }

        if (reactionState === "ready" && startTimeRef.current !== null) {
            const elapsed = Math.round(performance.now() - startTimeRef.current);

            setReactionTime(elapsed);

            setTimes((prev) => [elapsed, ...prev].slice(0, MAX_HISTORY));
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
        return () => {
            clearGameTimer();
        }
    }, [clearGameTimer]);

    const best = times.length > 0 ? Math.min(...times) : null;

    const average = times.length > 0 ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : null;

    return {
        reactionState, reactionTime, times, best, average, handleGameClick, clearHistory
    };
}