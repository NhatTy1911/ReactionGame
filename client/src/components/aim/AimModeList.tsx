import "./AimModeList.css";
import { AIM_MODE_ORDER, AIM_MODES } from "../../constants/aim";
import type { AimMode } from "../../types/aim";

interface AimModeListProps {
    aimMode: AimMode;
    onSelect: (mode: AimMode) => void;
}

function AimModeList({ aimMode, onSelect }: AimModeListProps) {
    return (
        <div className="mode-list">
            {AIM_MODE_ORDER.map((mode, index) => {
                const option = AIM_MODES[mode];

                return (
                    <button
                        key={mode}
                        type="button"
                        className={`mode-card ${aimMode === mode ? "active" : ""}`}
                        onClick={() => onSelect(mode)}
                    >
                        <span className="mode-number">
                            0{index + 1} / {option.label}
                        </span>
                        <strong>{option.name}</strong>
                        <small>{option.difficulty}</small>
                    </button>
                );
            })}
        </div>
    );
}

export default AimModeList;
