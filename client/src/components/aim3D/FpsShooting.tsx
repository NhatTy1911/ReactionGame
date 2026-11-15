
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

interface FpsShootingProps {
    targetRef: React.RefObject<THREE.Mesh | null>;
    onHit: () => void;
    onMiss: () => void;
    enabled: boolean;
}

export default function FpsShooting({
    targetRef,
    onHit,
    onMiss,
    enabled
}: FpsShootingProps) {
    const camera = useThree((state) => state.camera);

    const raycasterRef = useRef(new THREE.Raycaster());
    const centerRef = useRef(new THREE.Vector2(0, 0));

    useEffect(() => {
        const handleShoot = (event: MouseEvent) => {
            // Không cho phép bắn khi chưa bắt đầu hoặc đã kết thúc
            if (!enabled) return;
            
            // Chỉ nhận click chuột trái
            if (event.button !== 0) return;

            // Chỉ cho phép bắn khi đã khóa chuột
            const arena = document.getElementById("fps-arena");

            if (!arena || document.pointerLockElement !== arena) {
                return;
            }

            const target = targetRef.current;

            if (!target) return;

            const raycaster = raycasterRef.current;

            // Tạo tia từ chính giữa camera
            raycaster.setFromCamera(centerRef.current, camera);

            // Kiểm tra tia có chạm mục tiêu không
            const intersections = raycaster.intersectObject(target, false);

            if (intersections.length > 0) {
                onHit();
            } else {
                onMiss();
            }
        };

        document.addEventListener("mousedown", handleShoot);

        return () => {
            document.removeEventListener("mousedown", handleShoot);
        };
    }, [camera, targetRef, onHit, onMiss, enabled]);

    return null;
}
