import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import ScrambleTitle from "./components/ScrambleTitle";
import AboutSection from "./components/AboutSection";

export default function App() {
  const location = useLocation();
  const [titleDone, setTitleDone] = useState(false);
  const onTitleComplete = useCallback(() => setTitleDone(true), []);
  const modelViewerRef = useRef<any>(null);
  const [loadModel, setLoadModel] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Delay ISS 3D model loading by 1.2s to prioritize page render and responsiveness
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadModel(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Smooth scroll to About section if hash present (desktop only)
  useEffect(() => {
    if (location.hash === "#next") {
      const tryScroll = (attempt: number) => {
        const el = document.getElementById("next");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else if (attempt < 10) {
          setTimeout(() => tryScroll(attempt + 1), 150);
        }
      };
      tryScroll(0);
    }
  }, [location.hash]);

  const ctaHref = isMobile ? "/about" : "#next";

  return (
    <main className="page-scroll">
      <section className="section section-hero">
        <div className="hero-content">
          <ScrambleTitle onComplete={onTitleComplete} />
          <a href={ctaHref} className={`hero-cta ${titleDone ? "hero-fadein" : "hero-hidden"}`}>
            <span className="cta-arrow">↓</span>
            <span className="cta-arrow">↓</span>
            <span className="cta-arrow">↓</span>
          </a>
        </div>

        <div className="hero-iss-container">
          {loadModel && (
            /* @ts-ignore */
            <model-viewer
              ref={(el: any) => {
                modelViewerRef.current = el;
                if (el) {
                  el.addEventListener("load", () => {
                    el.style.opacity = "1";
                  });
                }
              }}
              src="https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/i/ISS_stationary.glb"
              alt="International Space Station 3D Model"
              camera-controls
              interaction-prompt="auto"
              camera-orbit="45deg 75deg 15m"
              camera-target="auto auto auto"
              field-of-view="25deg"
              min-field-of-view="5deg"
              max-field-of-view="45deg"
              min-camera-orbit="auto auto 5m"
              max-camera-orbit="auto auto 60m"
              style={{ width: "100%", height: "100%", opacity: 0, transition: "opacity 1s ease" }}
            />
          )}
        </div>
        {/* Invisible overlay: scroll here = page scroll, not model zoom */}
        <div className="hero-scroll-zone" />
      </section>

      {!isMobile && <AboutSection />}

      <footer className="site-footer">
        <p className="footer-copy">© 2026 Team Dhruva | Licensed under the MIT License.</p>
      </footer>
    </main>
  );
}
