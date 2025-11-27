import { gsap } from "gsap";
import { useState, useRef, useEffect } from "react";
import type { ReactNode, MouseEvent } from "react";

type VideoPreviewProps = {
  children: ReactNode;
};

export const VideoPreview = ({ children }: VideoPreviewProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!isHovering) return;
    
    const { clientX, clientY, currentTarget } = e;

    const rect = currentTarget.getBoundingClientRect();

    const xOffset = clientX - (rect.left + rect.width / 2);
    const yOffset = clientY - (rect.top + rect.height / 2);

    if (sectionRef.current) {
      gsap.to(sectionRef.current, {
        x: xOffset,
        y: yOffset,
        rotationY: xOffset / 2,
        rotationX: -yOffset / 2,
        transformPerspective: 500,
        duration: 0.5,
        ease: "power1.out",
      });
    }

    if (contentRef.current) {
      gsap.to(contentRef.current, {
        x: -xOffset,
        y: -yOffset,
        duration: 0.5,
        ease: "power1.out",
      });
    }
  };

  useEffect(() => {
    if (!isHovering) {
      if (sectionRef.current) {
        gsap.to(sectionRef.current, {
          x: 0,
          y: 0,
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    }

    return () => {
      // Cleanup animations on unmount
      gsap.killTweensOf([sectionRef.current, contentRef.current]);
    };
  }, [isHovering]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="absolute z-50 size-full overflow-hidden rounded-lg"
      style={{
        perspective: "400px",
      }}
    >
      <div
        ref={contentRef}
        className="origin-center rounded-lg"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </section>
  );
};

export default VideoPreview;
