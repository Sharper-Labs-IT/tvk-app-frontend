import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useRef } from "react";

import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const clipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!clipRef.current) return;

    const ctx = gsap.context(() => {
      const clipAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: clipRef.current,
          start: 'center center',
          end: '+=800 center',
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
        },
      });

      clipAnimation.to('.mask-clip-path', {
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
      });
    }, clipRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen w-full ">
      {/* Top Section */}
      <div className="relative mb-8 pt-36 flex flex-col items-center gap-5">
        <p className="text-sm uppercase tracking-wider text-gray-600">
          Welcome to VJ Games Hub
        </p>

        <AnimatedTitle
          title="Disc<b>o</b>ver the world's <br /> largest shared <b>a</b>dventure"
          containerClass="mt-5 text-black text-center"
        />

        
        <div className="about-subtext">
          <p className="text-gray-500">
            VJ Games Hub unites every player from countless games and platforms, both
            digital and physical, into a unified Play Economy
          </p>
        </div>
      </div>

      {/* Scroll Pin Section */}
      <div className="h-screen w-full" id="clip" ref={clipRef}>
        <div 
          className="mask-clip-path relative h-full w-full flex items-center justify-center"
          style={{
            width: '30vw',
            height: '30vh',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '0 auto'
          }}
        >
          <img
            src="img/abou.webp"
            alt="Background"
            className="absolute left-0 top-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
