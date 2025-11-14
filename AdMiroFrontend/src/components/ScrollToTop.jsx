"use client";

import { useEffect, useState } from "react";
import { CaretUp } from "phosphor-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past 300px
      if (window.scrollY > 300) {
        setIsAnimatingOut(false);
        setIsVisible(true);
      } else if (isVisible) {
        setIsAnimatingOut(true);
        // Wait for animation to finish before unmounting
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#8b6f47] hover:bg-[#6b5535] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl z-40"
          style={{
            animation: isAnimatingOut
              ? "fadeOutScrollBtn 0.5s ease-in forwards"
              : "fadeInScrollBtn 0.5s ease-out forwards",
          }}
          aria-label="Scroll to top">
          <CaretUp size={20} weight="bold" />
        </button>
      )}
      <style>{`
        @keyframes fadeInScrollBtn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeOutScrollBtn {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
        }
      `}</style>
    </>
  );
}
