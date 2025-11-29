import react from 'react';
import { useState, useEffect } from "react";

import MobileLayout from './layouts/MobileLayout';
import DesktopLayout from './layouts/DesktopLayout';


function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 300); // Wait 300ms after resize stops before switching layouts
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

export default App;