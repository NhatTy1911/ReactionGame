/**
 * Âm thanh bắn và bắn trúng, tổng hợp bằng Web Audio (không cần file âm thanh).
 * Tạo sẵn nguồn phát trong lúc bấm chuột đầu tiên, sau đó mỗi tiếng chỉ là vài node nhỏ
 * lên lịch ngay trong event bắn nên độ trễ thấp nhất có thể.
 */

const DEFAULT_VOLUME = 0.5;

/** Nhiễu trắng ngắn dùng cho tiếng "tạch" của phát bắn. */
export function createNoiseBuffer(ctx: BaseAudioContext, seconds = 0.12): AudioBuffer {
    const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

    return buffer;
}

/** Tiếng bắn: tạch nhiễu ngắn + tiếng bụp trầm. Dài khoảng 90ms. */
export function playShotSound(
    ctx: BaseAudioContext,
    destination: AudioNode,
    noise: AudioBuffer,
    when: number,
): void {
    const click = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const clickGain = ctx.createGain();

    click.buffer = noise;
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.7;
    clickGain.gain.setValueAtTime(0.45, when);
    clickGain.gain.exponentialRampToValueAtTime(0.001, when + 0.06);

    click.connect(filter);
    filter.connect(clickGain);
    clickGain.connect(destination);
    click.start(when);
    click.stop(when + 0.07);

    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();

    thump.type = "sine";
    thump.frequency.setValueAtTime(180, when);
    thump.frequency.exponentialRampToValueAtTime(55, when + 0.08);
    thumpGain.gain.setValueAtTime(0.5, when);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, when + 0.09);

    thump.connect(thumpGain);
    thumpGain.connect(destination);
    thump.start(when);
    thump.stop(when + 0.1);
}

/** Tiếng trúng: hai nốt cao ngắn kiểu "ting", khác hẳn tiếng bắn để nghe là biết trúng. Dài khoảng 150ms. */
export function playHitSound(ctx: BaseAudioContext, destination: AudioNode, when: number): void {
    for (const [frequency, level] of [
        [1318.5, 0.35],
        [1975.5, 0.2],
    ] as const) {
        const tone = ctx.createOscillator();
        const gain = ctx.createGain();

        tone.type = "sine";
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(level, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.14);

        tone.connect(gain);
        gain.connect(destination);
        tone.start(when);
        tone.stop(when + 0.15);
    }
}

type ContextFactory = () => BaseAudioContext;

const createDefaultContext: ContextFactory = () =>
    new AudioContext({ latencyHint: "interactive" });

export class FpsAudio {
    private readonly createContext: ContextFactory;
    private ctx: BaseAudioContext | null = null;
    private master: GainNode | null = null;
    private noise: AudioBuffer | null = null;
    private volume: number;

    constructor(createContext: ContextFactory = createDefaultContext, volume = DEFAULT_VOLUME) {
        this.createContext = createContext;
        this.volume = volume;
    }

    get context(): BaseAudioContext | null {
        return this.ctx;
    }

    /**
     * Phải gọi từ thao tác người dùng (click/phím): trình duyệt chỉ cho âm thanh chạy sau đó.
     * Gọi nhiều lần vẫn an toàn.
     */
    unlock(): void {
        try {
            if (!this.ctx) {
                const ctx = this.createContext();
                const master = ctx.createGain();

                master.gain.value = this.volume;
                master.connect(ctx.destination);

                this.ctx = ctx;
                this.master = master;
                this.noise = createNoiseBuffer(ctx);
            }

            if (this.ctx instanceof AudioContext && this.ctx.state === "suspended") {
                void this.ctx.resume().catch(() => undefined);
            }
        } catch {
            // Trình duyệt không hỗ trợ hoặc bị chặn âm thanh: game vẫn chơi bình thường, chỉ không có tiếng.
        }
    }

    setVolume(volume: number): void {
        this.volume = Math.min(1, Math.max(0, volume));

        if (this.master) this.master.gain.value = this.volume;
    }

    playShot(): void {
        if (!this.ctx || !this.master || !this.noise) return;

        playShotSound(this.ctx, this.master, this.noise, this.ctx.currentTime);
    }

    playHit(): void {
        if (!this.ctx || !this.master) return;

        playHitSound(this.ctx, this.master, this.ctx.currentTime);
    }

    dispose(): void {
        if (this.ctx instanceof AudioContext) {
            void this.ctx.close().catch(() => undefined);
        }

        this.ctx = null;
        this.master = null;
        this.noise = null;
    }
}
