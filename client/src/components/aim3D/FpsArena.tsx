import * as THREE from "three";
import type { TargetPosition } from "../../utils/targetUtils";

interface FpsArenaProps {
    targetRef: React.RefObject<THREE.Mesh | null>;
    targetPosition: TargetPosition;
}

export default function FpsArena({ targetRef, targetPosition }: FpsArenaProps) {
    return (
        <>
            {/* Floor */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.05, 0]}
            >
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#252a34" />
            </mesh>

            {/* Grid */}
            <gridHelper
                args={[40, 40, "#4a5365", "#323947"]}
                position={[0, 0, 0]}
            />

            {/* Back wall */}
            <mesh position={[0, 4, -12]}>
                <boxGeometry args={[40, 8, 0.5]} />
                <meshStandardMaterial color="#343b49" />
            </mesh>

            {/* Left wall */}
            <mesh position={[-12, 4, 0]}>
                <boxGeometry args={[0.5, 8, 24]} />
                <meshStandardMaterial color="#2d3440" />
            </mesh>

            {/* Right wall */}
            <mesh position={[12, 4, 0]}>
                <boxGeometry args={[0.5, 8, 24]} />
                <meshStandardMaterial color="#2d3440" />
            </mesh>

            {/* Target */}
            <mesh
                ref={targetRef}
                position={targetPosition}
            >
                <sphereGeometry args={[0.6, 24, 16]} />
                <meshStandardMaterial
                    color="#ef4444"
                    roughness={0.4}
                    metalness={0.1}
                    transparent
                    opacity={1}
                />
            </mesh>
        </>
    );
}
