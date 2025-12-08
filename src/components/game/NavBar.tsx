import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Membership", path: "/membership" },
  { name: "Game", path: "/game" },
  { name: "Events", path: "/events" },
];

const NavBar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // audio + visual indicator toggle
  const [isAudioPlaying] = useState(false);

  // refs
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  // scroll values
  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // play/pause audio
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    if (isAudioPlaying) audio.play();
    else audio.pause();
  }, [isAudioPlaying]);

  // navbar show/hide logic
  useEffect(() => {
    if (!navContainerRef.current) return;

    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  // gsap animation for sliding navbar
  useEffect(() => {
    if (!navContainerRef.current) return;

    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          {/* Logo and product button */}
          <div className="flex items-center gap-7">
            <img src="/images/tvk-logo.png" alt="logo" className="w-24" />
          </div>

          {/* Navigation links + Audio */}
          <div className="flex h-full items-center">
            <div className="hidden md:block">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx("nav-hover-btn !text-lg hover:text-brand-gold hover:after:bg-brand-gold", {
                    "!text-brand-gold after:!scale-x-100 after:!bg-brand-gold": isActive(item.path),
                  })}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* <button
              onClick={toggleAudioIndicator}
              className="ml-10 flex items-center space-x-0.5"
            >
              <audio
                ref={audioElementRef}
                className="hidden"
                src="/audio/loop.mp3"
                loop
              />

              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={clsx("indicator-line", {
                    active: isIndicatorActive,
                  })}
                  style={{ animationDelay: `${bar * 0.1}s` }}
                />
              ))}
            </button> */}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;
