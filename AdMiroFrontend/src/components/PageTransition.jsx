"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition({ children }) {
  const containerRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!containerRef.current) return;

    // Animate page in
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      }
    );
  }, [pathname]);

  return <div ref={containerRef}>{children}</div>;
}
