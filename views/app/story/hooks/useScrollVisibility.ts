import { useState, useEffect } from "react";

export function useScrollVisibility() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";

      if (scrollDirection === "up" || currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (scrollDirection === "down" && currentScrollY > 100) {
        setIsNavVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return isNavVisible;
}
