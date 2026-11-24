import { applyLookDelta, isWithinLockSettle, type LookState } from "./lookMath";

export interface LookSettings {
    sensitivity: number;
}

export interface PointerLockLookOptions {
    element: HTMLElement;
    state: LookState;
    /** Object có thể đổi giá trị lúc đang chạy, không cần gắn lại listener. */
    settings: LookSettings;
    onLook: (state: LookState) => void;
    onLockChange?: (locked: boolean) => void;
}

interface LockCapable {
    requestPointerLock: (options?: {
        unadjustedMovement?: boolean;
    }) => Promise<void> | void;
}

function swallow(result: Promise<void> | void): void {
    if (result && typeof result.catch === "function") {
        result.catch(() => undefined);
    }
}

/**
 * Gắn mouse look kiểu FPS: pointer lock + raw input.
 * Trả về hàm dọn dẹp.
 */
export function attachPointerLockLook({
    element,
    state,
    settings,
    onLook,
    onLockChange,
}: PointerLockLookOptions): () => void {
    const doc = element.ownerDocument;
    const target = element as unknown as LockCapable;

    // event.timeStamp của lần khoá chuột gần nhất; -Infinity = đang không khoá
    let lockedAt = Number.NEGATIVE_INFINITY;

    const requestFallbackLock = () => {
        try {
            swallow(target.requestPointerLock());
        } catch {
            // Lock lại quá sớm sau khi bấm ESC sẽ bị từ chối, bỏ qua.
        }
    };

    const requestLock = (event?: MouseEvent) => {
        if (doc.pointerLockElement === element) return;

        // Nút/bảng bên trong arena (vd. màn kết quả) đánh dấu data-no-lock để click vào không khoá chuột.
        if (event?.target instanceof Element && event.target.closest("[data-no-lock]")) return;

        try {
            // unadjustedMovement: bỏ gia tốc chuột của hệ điều hành, giống game thật.
            const result = target.requestPointerLock({ unadjustedMovement: true });

            if (result && typeof result.catch === "function") {
                result.catch(requestFallbackLock);
            }
        } catch {
            requestFallbackLock();
        }
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (doc.pointerLockElement !== element) return;

        if (event.movementX === 0 && event.movementY === 0) return;

        // Ngay sau khi khoá (nhất là khi Play again) trình duyệt có thể phát một cú nhảy delta
        // lớn do con trỏ bị kéo từ nút bấm về giữa màn hình: bỏ qua trong khoảng ngắn đó.
        if (isWithinLockSettle(event.timeStamp, lockedAt)) return;

        if (
            applyLookDelta(
                state,
                event.movementX,
                event.movementY,
                settings.sensitivity,
            )
        ) {
            onLook(state);
        }
    };

    const handleLockChange = (event: Event) => {
        const locked = doc.pointerLockElement === element;

        lockedAt = locked ? event.timeStamp : Number.NEGATIVE_INFINITY;

        onLockChange?.(locked);
    };

    // Xin khoá thất bại: chỉ báo trạng thái, không đụng tới mốc thời gian của lần khoá thành công
    const handleLockError = () => {
        onLockChange?.(doc.pointerLockElement === element);
    };

    element.addEventListener("click", requestLock);
    doc.addEventListener("mousemove", handleMouseMove);
    doc.addEventListener("pointerlockchange", handleLockChange);
    doc.addEventListener("pointerlockerror", handleLockError);

    return () => {
        element.removeEventListener("click", requestLock);
        doc.removeEventListener("mousemove", handleMouseMove);
        doc.removeEventListener("pointerlockchange", handleLockChange);
        doc.removeEventListener("pointerlockerror", handleLockError);

        if (doc.pointerLockElement === element) {
            doc.exitPointerLock();
        }
    };
}
