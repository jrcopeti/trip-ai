import type { Gradient1Props } from "@/types";

function Gradient1({ left, top, color1, color2, blur }: Gradient1Props) {
  return (
    <section
      className={`absolute inset-0 z-20 flex justify-center ${top} ${left}`}
    >
      <div
        className={`ml-[8rem] h-[520px] w-[520px] rounded-full ${color1} opacity-60 ${blur} filter`}
      ></div>
      <div
        className={`mr-[8rem] h-[520px] w-[520px] rounded-full ${color2} opacity-50  mix-blend-color-burn ${blur} filter`}
      ></div>
    </section>
  );
}

export default Gradient1;
