import { FPS_BEST_SCORE_KEY } from "../constants/fps";

export function loadBestScore(): number {
    try {
        const raw = localStorage.getItem(FPS_BEST_SCORE_KEY);
        const value = Number(raw);

        return raw !== null && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    } catch {
        return 0;
    }
}

export function saveBestScore(score: number): void {
    try {
        localStorage.setItem(FPS_BEST_SCORE_KEY, String(Math.floor(score)));
    } catch {
        // localStorage bị chặn (chế độ riêng tư...), bỏ qua.
    }
}
