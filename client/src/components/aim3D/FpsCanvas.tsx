import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import FpsArena from "./FpsArena";
import FrameStats from "./FrameStats";
import HitEffects from "./HitEffects";
import HitMarkers from "./HitMarkers";
import MouseLook from "./MouseLook";
import * as THREE from "three";
import FpsShooting from "./FpsShooting";
import TargetPop, { POP_START_SCALE } from "./TargetPop";
import {
    getRandomTargetPosition,
    PLAYER_EYE,
    type TargetPosition,
} from "../../utils/targetUtils";
import type { HitMarkerStore, WorldPoint } from "../../utils/hitMarkerStore";
import { FpsAudio } from "../../utils/fpsAudio";
import { ParticleBurstSystem } from "../../utils/particleBurst";

interface FpsCanvasProps {
    onHit: (position: WorldPoint) => void;
    onMiss: () => void;
    markers: HitMarkerStore;
    canShoot: boolean;
}

export default function FpsCanvas({
    onHit,
    onMiss,
    markers,
    canShoot
}: FpsCanvasProps) {
    const statsRef = useRef<HTMLSpanElement>(null);
    const targetRef = useRef<THREE.Mesh | null>(null);
    const hitPosition = useRef(new THREE.Vector3());
    const popStart = useRef(-Infinity);
    const [bursts] = useState(() => new ParticleBurstSystem());
    const [audio] = useState(() => new FpsAudio());

    // Trình duyệt chỉ cho phát âm thanh sau một thao tác người dùng: mở khoá ở lần bấm đầu tiên
    useEffect(() => {
        const unlock = () => audio.unlock();

        document.addEventListener("pointerdown", unlock);
        document.addEventListener("keydown", unlock);

        return () => {
            document.removeEventListener("pointerdown", unlock);
            document.removeEventListener("keydown", unlock);
            audio.dispose();
        };
    }, [audio]);

    const [targetPosition, setTargetPosition] = useState<TargetPosition>([0, 1.5, -6]);

    const handleTargetMiss = useCallback(() => {
        audio.playShot();
        onMiss();
    }, [audio, onMiss]);

    const handleTargetHit = useCallback(() => {
        // Phát âm thanh trước tiên để độ trễ từ lúc bấm chuột là thấp nhất
        audio.playHit();

        const target = targetRef.current;

        // Lấy vị trí quả bóng TRƯỚC khi dời nó: dấu X và mảnh vỡ nằm đúng chỗ bóng vừa bị bắn
        target?.getWorldPosition(hitPosition.current);

        bursts.burst(hitPosition.current);
        onHit(hitPosition.current);

        const next = getRandomTargetPosition([
            hitPosition.current.x,
            hitPosition.current.y,
            hitPosition.current.z,
        ]);

        // Dời bóng ngay trong lúc xử lý bắn (không chờ React render) để lần bắn sau
        // và khung hình kế tiếp đã thấy bóng ở vị trí mới
        if (target) {
            target.position.set(next[0], next[1], next[2]);
            target.scale.setScalar(POP_START_SCALE);
            popStart.current = performance.now();
        }

        // Giữ state đồng bộ với vị trí thật của mesh
        setTargetPosition(next);
    }, [onHit, bursts, audio]);

    return (
        <>
            <Canvas
                camera={{ position: PLAYER_EYE, fov: 75, near: 0.1, far: 100 }}
                gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
                dpr={[1, 1.5]}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={["#11151d"]} />

                    <ambientLight intensity={1.2} />
                    <directionalLight position={[5, 10, 5]} intensity={2} />

                    <FpsArena targetRef={targetRef} targetPosition={targetPosition} />

                    <FpsShooting
                        targetRef={targetRef}
                        onHit={handleTargetHit}
                        onMiss={handleTargetMiss}
                        enabled={canShoot}
                    />

                    <TargetPop targetRef={targetRef} popStartRef={popStart} />
                    <HitEffects system={bursts} />

                    <MouseLook />
                    <HitMarkers store={markers} />
                    <FrameStats targetRef={statsRef} />
                </Suspense>
            </Canvas>

            <span ref={statsRef} className="fps-stats" aria-hidden="true">
                -- FPS
            </span>
        </>
    );
}
