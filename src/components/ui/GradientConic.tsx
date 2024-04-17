interface GradientConicProps {
  left: string;
  top: string;
  from: string;
  to: string;
  blur: number;
}

function GradientConic({ left, top, from, to, blur }: GradientConicProps) {
  return (
    <section
      style={{ top: top, left: left }}
      className={`absolute inset-0 flex justify-center z-20`}
    >
      <div
        className={`from h-[520px] w-[520px] rounded-full bg-gradient-conic ${from} ${to} opacity-50 blur-[${blur}px] filter`}
      ></div>
    </section>
  );
}

export default GradientConic;
