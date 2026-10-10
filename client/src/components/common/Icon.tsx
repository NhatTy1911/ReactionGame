export type IconName = | "bolt" | "target" | "settings" | "exit" | "arrow" | "rotate";

interface IconProps {
    name: IconName;
}

function Icon({ name }: IconProps ) {
    const paths = {
        bolt: (
            <path d="M13.2 2.75 5.9 13h5.4l-.5 8.25L18.1 11h-5.4l.5-8.25Z" />
        ),
        target: (
            <>
                <circle cx="12" cy="12" r="8.5" />
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
            </>
        ),
        settings: (
            <>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.95 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08A1.7 1.7 0 0 0 4.6 8.95a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08A1.7 1.7 0 0 0 15.05 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.22.62.8 1 1.55 1H21v4h-.08c-.67 0-1.27.4-1.52 1Z" />
            </>
        ),
        exit: (
            <path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" />
        ),
        arrow: (
            <path d="m9 18 6-6-6-6" />
        ),
        rotate: (
            <path d="M20 7v5h-5M4.9 17a8 8 0 0 0 13.8-2M4 12a8 8 0 0 1 14-5l2 2" />
        ),
    };

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {paths[name]}
        </svg>
    );
}

export default Icon;
