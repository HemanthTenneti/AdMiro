import { useEffect, useRef } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export function usePageTransition() {
  const pathname = usePathname();
  const pageRef = useRef(null);

  useEffect(() => {
    if (!pageRef.current) return;

    // Animate page in
    gsap.fromTo(
      pageRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
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
      y: 40,
    },
    toVars: {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
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
