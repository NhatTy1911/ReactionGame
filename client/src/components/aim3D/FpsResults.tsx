interface FpsResultsProps {
    score: number;
    best: number;
    isNewBest: boolean;
    hits: number;
    misses: number;
    accuracy: number;
    onRestart: () => void;
    onExit: () => void;
}

/** Màn kết quả cuối lượt. data-no-lock: click vào đây không được khoá chuột lại. */
export default function FpsResults({
    score,
    best,
    isNewBest,
    hits,
    misses,
    accuracy,
    onRestart,
    onExit,
}: FpsResultsProps) {
    return (
        <div className="fps-results" data-no-lock role="dialog" aria-label="Round results">
            <div className="fps-results-card">
                <h2>Time&apos;s up!</h2>

                <div className="fps-results-score">
                    <span>SCORE</span>
                    <strong>{score}</strong>
                </div>

                <p className={isNewBest ? "fps-results-best is-new" : "fps-results-best"}>
                    {isNewBest ? "New personal best!" : `Best: ${best}`}
                </p>

                <dl className="fps-results-stats">
                    <div>
                        <dt>HITS</dt>
                        <dd>{hits}</dd>
                    </div>
                    <div>
                        <dt>MISSES</dt>
                        <dd>{misses}</dd>
                    </div>
                    <div>
                        <dt>ACCURACY</dt>
                        <dd>{accuracy.toFixed(1)}%</dd>
                    </div>
                </dl>

                <div className="fps-results-actions">
                    <button type="button" className="fps-results-primary" onClick={onRestart} autoFocus>
                        Play again
                    </button>
                    <button type="button" onClick={onExit}>
                        Exit
                    </button>
                </div>
            </div>
        </div>
    );
}
