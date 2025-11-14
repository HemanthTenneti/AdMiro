import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export function usePageTransition() {
  const pathname = usePathname();
  const pageRef = useRef(null);

  useEffect(() => {
    if (!pageRef.current) return;

    // Animate page in with smooth easing
    gsap.fromTo(
      pageRef.current,
      {
        opacity: 0,
        y: 15,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "sine.out",
      }
    );
  }, [pathname]);

  return pageRef;
}

export function useScrollAnimation() {
  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);
}

export function animateOnScroll(element, options = {}) {
  if (!element) return;

  const defaultOptions = {
    fromVars: {
      opacity: 0,
      y: 30,
    },
    toVars: {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "sine.out",
    },
    scrollTrigger: true,
  };

  const config = { ...defaultOptions, ...options };

  if (config.scrollTrigger) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (
            entry.isIntersecting &&
            !entry.target.classList.contains("animated")
          ) {
            entry.target.classList.add("animated");
            gsap.fromTo(entry.target, config.fromVars, config.toVars);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return observer;
  } else {
    gsap.fromTo(element, config.fromVars, config.toVars);
  }
}

export function useScrollToTop() {
  const [isVisible, setIsVisible] = require("react").useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    gsap.to(window, {
      scrollTo: { y: 0 },
      duration: 1,
      ease: "sine.inOut",
    });
  };

  return { isVisible, scrollToTop, buttonRef };
}
