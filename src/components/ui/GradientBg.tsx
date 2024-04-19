interface GradientBgProps {
  from: string;
  to: string;
  blur?: string;
}

function GradientBg({ from, to, blur }: GradientBgProps) {
  return (
    <div
      className={`absolute left-0 top-0 -z-30 h-full w-full bg-gradient-to-b ${from} ${to} ${blur}`}
    ></div>
  );
}

export default GradientBg;

