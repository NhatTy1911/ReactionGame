import Icon from "../components/common/Icon";
import type { Screen } from "../types/game";
import "./GameSelectPage.css"

interface GameSelectPageProps {
    onNavigate: (screen: Screen) => void;
}

function GameSelectPage({ onNavigate }: GameSelectPageProps) {
    return (
        <section className="game-select page-enter">
            <div className="game-select-heading">
                <button className="back-button" onClick={() => onNavigate("home")}>
                    ← Back
                </button>
                <span className="kicker">Choose your drill</span>

                <h2>Game select</h2>
                <p>Pick a skill, lock in and beat your best score.</p>
            </div>
            <div className="game-grid">
                <button className="game-card reaction-card" onClick={() => onNavigate("reaction")}>
                    <span className="card-number">01 / Reaction</span>
                    <span className="card-visual">
                        <Icon name="bolt" />
                    </span>
                    <span className="card-copy">
                        <strong>Green light</strong>
                        <small>Wait for the signal. React instantly.</small>
                    </span>
                    <span className="card-arrow">
                        <Icon name="arrow" />
                    </span>
                </button>
                <button className="game-card aim-card" onClick={() => onNavigate("aim")}>
                    <span className="card-number">02 / Accuracy</span>
                    <span className="card-visual target-rings">
                        <Icon name="target" />
                    </span>
                    <span className="card-copy">
                        <strong>Aim trainer</strong>
                        <small>Hit 20 targets as fast as possible.</small>
                    </span>
                    <span className="card-arrow">
                        <Icon name="arrow" />
                    </span>
                </button>
            </div>
        </section>
    )
}

export default GameSelectPage