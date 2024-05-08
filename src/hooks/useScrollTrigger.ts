import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import { useSingleSavedTrip } from "./useSingleSavedTrip";
import { useWeather } from "./useWeather";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTripResponse } from "./useTripResponse";

export function useScrollTrigger() {
  const params = useParams();
  const { isPendingSingleSavedTrip } = useSingleSavedTrip({ params });
  const { isPendingResponseAI } = useTripResponse();
  const {
    isPendingWeather,
    weatherData,
    isPendingDailyForecast,
    dailyForecastData,
  } = useWeather();

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!isPendingSingleSavedTrip && !isPendingResponseAI) {
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.from(".trip-description", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".description-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        gsap.from(".plane", {
          autoAlpha: 0,
          x: -200,

          scrollTrigger: {
            trigger: ".tours-section",
            start: "300px bottom",
            end: "center -300px",
            scrub: true,
          },
        });

        gsap.from(".title-tours", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".tours-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        ScrollTrigger.batch(".tour-item", {
          start: "top bottom",
          end: "center center",

          onEnter: (elements) => {
            gsap.from(elements, {
              autoAlpha: 0,
              y: 100,
              stagger: 0.5,
            });
          },
        });

        gsap.from(".stamps", {
          autoAlpha: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ".stamps",
            start: "300px bottom",
            end: "center -100px",
            scrub: 1,
          },
        });

        ScrollTrigger.batch(".objects-list", {
          start: "top bottom",
          end: "center center",
          interval: 0.8,
          batchMax: 3,

          onEnter: (elements) => {
            gsap.from(elements, {
              autoAlpha: 0,
              y: 100,
              ease: "power2.inOut",
              duration: 1.2,
            });
          },
        });

        gsap.from(".must-have", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".musthave-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        gsap.from(".form-details", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".formdetails-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });

        gsap.from(".final-card", {
          autoAlpha: 0,
          y: 150,
          duration: 1,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: ".final-section",
            start: "100px bottom",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        });
      });
      return () => context.revert();
    }
  }, [isPendingSingleSavedTrip, isPendingResponseAI]);

  useIsomorphicLayoutEffect(() => {
    if (
      !isPendingSingleSavedTrip &&
      !isPendingResponseAI &&
      !isPendingWeather &&
      !isPendingDailyForecast &&
      weatherData &&
      dailyForecastData
    ) {
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.from(".weather-card", {
          autoAlpha: 0,
          y: 300,
          duration: 1,
          scrollTrigger: {
            trigger: ".weather-section",
            start: "-150px center",
            end: "center 300px",
            toggleActions: "restart none play none",
          },
        }),
          gsap.from(".forecast-card", {
            autoAlpha: 0,
            y: 300,
            duration: 1,
            scrollTrigger: {
              trigger: ".forecast-section",
              start: "-150px center",
              end: "center 300px",
              toggleActions: "restart none play none",
            },
          });
      });
      return () => context.revert();
    }
  }, [
    isPendingSingleSavedTrip,
    isPendingResponseAI,
    isPendingWeather,
    isPendingDailyForecast,
    weatherData,
    dailyForecastData,
  ]);
}
