import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import type { HitMarkerStore } from "../../utils/hitMarkerStore";

interface HitMarkersProps {
    store: HitMarkerStore;
}

/** Đặt bên trong <Canvas>. Mỗi frame chiếu các dấu X lên màn hình theo camera hiện tại. */
export default function HitMarkers({ store }: HitMarkersProps) {
    useEffect(() => () => store.clear(), [store]);

    useFrame(({ camera, size }) => {
        if (!store.hasActive) return;

        // Camera vừa bị xoay trong event chuột; cập nhật ma trận ngay để dấu X không trễ 1 frame
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

        store.update(
            camera.matrixWorldInverse.elements,
            camera.projectionMatrix.elements,
            size.width,
            size.height,
            performance.now(),
        );
    });

    return null;
}
