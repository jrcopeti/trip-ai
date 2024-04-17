interface Gradient1Props {
  left: string;
  top: string;
  bgColor1: string;
  bgColor2: string;
  blur: number;
  mdBlur: number;
}

function Gradient1({ left, top, bgColor1, bgColor2, blur, mdBlur }: Gradient1Props) {
  return (
    <section
    style={{ top: top, left: left }}
    className={`absolute inset-0 flex justify-center z-20`}
    >
      <div
        className={`ml-[8rem] h-[520px] w-[520px] rounded-full ${bgColor1} opacity-60  blur-[${blur}px] filter md:blur-[${mdBlur}px]`}
      ></div>
      <div
        className={`mr-[8rem] h-[520px] w-[520px] rounded-full ${bgColor2} opacity-50  mix-blend-color-burn blur-[${blur}px] filter md:blur-[${mdBlur}px]`}
      ></div>
    </section>
  );
}

export default Gradient1;
