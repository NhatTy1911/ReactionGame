const SAMPLE_COUNT = 240;
/** Frame dài hơn mức này (đổi tab, tạm dừng) không phản ánh hiệu năng thật. */
const MAX_VALID_DELTA = 1;

export interface FrameSummary {
    fps: number;
    low1Fps: number;
}

/** Cửa sổ trượt 240 frame gần nhất để tính FPS và "1% low". */
export class FrameWindow {
    private readonly samples = new Float32Array(SAMPLE_COUNT);
    private readonly scratch = new Float32Array(SAMPLE_COUNT);
    private count = 0;
    private index = 0;

    push(deltaSeconds: number): void {
        if (!(deltaSeconds > 0) || deltaSeconds > MAX_VALID_DELTA) return;

        this.samples[this.index] = deltaSeconds;
        this.index = (this.index + 1) % SAMPLE_COUNT;
        this.count = Math.min(this.count + 1, SAMPLE_COUNT);
    }

    summarize(): FrameSummary | null {
        if (this.count === 0) return null;

        const sorted = this.scratch.subarray(0, this.count);
        sorted.set(this.samples.subarray(0, this.count));
        sorted.sort();

        let total = 0;
        for (let i = 0; i < this.count; i += 1) total += sorted[i];

        const worstCount = Math.max(1, Math.ceil(this.count * 0.01));
        let worstTotal = 0;
        for (let i = this.count - worstCount; i < this.count; i += 1) worstTotal += sorted[i];

        return {
            fps: this.count / total,
            low1Fps: worstCount / worstTotal,
        };
    }
}
