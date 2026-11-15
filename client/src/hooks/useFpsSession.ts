import { useCallback, useEffect, useRef, useState } from "react";
import { COUNTDOWN_SECONDS, ROUND_SECONDS } from "../constants/fps";

export type FpsPhase = "idle" | "countdown" | "playing" | "finished";

interface UseFpsSessionOptions {
    /** id của khung arena (phần tử được fullscreen + pointer lock). */
    arenaId?: string;
    countdownFrom?: number;
    roundSeconds?: number;
    /** Gọi mỗi lần bắt đầu một lượt mới (dùng để reset điểm). */
    onCountdownStart?: () => void;
    /** Gọi một lần khi hết giờ (dùng để lưu điểm cao). */
    onFinish?: () => void;
}

/** Sau khi vào fullscreen, trình duyệt có thể nhả lock tạm thời: chờ khoảng này rồi mới coi là người chơi đã thoát. */
const FULLSCREEN_GRACE_MS = 600;
const CLOCK_INTERVAL_MS = 100;

/**
 * Vòng đời một lượt chơi:
 *   idle --click--> fullscreen + khóa chuột --> countdown 3·2·1 --> playing (30s) --> finished
 *   finished --Play again--> countdown ...      finished --Exit--> idle
 *   ESC bất kỳ lúc nào (mất khóa chuột / thoát fullscreen) --> idle, thoát fullscreen
 *
 * Khi hết giờ chuột được nhả để bấm nút trên màn kết quả, fullscreen giữ nguyên.
 * phaseRef luôn là giá trị mới nhất, dùng trong callback bắn trúng/trượt
 * để không đọc phase cũ.
 */
export function useFpsSession({
    arenaId = "fps-arena",
    countdownFrom = COUNTDOWN_SECONDS,
    roundSeconds = ROUND_SECONDS,
    onCountdownStart,
    onFinish,
}: UseFpsSessionOptions = {}) {
    const [phase, setPhase] = useState<FpsPhase>("idle");
    const [count, setCount] = useState(countdownFrom);
    const [timeLeft, setTimeLeft] = useState(roundSeconds);
    const phaseRef = useRef<FpsPhase>("idle");
    const startCallback = useRef(onCountdownStart);
    const finishCallback = useRef(onFinish);
    const controls = useRef({ restart: () => {}, exit: () => {} });

    useEffect(() => {
        startCallback.current = onCountdownStart;
        finishCallback.current = onFinish;
    }, [onCountdownStart, onFinish]);

    useEffect(() => {
        const arena = document.getElementById(arenaId);

        if (!arena) return;

        let timer: number | undefined;
        let clock: number | undefined;
        let graceTimer: number | undefined;
        let graceUntil = 0;

        const changePhase = (next: FpsPhase) => {
            phaseRef.current = next;
            setPhase(next);
        };

        const stopTimers = () => {
            window.clearTimeout(timer);
            window.clearInterval(clock);
            window.clearTimeout(graceTimer);
            timer = undefined;
            clock = undefined;
            graceTimer = undefined;
        };

        const exitFullscreen = () => {
            if (document.fullscreenElement === arena) {
                void document.exitFullscreen().catch(() => undefined);
            }
        };

        const releaseLock = () => {
            if (document.pointerLockElement === arena) {
                document.exitPointerLock();
            }
        };

        const requestLock = () => {
            try {
                const result = arena.requestPointerLock() as unknown as Promise<void> | void;

                if (result && typeof result.catch === "function") {
                    result.catch(() => undefined);
                }
            } catch {
                // Chưa đủ điều kiện để lock, người chơi bấm lại là được.
            }
        };

        const finish = () => {
            stopTimers();
            changePhase("finished");
            setTimeLeft(0);
            releaseLock();
            finishCallback.current?.();
        };

        const startPlaying = () => {
            changePhase("playing");
            setTimeLeft(roundSeconds);

            const endAt = performance.now() + roundSeconds * 1000;

            clock = window.setInterval(() => {
                const remaining = endAt - performance.now();

                if (remaining <= 0) {
                    finish();
                    return;
                }

                setTimeLeft(Math.ceil(remaining / 1000));
            }, CLOCK_INTERVAL_MS);
        };

        const startCountdown = () => {
            stopTimers();
            startCallback.current?.();
            changePhase("countdown");
            setCount(countdownFrom);
            setTimeLeft(roundSeconds);

            let remaining = countdownFrom;

            const tick = () => {
                remaining -= 1;

                if (remaining <= 0) {
                    timer = undefined;
                    startPlaying();
                    return;
                }

                setCount(remaining);
                timer = window.setTimeout(tick, 1000);
            };

            timer = window.setTimeout(tick, 1000);
        };

        const leave = () => {
            stopTimers();
            changePhase("idle");
            setTimeLeft(roundSeconds);
            exitFullscreen();
            releaseLock();
        };

        controls.current = {
            // Gọi từ nút bấm nên vẫn còn thao tác người dùng để xin lại khóa chuột.
            restart: () => {
                if (phaseRef.current !== "finished") return;

                startCountdown();
                requestLock();
            },
            exit: leave,
        };

        const handleClick = () => {
            if (phaseRef.current !== "idle" || document.fullscreenElement) return;
            if (typeof arena.requestFullscreen !== "function") return;

            arena.requestFullscreen().catch(() => undefined);
        };

        const handleLockChange = () => {
            if (document.pointerLockElement === arena) {
                if (phaseRef.current === "idle") startCountdown();
                return;
            }

            // Hết giờ thì mình tự nhả chuột, đây không phải người chơi bấm ESC.
            if (phaseRef.current === "idle" || phaseRef.current === "finished") return;

            // Vừa vào fullscreen: chờ hết khoảng grace, nếu vẫn chưa có lock lại thì coi như đã thoát.
            const remaining = graceUntil - performance.now();

            if (remaining > 0) {
                window.clearTimeout(graceTimer);

                graceTimer = window.setTimeout(() => {
                    graceTimer = undefined;

                    if (
                        phaseRef.current !== "idle" &&
                        phaseRef.current !== "finished" &&
                        document.pointerLockElement !== arena
                    ) {
                        leave();
                    }
                }, remaining);
                return;
            }

            leave();
        };

        const handleFullscreenChange = () => {
            if (document.fullscreenElement === arena) {
                graceUntil = performance.now() + FULLSCREEN_GRACE_MS;

                if (document.pointerLockElement !== arena) requestLock();
                return;
            }

            if (phaseRef.current !== "idle") leave();
        };

        arena.addEventListener("click", handleClick);
        document.addEventListener("pointerlockchange", handleLockChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            arena.removeEventListener("click", handleClick);
            document.removeEventListener("pointerlockchange", handleLockChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            stopTimers();
            exitFullscreen();
        };
    }, [arenaId, countdownFrom, roundSeconds]);

    const restart = useCallback(() => controls.current.restart(), []);
    const exit = useCallback(() => controls.current.exit(), []);

    return { phase, count, timeLeft, phaseRef, restart, exit };
}
