import { useState, useRef, type MouseEvent, type ReactNode } from "react";
import { TiLocationArrow } from "react-icons/ti";
import Button from "./Button";

type BentoTiltProps = {
  children: ReactNode;
  className?: string;
};

export const BentoTilt = ({ children, className = "" }: BentoTiltProps) => {
  const [transformStyle, setTransformStyle] = useState<string>("");
  const itemRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    setTransformStyle(
      `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`
    );
  };

  const handleMouseLeave = () => setTransformStyle("");

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
    >
      {children}
    </div>
  );
};

type BentoCardProps = {
  src: string;
  title: ReactNode;
  description?: string;
  isComingSoon?: boolean;
  clickToPlay?: boolean;
  onPlay?: () => void;
};

export const BentoCard = ({
  src,
  title,
  description,
  isComingSoon,
  clickToPlay,
  onPlay,
}: BentoCardProps) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState<number>(0);
  const hoverButtonRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!hoverButtonRef.current) return;

    const rect = hoverButtonRef.current.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setHoverOpacity(1);
  const handleMouseLeave = () => setHoverOpacity(0);

  return (
    <div className="relative size-full">
      {src && (
        <video
          src={src}
          loop
          muted
          autoPlay
          className="absolute left-0 top-0 size-full object-cover object-center"
        />
      )}

      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        <div>
          <h1 className="bento-title special-font">{title}</h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base">{description}</p>
          )}
        </div>

        {isComingSoon && (
          <div
            ref={hoverButtonRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="border-hsla relative flex w-fit cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-black px-5 py-2 text-xs uppercase text-white/20"
          >
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
              style={{
                opacity: hoverOpacity,
                background: `radial-gradient(100px circle at ${cursorPosition.x}px ${cursorPosition.y}px, #656fe288, #00000026)`,
              }}
            />

            <TiLocationArrow className="relative z-20" />
            <p className="relative z-20">coming soon</p>
          </div>
        )}

        {clickToPlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 hover:opacity-100">
            <Button
              title="Play Now"
              leftIcon={<TiLocationArrow className="relative z-20 text-xl scale-150 mr-2" />}
              containerClass="!bg-yellow-300 flex items-center justify-center gap-1"
              onClick={onPlay}
            />
          </div>
        )}
      </div>
    </div>
  );
};

import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-black pb-52">
      <div className="container mx-auto px-3 md:px-10">
        <div className="px-5 py-32">
          <p className="font-circular-web text-lg text-blue-50">
            Experience the thrill of gaming with Thalapathy Vijay like never
          </p>
          <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50">
            Dive deeper into the TVK universe with exclusive games and
            interactive experiences that bring you closer to Thalapathy Vijay
            than ever before.
          </p>
        </div>

        <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
          <BentoCard
            src="videos/feature-1.mp4"
            title={
              <>
                TVK<b> memory</b> Challenge
              </>
            }
            description="A VJ Movie shuffle game - remix iconic scenes from Thalapathy Vijay's blockbuster movies."
            clickToPlay
            onPlay={() => navigate("/game/memory-challenge")}
          />
        </BentoTilt>

        <div className="grid h-[180vh] w-full grid-cols-2 grid-rows-4 gap-7">
          <BentoTilt className="bento-tilt_1 md:col-span-1 md:row-span-2">
            <BentoCard
              src="img/feature-2.webp"
              title={<>VJ</>}
              description="Thalapathy Vijay's exclusive gaming avatar - a play-to-earn gaming experience like no other."
              isComingSoon
            />
            <img
              src="img/feature-2.webp"
              alt="zigma avatar"
              className="absolute left-0 top-0 size-full object-cover object-center z-0"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_1 ms-32 md:col-span-1 md:ms-0">
            <BentoCard
              src="videos/feature-3.mp4"
              title={<>Protect the Queen</>}
              description="Help VJ to rescue the queen and save the kingdom in this epic action-adventure game."
              isComingSoon
              onPlay={() => navigate("/game/protect-queen")}
            />
             <img
              src="img/game-4.webp"
              alt="zigma avatar"
              className="absolute left-0 top-0 size-full object-cover object-center z-0 brightness-75"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <BentoCard
              src="videos/feature-2.mp4" 
              title={
                <>
                  <b>Villain</b> Hunt
                </>
              }
              description="Whack the villains and clean up the system in this fast-paced reflex game!"
              clickToPlay
              onPlay={() => navigate("/game/villain-hunt")}
            />
             <img
              src="img/game-1.webp" 
              alt="villain hunt"
              className="absolute left-0 top-0 size-full object-cover object-center z-0 brightness-50"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
            <BentoCard
              src="videos/feature-4.mp4"
              title={
                <>
                  <b>Protect the</b> Galaxy
                </>
              }
              description="Defend your territory from alien invaders in this thrilling space shooter game"
              clickToPlay
              onPlay={() => navigate("/game/protect-area")}
            />
            <img
              src="img/game-3.webp"
              alt="game 3"
              className="absolute left-0 top-0 size-full object-cover object-center z-0 brightness-75"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <BentoCard
              src="" 
              title={
                <>
                  <b>Jigsaw</b> Puzzle
                </>
              }
              description="Piece together iconic moments in this timed puzzle challenge!"
              clickToPlay
              onPlay={() => navigate("/game/jigsaw-puzzle")}
            />
             <img
              src="img/jigsaw.webp" 
              alt="jigsaw puzzle"
              className="absolute left-0 top-0 size-full object-cover object-center z-0 brightness-50"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <BentoCard
              src="" 
              title={
                <>
                  <b>Trivia</b> Battle
                </>
              }
              description="Test your knowledge about Thalapathy Vijay and prove you are the biggest fan!"
              clickToPlay
              onPlay={() => navigate("/game/trivia")}
            />
             <img
              src="img/trivia.webp" 
              alt="trivia battle"
              className="absolute left-0 top-0 size-full object-cover object-center z-0 brightness-50"
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_2">
            <BentoCard
              src="" 
              title={
                <>
                  <b>City</b> Defender
                </>
              }
              description="Defend the city from villains as the ultimate protector - VJ!"
              isComingSoon
              onPlay={() => navigate("/game/city-defender")}
            />
             <img
              src="img/bg-game6.webp" 
              alt="city defender"
              className="absolute left-0 top-0 size-full object-cover object-center z-0 brightness-50"
            />
          </BentoTilt>
        </div>
      </div>
    </section>
  );
};

export default Features;
