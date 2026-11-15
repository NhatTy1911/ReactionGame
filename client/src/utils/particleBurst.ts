export interface BurstPoint {
    x: number;
    y: number;
    z: number;
}

export const PARTICLE_CAPACITY = 96;
export const PARTICLES_PER_BURST = 14;

const LIFE_MIN = 0.3;
const LIFE_MAX = 0.5;
const SPEED_MIN = 2.5;
const SPEED_MAX = 5;
const GRAVITY = -9;
const BASE_SIZE = 0.075;

/**
 * Mô phỏng các mảnh vỡ bắn ra khi trúng bóng. Không phụ thuộc three nên test được độc lập;
 * component HitEffects chỉ việc đọc vị trí/kích thước từng hạt để vẽ.
 * Hạt dùng vòng tròn (ring buffer): hết chỗ thì ghi đè hạt cũ nhất, không cấp phát thêm.
 */
export class ParticleBurstSystem {
    readonly capacity: number;

    readonly px: Float32Array;
    readonly py: Float32Array;
    readonly pz: Float32Array;
    private readonly vx: Float32Array;
    private readonly vy: Float32Array;
    private readonly vz: Float32Array;
    private readonly age: Float32Array;
    private readonly life: Float32Array;
    private readonly random: () => number;
    private next = 0;

    constructor(capacity: number = PARTICLE_CAPACITY, random: () => number = Math.random) {
        this.capacity = capacity;
        this.random = random;
        this.px = new Float32Array(capacity);
        this.py = new Float32Array(capacity);
        this.pz = new Float32Array(capacity);
        this.vx = new Float32Array(capacity);
        this.vy = new Float32Array(capacity);
        this.vz = new Float32Array(capacity);
        this.age = new Float32Array(capacity);
        this.life = new Float32Array(capacity); // life = 0: hạt chưa dùng (coi như đã chết)
    }

    burst(point: BurstPoint, count: number = PARTICLES_PER_BURST): void {
        for (let n = 0; n < count; n += 1) {
            const i = this.next;
            this.next = (this.next + 1) % this.capacity;

            // Hướng ngẫu nhiên đều trên mặt cầu
            const z = this.random() * 2 - 1;
            const phi = this.random() * Math.PI * 2;
            const ring = Math.sqrt(1 - z * z);
            const speed = SPEED_MIN + this.random() * (SPEED_MAX - SPEED_MIN);

            this.px[i] = point.x;
            this.py[i] = point.y;
            this.pz[i] = point.z;
            this.vx[i] = ring * Math.cos(phi) * speed;
            this.vy[i] = z * speed;
            this.vz[i] = ring * Math.sin(phi) * speed;
            this.age[i] = 0;
            this.life[i] = LIFE_MIN + this.random() * (LIFE_MAX - LIFE_MIN);
        }
    }

    /** Trả về true nếu frame này còn hạt sống (hoặc vừa chết) nên cần vẽ lại. */
    update(deltaSeconds: number): boolean {
        let needsRedraw = false;

        for (let i = 0; i < this.capacity; i += 1) {
            if (this.age[i] >= this.life[i]) continue;

            needsRedraw = true;
            this.age[i] += deltaSeconds;

            if (this.age[i] >= this.life[i]) continue;

            this.vy[i] += GRAVITY * deltaSeconds;
            this.px[i] += this.vx[i] * deltaSeconds;
            this.py[i] += this.vy[i] * deltaSeconds;
            this.pz[i] += this.vz[i] * deltaSeconds;
        }

        return needsRedraw;
    }

    /** Kích thước hiện tại của hạt i: nhỏ dần về 0 khi sắp biến mất, 0 nếu đã chết. */
    scaleAt(i: number): number {
        if (this.age[i] >= this.life[i]) return 0;

        return BASE_SIZE * (1 - this.age[i] / this.life[i]);
    }
}
