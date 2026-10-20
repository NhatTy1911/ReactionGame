import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export interface PointerState {
    x: number;
    y: number;
    active: boolean;
}

/**
 * Theo dõi vị trí con trỏ trong vùng chơi (dùng cho mode Tracking).
 * Dùng ref thay vì state để pointermove không gây re-render.
 */
export function usePointerTracker() {
    const pointerRef = useRef<PointerState>({ x: 0, y: 0, active: false });

    const resetPointer = useCallback(() => {
        pointerRef.current.active = false;
    }, []);

    const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLElement>) => {
        pointerRef.current = {
            x: event.clientX,
            y: event.clientY,
            active: true,
        };
    }, []);

    // Mất focus hoặc chuyển tab thì coi như con trỏ không còn trên target
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState !== "visible") resetPointer();
        };

        window.addEventListener("blur", resetPointer);
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            window.removeEventListener("blur", resetPointer);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [resetPointer]);

    return {
        pointerRef,
        handlePointerMove,
        handlePointerLeave: resetPointer,
        resetPointer,
    };
}
