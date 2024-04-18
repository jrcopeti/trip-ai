interface GradientConicProps {
  left: string;
  top: string;
  from: string;
  to: string;
}

function GradientConic({ left, top, from, to }: GradientConicProps) {
  return (
    <section
      className={`absolute inset-0 z-20 flex justify-center ${left} ${top}`}
    >
      <div
        className={`from h-[520px] w-[520px] rounded-full bg-gradient-conic ${from} ${to} opacity-50 blur-[120px] filter`}
      ></div>
    </section>
  );
}

export default GradientConic;
