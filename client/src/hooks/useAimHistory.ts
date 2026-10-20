import { useCallback, useEffect, useState } from "react";
import { MAX_AIM_HISTORY } from "../constants/aim";
import type { AimBests, AimHistory, AimScoreKey } from "../types/aim";
import { getBetterAimScore } from "../utils/aimScore";
import {
    createEmptyBests,
    createEmptyHistory,
    loadAimBests,
    loadAimHistory,
    saveAimBests,
    saveAimHistory,
} from "../utils/aimStorage";

/** Lịch sử 5 lượt gần nhất và best của từng mode, tự đồng bộ với localStorage. */
export function useAimHistory() {
    const [history, setHistory] = useState<AimHistory>(loadAimHistory);
    const [bests, setBests] = useState<AimBests>(() => loadAimBests(history));

    useEffect(() => {
        saveAimHistory(history);
    }, [history]);

    useEffect(() => {
        saveAimBests(bests);
    }, [bests]);

    const recordScore = useCallback((key: AimScoreKey, score: number) => {
        setHistory((previous) => ({
            ...previous,
            [key]: [score, ...previous[key]].slice(0, MAX_AIM_HISTORY),
        }));
        setBests((previous) => ({
            ...previous,
            [key]: getBetterAimScore(key, previous[key], score),
        }));
    }, []);

    const clearHistory = useCallback(() => {
        setHistory(createEmptyHistory());
        setBests(createEmptyBests());
    }, []);

    return { history, bests, recordScore, clearHistory };
}
