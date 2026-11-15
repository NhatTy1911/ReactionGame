export interface WorldPoint {
    x: number;
    y: number;
    z: number;
}

interface Marker {
    anchor: HTMLElement;
    x: number;
    y: number;
    z: number;
    bornAt: number;
}

export const HIT_MARKER_LIFETIME_MS = 260;

const MAX_MARKERS = 12;
/** Ra xa khỏi màn hình hơn mức này (theo toạ độ chuẩn hoá) thì ẩn. */
const OFFSCREEN_LIMIT = 1.3;

/**
 * Dấu X "dính" vào một điểm trong thế giới 3D: mỗi frame chiếu điểm đó ra màn hình,
 * nên quay camera đi chỗ khác thì dấu X vẫn nằm đúng trên quả bóng.
 *
 * Là DOM thuần và không import three: nhận thẳng mảng ma trận (cột trước, như three.js),
 * nên không dính React state và test được độc lập.
 */
export class HitMarkerStore {
    private container: HTMLElement | null = null;
    private markers: Marker[] = [];

    /** Dùng làm ref của lớp chứa: <div ref={store.setContainer} /> */
    setContainer = (element: HTMLElement | null): void => {
        if (element === this.container) return;

        this.clear();
        this.container = element;
    };

    get hasActive(): boolean {
        return this.markers.length > 0;
    }

    add(point: WorldPoint, now: number = performance.now()): void {
        const container = this.container;

        if (!container) return;

        const doc = container.ownerDocument;
        const anchor = doc.createElement("div");
        const mark = doc.createElement("div");

        anchor.className = "fps-hit-anchor";
        // Ẩn tới khi update() đặt đúng vị trí, tránh nháy ở góc trên trái 1 frame
        anchor.style.visibility = "hidden";
        mark.className = "fps-hit-x";
        mark.append(doc.createElement("span"), doc.createElement("span"));
        anchor.append(mark);
        container.append(anchor);

        this.markers.push({ anchor, x: point.x, y: point.y, z: point.z, bornAt: now });

        if (this.markers.length > MAX_MARKERS) {
            this.markers.shift()?.anchor.remove();
        }
    }

    /**
     * @param view  camera.matrixWorldInverse.elements
     * @param proj  camera.projectionMatrix.elements
     */
    update(
        view: ArrayLike<number>,
        proj: ArrayLike<number>,
        width: number,
        height: number,
        now: number = performance.now(),
    ): void {
        for (let i = this.markers.length - 1; i >= 0; i -= 1) {
            const marker = this.markers[i];

            if (now - marker.bornAt >= HIT_MARKER_LIFETIME_MS) {
                marker.anchor.remove();
                this.markers.splice(i, 1);
                continue;
            }

            const { x, y, z } = marker;
            const vx = view[0] * x + view[4] * y + view[8] * z + view[12];
            const vy = view[1] * x + view[5] * y + view[9] * z + view[13];
            const vz = view[2] * x + view[6] * y + view[10] * z + view[14];

            const clipX = proj[0] * vx + proj[4] * vy + proj[8] * vz + proj[12];
            const clipY = proj[1] * vx + proj[5] * vy + proj[9] * vz + proj[13];
            const clipW = proj[3] * vx + proj[7] * vy + proj[11] * vz + proj[15];

            // clipW <= 0: điểm nằm sau lưng camera
            if (clipW <= 0) {
                marker.anchor.style.visibility = "hidden";
                continue;
            }

            const ndcX = clipX / clipW;
            const ndcY = clipY / clipW;

            if (Math.abs(ndcX) > OFFSCREEN_LIMIT || Math.abs(ndcY) > OFFSCREEN_LIMIT) {
                marker.anchor.style.visibility = "hidden";
                continue;
            }

            const px = (ndcX * 0.5 + 0.5) * width;
            const py = (-ndcY * 0.5 + 0.5) * height;

            marker.anchor.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
            marker.anchor.style.visibility = "visible";
        }
    }

    clear(): void {
        for (const marker of this.markers) marker.anchor.remove();

        this.markers = [];
    }
}
