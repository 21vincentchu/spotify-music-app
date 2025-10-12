// import logo from './logo.svg';
import './App.css';

import React from "react";
import { useState, useEffect } from "react";

import MobileLayout from './layouts/MobileLayout';
import DesktopLayout from './layouts/DesktopLayout';

// import SignInPage from './pages/SignInPage';


function App() {
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}

export default App;
