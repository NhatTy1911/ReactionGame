import { useState } from "react";
import "./App.css";

import HomePage from "./pages/HomePage";
import GameSelectPage from "./pages/GameSelectPage";
import ReactionGamePage from "./pages/ReactionGamePage";
import AimGamePage from "./pages/AimGamePage";
import SettingsPage from "./pages/SettingsPage";

import type { Screen } from "./types/game";
import Icon from "./components/common/Icon";

import { useReactionGame } from "./hooks/useReactionGame";
import { useAimHistory } from "./hooks/useAimHistory";

const TARGET_SIZE_KEY = "target-size";
const GAME_MOTION_KEY = "game-motion";

function getSavedTargetSize(): number {
  const saved = Number(localStorage.getItem(TARGET_SIZE_KEY));

  return [48, 64, 80].includes(saved) ? saved : 64;
}

function getSavedMotion(): boolean {
  return localStorage.getItem(GAME_MOTION_KEY) !== "off";
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  const reactionGame = useReactionGame();
  const aimHistory = useAimHistory();

  const [targetSize, setTargetSizeState] =
    useState<number>(getSavedTargetSize);

  const [motion, setMotionState] =
    useState<boolean>(getSavedMotion);

  // Cập nhật state và lưu cài đặt target size.
  const setTargetSize = (size: number) => {
    if (![48, 64, 80].includes(size)) return;

    setTargetSizeState(size);
    localStorage.setItem(TARGET_SIZE_KEY, String(size));
  };

  // Cập nhật state và lưu trạng thái motion.
  const setMotion = (enabled: boolean) => {
    setMotionState(enabled);
    localStorage.setItem(
      GAME_MOTION_KEY,
      enabled ? "on" : "off",
    );
  };

  return (
    <main className={`app-shell screen-${screen}`}>
      <header>
        <button
          className="brand"
          type="button"
          onClick={() => setScreen("home")}
          aria-label="Về trang chủ"
        >
          <span className="brand-mark">
            <span>
              <Icon name="bolt" />
            </span>
          </span>

          <span>Reflex Lab</span>
        </button>

        <span className="header-label">
          {screen === "home" ? "Performance training" : screen}
        </span>
      </header>

      {screen === "home" && (
        <HomePage onNavigate={setScreen} />
      )}

      {screen === "games" && (
        <GameSelectPage onNavigate={setScreen} />
      )}

      {screen === "reaction" && (
        <ReactionGamePage onNavigate={setScreen} />
      )}

      {screen === "aim" && (
        <AimGamePage onNavigate={setScreen} />
      )}

      {screen === "settings" && (
        <SettingsPage
          targetSize={targetSize}
          setTargetSize={setTargetSize}
          motion={motion}
          setMotion={setMotion}
          onClearReactionHistory={reactionGame.clearHistory}
        onClearAimHistory={aimHistory.clearHistory}
          onNavigate={setScreen}
        />
      )}
    </main>
  );
}

export default App;
