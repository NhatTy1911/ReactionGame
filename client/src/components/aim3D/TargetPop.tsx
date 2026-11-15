import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";

/** Bóng mới xuất hiện từ 60% kích thước lên 100% trong 0,11s. */
export const POP_START_SCALE = 0.6;
const POP_DURATION_MS = 110;

interface TargetPopProps {
    targetRef: { current: THREE.Mesh | null };
    /** performance.now() lúc bóng vừa xuất hiện; FpsCanvas ghi vào khi bắn trúng. */
    popStartRef: { current: number };
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Hiệu ứng bóng "nảy" ra khi xuất hiện, cập nhật scale mỗi frame, không dùng React state. */
export default function TargetPop({ targetRef, popStartRef }: TargetPopProps) {
    useFrame(() => {
        const target = targetRef.current;

        if (!target) return;

        const t = (performance.now() - popStartRef.current) / POP_DURATION_MS;

        if (t >= 1) {
            if (target.scale.x !== 1) target.scale.setScalar(1);
            return;
        }

        target.scale.setScalar(POP_START_SCALE + (1 - POP_START_SCALE) * easeOutCubic(t));
    });

    return null;
}
