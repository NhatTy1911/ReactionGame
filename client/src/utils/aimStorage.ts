import { AIM_SCORE_KEYS, MAX_AIM_HISTORY } from "../constants/aim";
import type { AimBests, AimHistory, AimScoreKey } from "../types/aim";
import { isLowerBetter } from "./aimScore";

const HISTORY_PREFIX = "aim-mode-history-v3-";
const BEST_PREFIX = "aim-mode-best-v3-";
// Key cũ của bản Figma (v2). Nếu project mới không cần migrate thì xoá LEGACY_PREFIX và nhánh migrate bên dưới.
const LEGACY_PREFIX = "aim-mode-scores-v2-";

// localStorage có thể throw (private mode, bị chặn, đầy quota) nên luôn bọc try/catch.
function readItem(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeItem(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // bỏ qua: game vẫn chơi được, chỉ không lưu
    }
}

function removeItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // bỏ qua
    }
}

function isValidScore(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function parseScores(raw: string | null): number[] {
    if (raw === null) return [];

    try {
        const parsed: unknown = JSON.parse(raw);

        if (!Array.isArray(parsed)) return [];

        return parsed.filter(isValidScore).slice(0, MAX_AIM_HISTORY);
    } catch {
        return [];
    }
}

function parseScore(raw: string | null): number | null {
    if (raw === null || raw.trim() === "") return null;

    const value = Number(raw);

    return isValidScore(value) ? value : null;
}

function buildRecord<T>(getValue: (key: AimScoreKey) => T): Record<AimScoreKey, T> {
    return Object.fromEntries(
        AIM_SCORE_KEYS.map((key) => [key, getValue(key)]),
    ) as Record<AimScoreKey, T>;
}

export function createEmptyHistory(): AimHistory {
    return buildRecord<number[]>(() => []);
}

export function createEmptyBests(): AimBests {
    return buildRecord<number | null>(() => null);
}

export function loadAimHistory(): AimHistory {
    return buildRecord<number[]>((key) => {
        const saved = readItem(`${HISTORY_PREFIX}${key}`);

        if (saved !== null) return parseScores(saved);

        // Migrate từ v2: benchmark cũ chỉ có 1 level nên map vào medium
        if (key === "assessment-medium") {
            return parseScores(readItem(`${LEGACY_PREFIX}assessment`));
        }

        if (!isLowerBetter(key)) {
            return parseScores(readItem(`${LEGACY_PREFIX}${key}`));
        }

        return [];
    });
}

/** Lấy best đã lưu, nếu chưa có thì suy ra từ lịch sử. */
export function loadAimBests(history: AimHistory): AimBests {
    return buildRecord<number | null>((key) => {
        const saved = parseScore(readItem(`${BEST_PREFIX}${key}`));

        if (saved !== null) return saved;

        const attempts = history[key];

        if (attempts.length === 0) return null;

        return isLowerBetter(key)
            ? Math.min(...attempts)
            : Math.max(...attempts);
    });
}

export function saveAimHistory(history: AimHistory): void {
    for (const key of AIM_SCORE_KEYS) {
        writeItem(`${HISTORY_PREFIX}${key}`, JSON.stringify(history[key]));
    }
}

export function saveAimBests(bests: AimBests): void {
    for (const key of AIM_SCORE_KEYS) {
        const best = bests[key];
        const storageKey = `${BEST_PREFIX}${key}`;

        if (best === null) {
            removeItem(storageKey);
        } else {
            writeItem(storageKey, String(best));
        }
    }
}

/**
 * Xoá toàn bộ dữ liệu Aim (dùng cho nút "Clear data" ở Settings).
 * Ghi mảng rỗng thay vì removeItem để loadAimHistory không migrate lại dữ liệu v2 cũ.
 */
export function clearAimStorage(): void {
    saveAimHistory(createEmptyHistory());
    saveAimBests(createEmptyBests());
}
