import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">

                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 18.5L4.5 16v-4l7.5 3.5 7.5-3.5v4l-7.5 4.5zM12 11L4.5 7.5 12 4l7.5 3.5-7.5 3.5z" />
                </svg>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    BMS
                </span>
            </div>
        </>
    );
}
