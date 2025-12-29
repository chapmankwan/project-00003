import clsx from "clsx";

interface ProgressBar {
  percent: number;
}

const getProgressBarColor = (percent: number) => {
  if (percent === 100) return "bg-mint-400";
  if (percent === 0) return "bg-mono-400";
  if (percent > 50) return "bg-lavender-400";
  return "bg-red-500";
};

export const ProgressBar = ({ percent }: ProgressBar) => {
    const barColor = getProgressBarColor(percent);

    return (
        <div className="w-full h-1.5 rounded-full bg-mono-400 overflow-hidden">
        <div
            className={clsx(
                barColor,
                "h-full transition-all duration-300 ease-out"
            )}
            style={{ width: `${percent}%` }}
        />
        </div>
    );
};
