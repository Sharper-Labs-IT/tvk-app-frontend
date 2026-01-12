import { useState, useRef, type MouseEvent, type ReactNode } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react"; 

// --- IMPORTS ---
import Button from "./Button";
import { useAuth } from "../../context/AuthContext";
import MembershipModal from "../membership/MembershipModal";

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
    <div className="relative size-full overflow-hidden rounded-md group">
      {src && (
        <img
          src={src}
          alt="background"
          className="absolute left-0 top-0 size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      )}

      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50 bg-black/40">
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

// --- MAIN COMPONENT ---

const Features = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth(); 
  const [showModal, setShowModal] = useState(false);

  const handleGameClick = (path: string) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <section className="bg-black pb-52">
        <div className="container mx-auto px-3 md:px-10">
          <div className="px-5 py-32">
            <p className="font-circular-web text-lg text-blue-50">
              Experience the thrill of gaming with Thalapathy VJ like never
            </p>
            <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50">
              Dive deeper into the TVK universe with exclusive games and
              interactive experiences that bring you closer to Thalapathy VJ
              than ever before.
            </p>
          </div>

          <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
            <BentoCard
              src="img/memory.webp"
              title={
                <>
                  TVK<b> memory</b> Challenge
                </>
              }
              description="A VJ Movie shuffle game - remix iconic scenes from Thalapathy Vijay's blockbuster movies."
              clickToPlay
              onPlay={() => handleGameClick("/games/memory-challenge")}
            />
          </BentoTilt>

          <div className="flex flex-col gap-7 w-full md:grid md:grid-cols-2 md:grid-rows-4 md:h-[180vh]">
            
            {/* VJ Avatar */}
            <BentoTilt className="bento-tilt_1 h-96 md:h-auto md:row-span-2 md:col-span-1">
              <BentoCard
                src="img/feature-2.webp"
                title={<>VJ</>}
                description="Thalapathy VJ's exclusive gaming avatar - a play-to-earn gaming experience like no other."
                isComingSoon
              />
            </BentoTilt>

            {/* Villain Hunt */}
            <BentoTilt className="bento-tilt_2 h-96 md:h-auto md:row-span-1 md:col-span-1">
              <BentoCard
                src="img/game-1.webp" 
                title={
                  <>
                    <b>Villain</b> Hunt
                  </>
                }
                description="Whack the villains and clean up the system in this fast-paced reflex game!"
                clickToPlay
                onPlay={() => handleGameClick("/games/villain-hunt")}
              />
            </BentoTilt>

            {/* Protect Galaxy */}
            <BentoTilt className="bento-tilt_1 h-96 md:h-auto md:row-span-1 md:col-span-1 md:me-0">
              <BentoCard
                src="img/game-3.webp"
                title={
                  <>
                    <b>Protect the</b> Galaxy
                  </>
                }
                description="Defend your territory from alien invaders in this thrilling space shooter game"
                clickToPlay
                onPlay={() => handleGameClick("/games/protect-area")}
              />
            </BentoTilt>

            {/* Jigsaw */}
            <BentoTilt className="bento-tilt_2 h-96 md:h-auto md:row-span-1 md:col-span-1">
              <BentoCard
                src="img/jigsaw.webp" 
                title={
                  <>
                    <b>Jigsaw</b> Puzzle
                  </>
                }
                description="Piece together iconic moments in this timed puzzle challenge!"
                clickToPlay
                onPlay={() => handleGameClick("/games/jigsaw-puzzle")}
              />
            </BentoTilt>

            {/* Trivia */}
            <BentoTilt className="bento-tilt_2 h-96 md:h-auto md:row-span-1 md:col-span-1">
              <BentoCard
                src="img/trivia.webp" 
                title={
                  <>
                    <b>Trivia</b> Battle
                  </>
                }
                description="Test your knowledge about Thalapathy Vijay and prove you are the biggest fan!"
                clickToPlay
                onPlay={() => handleGameClick("/games/trivia")}
              />
            </BentoTilt>
          </div>
        </div>
      </section>

      {/* --- SUBSCRIPTION MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-brand-dark rounded-3xl shadow-2xl border border-white/10">
    
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <MembershipModal />
          </div>
        </div>
      )}
    </>
  );
};

export default Features;