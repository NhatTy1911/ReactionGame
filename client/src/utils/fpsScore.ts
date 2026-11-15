import { MISS_PENALTY, SCORE_PER_HIT } from "../constants/fps";

/** Mỗi phát trúng được cộng điểm, mỗi phát trượt bị trừ nhẹ để không thể bắn bừa. Không âm. */
export function calcScore(hits: number, misses: number): number {
    return Math.max(0, hits * SCORE_PER_HIT - misses * MISS_PENALTY);
}

/** Độ chính xác theo phần trăm (0 nếu chưa bắn phát nào). */
export function calcAccuracy(hits: number, misses: number): number {
    const total = hits + misses;

    return total > 0 ? (hits / total) * 100 : 0;
}
