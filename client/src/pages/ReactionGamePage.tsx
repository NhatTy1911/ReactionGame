import React, { useEffect } from "react";
import { useReactionGame } from "../hooks/useReactionGame";
import type { Screen } from "../types/game";
import Icon from "../components/common/Icon";
import type { ReactNode } from "react";
import "./ReactionGamePage.css";

interface ReactionGamePageProps {
    onNavigate: (screen: Screen) => void;
}

function ReactionGamePage({onNavigate}: ReactionGamePageProps) {
    const { 
        reactionState, reactionTime, best, average, handleGameClick
    } = useReactionGame();

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        handleGameClick(event.timeStamp);
    }

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Space" && event.code !== "Enter") return;

            const el = event.target;
            if (el instanceof HTMLElement) {
                if (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
                if (el.closest("button, a") && !el.closest(".reaction-field")) return;
            }

            event.preventDefault();
            if (!event.repeat) handleGameClick(event.timeStamp);
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        }
    }, [handleGameClick])

    return (
        <section className={`play-screen reaction-${reactionState} page-center`}>
            <div className="play-toolbar">
                <button className="back-button" onClick={() => onNavigate("games")}>
                    ← Games
                </button>

                <div>
                    <span>Best</span>
                    <strong>{best ? `${best} ms` : "-"}</strong>
                </div>
                <div>
                    <span>Average</span>
                    <strong>{average ? `${average} ms` : "-"}</strong>
                </div>
            </div>

            <button className="reaction-field" 
                onPointerDown={handlePointerDown} 
                onClick={(event) => {
                    // click do bàn phím / screen reader sinh ra có detail === 0
                    if (event.detail === 0) handleGameClick(event.timeStamp);
                }}
                aria-label="Reaction test. Click or press Space to play.">
                <span className="signal" aria-hidden="true">
                    <i/>
                    <i/>
                    <i/>
                </span>

                {reactionState === "idle" && (
                    <GameMessage 
                        label="Reaction test" 
                        title={<>How fast are you?</>} 
                        text="Tap start, then wait for the screen to turn green."/>
                )}

                {reactionState === "waiting" && (
                    <GameMessage
                        label="Stay focused"
                        title={<>Wait for green</>}
                        text="Don't tap yet. The signal can appear at any moment."/>
                )}

                {reactionState === "ready" && (
                    <GameMessage
                        label="Now"
                        title={<>Tap!</>}
                        text="The clock is running."
                    />
                )}

                {reactionState === "result" && (
                    <GameMessage
                        label="Your reaction"
                        title={<>{reactionTime} ms</>}
                        text={
                            reactionTime !== null && reactionTime < 250
                                ? "Sharp reflexes. That's a seriously quick response."
                                : "Good run. Go again and beat your time."
                            }
                    />
                )}

                {reactionState === "early" && (
                    <GameMessage
                        label="False start"
                        title={<>Too soon!</>}
                        text="Anticipation got you. Wait for the green signal."
                    />
                )}

                {reactionState !== "waiting" && reactionState !== "ready" && (
                    <span className="game-action">
                        <Icon name={reactionState === "idle" ? "bolt" : "rotate"}/>
                        {reactionState === "idle" ? "Start test" : "Go again"}
                    </span>
                )}
            </button>
        </section>
    );
}

interface GameMessageProps {
    label: string;
    title: ReactNode;
    text: string;
}

function GameMessage({label, title, text}: GameMessageProps) {
    return (
        <span className="game-message">
            <span className="kicker">{label}</span>
            <strong>{title}</strong>
            <small>{text}</small>
        </span>
    );
}

export default ReactionGamePage;