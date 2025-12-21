import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import { useEffect, useRef, useState } from "react";

import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [hasClicked, setHasClicked] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);

  const totalVideos = 4;
  const nextVdRef = useRef<HTMLVideoElement | null>(null);
  const currentVdRef = useRef<HTMLVideoElement | null>(null);
  const mainVideoRef = useRef<HTMLVideoElement | null>(null);

  // Progressive video loading: show content as soon as video can play
  const handleMainVideoLoad = () => {
    setVideoLoaded(true);
    setLoading(false);
  };

  // Optimized: Shorter fallback timeout and start video playback immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Reduced from 3s to 2s

    // Preload first video on mount
    if (mainVideoRef.current) {
      mainVideoRef.current.load();
    }

    return () => clearTimeout(timer);
  }, []);

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });

        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => {
            nextVdRef.current?.play().catch(() => {
            });
          },
        });

        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    {
      dependencies: [currentIndex],
      revertOnUpdate: true,
    }
  );

  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index: number): string => `/videos/hero-${index}.mp4`;

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen bg-violet-50">
          <div className="three-body" role="status" aria-label="Loading videos">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div>
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleMiniVdClick()}
                aria-label="Switch to next video"
              >
                <video
                  ref={currentVdRef}
                  src={videoLoaded ? getVideoSrc((currentIndex % totalVideos) + 1) : undefined}
                  loop
                  muted
                  playsInline
                  preload="none"
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                />
              </div>
            </VideoPreview>
          </div>

          <video
            ref={nextVdRef}
            src={hasClicked ? getVideoSrc(currentIndex) : undefined}
            loop
            muted
            playsInline
            preload="none"
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
          />

          {/* Fallback image with same animations and CSS */}
          <div
            className={`absolute left-0 top-0 size-full bg-cover bg-center object-cover transition-opacity duration-500 ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              backgroundImage: "url('/img/game-1.webp')",
              pointerEvents: videoLoaded ? 'none' : 'auto',
            }}
            aria-hidden={videoLoaded}
          />

          <video
            ref={mainVideoRef}
            src={getVideoSrc(
              currentIndex === totalVideos - 1 ? 1 : currentIndex
            )}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000' width='1920' height='1080'/%3E%3C/svg%3E"
            className={`absolute left-0 top-0 size-full object-cover object-center transition-opacity duration-500 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedData={handleMainVideoLoad}
            onCanPlayThrough={() => {
              if (mainVideoRef.current && !videoLoaded) {
                mainVideoRef.current.play().catch(() => {});
              }
            }}
          />
        </div>

        <h1 className="special-font hero-heading absolute bottom-10 right-5 z-40 text-blue-75">
          G<b>A</b>MING <b>A</b>REN<b>A</b>
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading  text-gradient-gold">
              th<b>a</b>l<b>a</b>p<b>a</b>thy VJ
            </h1>
          </div>
        </div>
      </div>

      <h1 className="special-font hero-heading absolute bottom-10 right-5 text-black">
        G<b>A</b>MING <b>A</b>REN<b>A</b>
      </h1>
    </div>
  );
};

export default Hero;
