import "./AimTarget.css";

interface AimTargetProps {
    /** Toạ độ tâm target, theo % của vùng chơi. */
    x: number;
    y: number;
    size: number;
    label: string;
    className?: string;
    /** Bỏ trống với target không bắn được (mode Tracking). */
    onHit?: () => void;
}

function AimTarget({ x, y, size, label, className = "", onHit }: AimTargetProps) {
    return (
        <button
            type="button"
            className={`aim-target ${className}`.trim()}
            aria-label={label}
            // Dùng pointerdown để không bị cộng thêm thời gian chờ nhả chuột như click.
            // stopPropagation để vùng chơi không tính đây là một cú miss.
            onPointerDown={(event) => {
                event.stopPropagation();

                if (!onHit) return;
                if (event.pointerType === "mouse" && event.button !== 0) return;

                onHit();
            }}
            // Click sinh ra từ bàn phím / screen reader có detail === 0 (chuột thật thì >= 1)
            onClick={(event) => {
                if (event.detail === 0) onHit?.();
            }}
            style={{
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
            }}
        >
            <span className="target-dot" />
        </button>
    );
}

export default AimTarget;
