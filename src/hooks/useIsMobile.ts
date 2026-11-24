import { useState, useEffect } from "react";

// Portado tal cual de enroscaloReact/src/hooks/useIsMobile.ts.
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i;
      const isMobileUserAgent = mobileRegex.test(userAgent);
      const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
      const hasOrientation = "orientation" in window;
      setIsMobile(hasTouchScreen && (isMobileUserAgent || isSmallScreen || hasOrientation));
    };

    checkIsMobile();

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaChange = () => checkIsMobile();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    const handleOrientationChange = () => checkIsMobile();
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return isMobile;
};
