import Icon from "../components/common/Icon";
import type { Screen } from "../types/game";
import "./HomePage.css"

interface HomePageProps {
    onNavigate: (screen: Screen) => void;
}

function HomePage({onNavigate} : HomePageProps) {
    return (
        <section className="home-screen page-center">
            <div className="home-intro">
                <span className="kicker">
                    Train faster. Focus sharper
                </span>

                <h1>
                    Ready to test
                    <br/>
                    your <em>limits?</em>
                </h1>

                <p>
                    Mini games built to sharpen your reflexes, accuracy and focus.                    
                </p>
            </div>

            <nav className="main-menu" aria-label="Menu chính">
                <button className="menu-primary" onClick={() => onNavigate("games")}>
                    <span className="menu-index">01</span>
                    <span>Start</span>
                    <span className="menu-icon">
                        <Icon name="arrow"/>
                    </span>
                </button>
                <button className="menu-primary" onClick={() => onNavigate("settings")}>
                    <span className="menu-index">02</span>
                    <span>Settings</span>
                    <span className="menu-icon">
                        <Icon name="settings"/>
                    </span>
                </button>
                <button className="menu-primary" onClick={() => onNavigate("exit")}>
                    <span className="menu-index">03</span>
                    <span>Exit</span>
                    <span className="menu-icon">
                        <Icon name="exit"/>
                    </span>
                </button>
            </nav>

            <div className="home-orbit" aria-hidden="true">
                <span className="orbit-one"/>
                <span className="orbit-two"/>
                <i/>
            </div>
        </section>
    )
}

export default HomePage;
