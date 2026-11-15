import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { FrameWindow } from "../../utils/frameStats";

const UPDATE_INTERVAL = 0.5;

interface FrameStatsProps {
    targetRef: { current: HTMLElement | null };
}

/** Ghi FPS thẳng vào DOM 2 lần/giây, không dùng React state. */
export default function FrameStats({ targetRef }: FrameStatsProps) {
    const frames = useMemo(() => new FrameWindow(), []);
    const elapsed = useRef(0);

    useFrame((_, delta) => {
        frames.push(delta);
        elapsed.current += delta;

        if (elapsed.current < UPDATE_INTERVAL) return;
        elapsed.current = 0;

        const summary = frames.summarize();
        const element = targetRef.current;

        if (summary && element) {
            element.textContent = `${Math.round(summary.fps)} FPS · 1% low ${Math.round(summary.low1Fps)}`;
        }
    });

    return null;
}
