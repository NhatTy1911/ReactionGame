
import type { Screen } from "../types/game";
import "./SettingsPage.css";

interface SettingsPageProps {
    targetSize: number;
    setTargetSize: (size: number) => void;

    motion: boolean;
    setMotion: (enabled: boolean) => void;

    onClearReactionHistory: () => void;
    onClearAimHistory: () => void;

    onNavigate: (screen: Screen) => void;
}

export default function SettingsPage({
    targetSize,
    setTargetSize,
    motion,
    setMotion,
    onClearReactionHistory,
    onClearAimHistory,
    onNavigate,
}: SettingsPageProps) {
    return (
        <section className="content-screen settings-screen page-enter">
        <div className="section-heading">
            <button
            className="back-button"
            type="button"
            onClick={() => onNavigate("home")}
            >
            ← Back
            </button>

            <span className="kicker">Make it yours</span>
            <h2>Settings</h2>
        </div>

        <div className="settings-panel">
            {/* Rush target size */}
            <div className="setting-row">
            <div className="setting-copy">
                <strong>Rush target size</strong>
                <span>
                Applies to 30 Second Rush. Other drills use fixed sizes.
                </span>
            </div>

            <div className="size-options">
                {[48, 64, 80].map((size) => (
                <button
                    key={size}
                    type="button"
                    className={targetSize === size ? "active" : ""}
                    onClick={() => setTargetSize(size)}
                    aria-pressed={targetSize === size}
                    aria-label={`Target size ${
                    size === 48 ? "Small" : size === 64 ? "Medium" : "Large"
                    }`}
                >
                    {size === 48 ? "S" : size === 64 ? "M" : "L"}
                </button>
                ))}
            </div>
            </div>

            {/* Interface motion */}
            <div className="setting-row">
            <div className="setting-copy">
                <strong>Interface motion</strong>
                <span>Enable transitions and ambient animation.</span>
            </div>

            <button
                type="button"
                className={`toggle ${motion ? "active" : ""}`}
                onClick={() => setMotion((previous) => !previous)}
                role="switch"
                aria-checked={motion}
                aria-label="Interface motion"
            >
                <i />
            </button>
            </div>

            {/* Reaction history */}
            <div className="setting-row">
            <div className="setting-copy">
                <strong>Reaction history</strong>
                <span>Clear your saved personal best and attempts.</span>
            </div>

            <button
                type="button"
                className="text-button"
                onClick={onClearReactionHistory}
            >
                Clear data
            </button>
            </div>

            {/* Aim history */}
            <div className="setting-row">
            <div className="setting-copy">
                <strong>Aim history</strong>
                <span>Clear saved personal bests and recent attempts.</span>
            </div>

            <button
                type="button"
                className="text-button"
                onClick={onClearAimHistory}
            >
                Clear data
            </button>
            </div>
        </div>
        </section>
    );
}
