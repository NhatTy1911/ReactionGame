import "./AimCountdown.css";

interface AimCountdownProps {
    countdown: number;
}

function AimCountdown({ countdown }: AimCountdownProps) {
    return (
        <div className="aim-countdown" aria-live="polite">
            <span>Lock in</span>
            <strong key={countdown}>{countdown}</strong>
            <small>Find your rhythm. Accuracy before speed.</small>
        </div>
    );
}

export default AimCountdown;
