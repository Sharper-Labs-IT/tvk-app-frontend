import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAudio } from "../../context/AudioContext";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Membership", path: "/membership" },
  { name: "Games", path: "/games" },
  { name: "Events", path: "/events" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Store", path: "/store" },
];

const NavBar = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { isMuted, toggleMute } = useAudio();
  const isActive = (path: string) => location.pathname === path;

  // audio + visual indicator toggle
  const [isAudioPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

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

    // Don't hide navbar if mobile menu is open
    if (isMenuOpen) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
      return;
    }

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
  }, [currentScrollY, lastScrollY, isMenuOpen]);

  // gsap animation for sliding navbar
  useEffect(() => {
    if (!navContainerRef.current) return;

    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <div
        ref={navContainerRef}
        className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
      >
        <header className="absolute top-1/2 w-full -translate-y-1/2">
          <nav className="flex size-full items-center justify-between p-4">
            {/* Logo */}
            <div className="flex items-center gap-7">
              <img src="/images/tvk-logo.png" alt="logo" className="w-24" />
            </div>

            {/* Desktop Navigation */}
            <div className="flex h-full items-center">
              <div className="hidden md:block">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={clsx(
                      "nav-hover-btn !text-lg hover:text-brand-gold hover:after:bg-brand-gold",
                      {
                        "!text-brand-gold after:!scale-x-100 after:!bg-brand-gold":
                          isActive(item.path),
                      }
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                {isLoggedIn && (
                  <Link
                    to="/dashboard/feed"
                    className={clsx(
                      "nav-hover-btn !text-lg hover:text-brand-gold hover:after:bg-brand-gold",
                      {
                        "!text-brand-gold after:!scale-x-100 after:!bg-brand-gold":
                          isActive("/dashboard/feed"),
                      }
                    )}
                  >
                    Feed
                  </Link>
                )}
              </div>

              {/* Audio Control Button */}
              <button
                onClick={toggleMute}
                className="ml-4 p-2 transition-colors hover:text-brand-gold text-white"
                aria-label={isMuted ? "Unmute music" : "Mute music"}
              >
                {isMuted ? (
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" 
                    />
                  </svg>
                ) : (
                  <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
                    />
                  </svg>
                )}
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={toggleMenu}
                className="ml-4 block md:hidden text-white focus:outline-none"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? (
                  // Close Icon (X)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  // Hamburger Icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </nav>
        </header>
      </div>

      {/* Mobile Navigation Drawer (Full Screen Overlay) */}
      <div
        className={clsx(
          "fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:hidden",
          {
            "translate-x-0": isMenuOpen,
            "translate-x-full": !isMenuOpen,
          }
        )}
      >
        <div className="flex flex-col items-center space-y-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
              className={clsx(
                "text-2xl font-bold uppercase tracking-widest transition-colors duration-200",
                isActive(item.path) ? "text-brand-gold" : "text-white hover:text-brand-gold"
              )}
            >
              {item.name}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              to="/dashboard/feed"
              onClick={() => setIsMenuOpen(false)}
              className={clsx(
                "text-2xl font-bold uppercase tracking-widest transition-colors duration-200",
                isActive("/dashboard/feed") ? "text-brand-gold" : "text-white hover:text-brand-gold"
              )}
            >
              Feed
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;