import { useState, useEffect, useRef } from "react";

export function useScrollVisibility() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection =
        currentScrollY > lastScrollYRef.current ? "down" : "up";

      if (scrollDirection === "up" || currentScrollY < 10) {
        setIsNavVisible((prev) => (prev ? prev : true));
      } else if (scrollDirection === "down" && currentScrollY > 100) {
        setIsNavVisible((prev) => (prev ? false : prev));
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isNavVisible;
}
