import { useEffect } from "react";
import { useReactionGame } from "../hooks/useReactionGame";
import type { Screen } from "../types/game";

interface ReactionGamePageProps {
    onNavigate: (screen: Screen) => void;
}

function ReactionGamePage({onNavigate}: ReactionGamePageProps) {
    const { 
        reactionState, reactionTime, best, average, handleGameClick
    } = useReactionGame();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Space" && event.code !== "Enter") return;

            const target = event.target;

            if (target instanceof HTMLElement 
                && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) {
                    return;
                }

            event.preventDefault();

            if (!event.repeat) handleGameClick();
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        }
    }, [handleGameClick])

    return (
        <>

        </>
    )
}

export default ReactionGamePage;