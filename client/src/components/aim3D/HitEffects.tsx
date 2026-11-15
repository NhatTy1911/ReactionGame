import { useCallback, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ParticleBurstSystem } from "../../utils/particleBurst";

interface HitEffectsProps {
    system: ParticleBurstSystem;
}

// Dùng chung một Object3D để tính ma trận, không tạo object mới mỗi frame
const dummy = new THREE.Object3D();

/** Vẽ mảnh vỡ khi trúng bóng bằng 1 InstancedMesh (1 draw call cho tất cả hạt). */
export default function HitEffects({ system }: HitEffectsProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const writeMatrices = useCallback(() => {
        const mesh = meshRef.current;

        if (!mesh) return;

        for (let i = 0; i < system.capacity; i += 1) {
            dummy.position.set(system.px[i], system.py[i], system.pz[i]);
            dummy.scale.setScalar(system.scaleAt(i));
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
    }, [system]);

    // Lúc đầu mọi hạt đều chưa dùng: ghi scale 0 để không có chấm nào hiện ở gốc toạ độ
    useEffect(() => {
        writeMatrices();
    }, [writeMatrices]);

    useFrame((_, delta) => {
        // Giới hạn delta để tab bị treo rồi quay lại không làm hạt bay vọt đi
        if (!system.update(Math.min(delta, 0.05))) return;

        writeMatrices();
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, system.capacity]}
            frustumCulled={false}
        >
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color="#ff8a8a" />
        </instancedMesh>
    );
}
