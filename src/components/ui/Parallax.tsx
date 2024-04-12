function Parallax() {
  return (
    <div>
      Parallax
    </div>
  )
}

export default Parallax
// RIGHT HERE
  // useIsomorphicLayoutEffect(() => {
  //   if (!isPending) {
  //     const innerHeight = window.innerHeight;

  //     const getRatio = (el: HTMLElement) =>
  //       innerHeight / (innerHeight + el.offsetHeight);

  //     gsap.utils.toArray("section").forEach((section, i) => {
  //       if (section instanceof HTMLElement) {
  //         const bg = section.querySelector('[data-bg="true"]');

  //         gsap.fromTo(
  //           bg,
  //           {
  //             backgroundPosition: () =>
  //               i ? `50% ${-innerHeight * getRatio(section)}px` : "50% 0px",
  //           },
  //           {
  //             backgroundPosition: () =>
  //               `100% ${innerHeight * (1 - getRatio(section))}px`,
  //             ease: "none",
  //             scrollTrigger: {
  //               trigger: bg,

  //               start: () => (i ? "top bottom" : "top top"),
  //               end: "bottom top",
  //               scrub: true,
  //               invalidateOnRefresh: true,
  //             },
  //           },
  //         );
  //       }
  //     });
  //   }

  //   return () => {
  //     ScrollTrigger.getAll().forEach((st) => st.kill());
  //   };
  // }, [isPending]);
