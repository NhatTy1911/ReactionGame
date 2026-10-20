import type { GridTarget, Point } from "../../types/aim";
import AimHud from "./AimHud";
import type { AimHudProps } from "./AimHud";
import AimTarget from "./AimTarget";
import "./AimPlaying.css";

interface AimPlayingProps extends AimHudProps {
    activeTargetSize: number;
    target: Point;
    gridTargets: GridTarget[];
    progressPercent: number;
    /** Mode grid truyền target vừa bắn, các mode khác gọi không tham số. */
    onHitTarget: (gridTarget?: GridTarget) => void;
}

function AimPlaying({
    activeTargetSize,
    target,
    gridTargets,
    progressPercent,
    onHitTarget,
    ...hud
}: AimPlayingProps) {
    const { aimMode, hits } = hud;
    const isTracking = aimMode === "tracking";

    return (
        <>
            <AimHud {...hud} />

            {aimMode === "grid" ? (
                gridTargets.map((gridTarget) => (
                    <AimTarget
                        key={gridTarget.id}
                        x={gridTarget.x}
                        y={gridTarget.y}
                        size={activeTargetSize}
                        className="grid-target"
                        label={`Grid target ${gridTarget.id}`}
                        onHit={() => onHitTarget(gridTarget)}
                    />
                ))
            ) : (
                <AimTarget
                    x={target.x}
                    y={target.y}
                    size={activeTargetSize}
                    className={isTracking ? "tracking-target" : ""}
                    label={isTracking ? "Tracking target" : `Target ${hits + 1}`}
                    onHit={isTracking ? undefined : () => onHitTarget()}
                />
            )}

            <span className="aim-progress" style={{ width: `${progressPercent}%` }} />
        </>
    );
}

export default AimPlaying;
