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

  // Delay ISS 3D model loading by 1.2s to prioritize page render and responsiveness
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadModel(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Smooth scroll to About section if hash present
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
  return (
    <main className="page-scroll">
      <section className="section section-hero">
        <div className="hero-content">
          <ScrambleTitle onComplete={onTitleComplete} />
          <a href="#next" className={`hero-cta ${titleDone ? "hero-fadein" : "hero-hidden"}`}>
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
              interaction-prompt="none"
              camera-orbit="-112.3deg 127.8deg 2400m"
              camera-target="7.88m 11.16m 15.52m"
              field-of-view="8deg"
              min-field-of-view="1deg"
              max-field-of-view="120deg"
              min-camera-orbit="auto auto 10m"
              max-camera-orbit="auto auto 50000m"
              style={{ width: "100%", height: "100%", opacity: 0, transition: "opacity 1s ease" }}
            />
          )}
        </div>
        {/* Invisible overlay: scroll here = page scroll, not model zoom */}
        <div className="hero-scroll-zone" />
      </section>

      <AboutSection />

      <footer className="site-footer">
        <p className="footer-copy">© 2026 Team Dhruva | Licensed under the MIT License.</p>
      </footer>
    </main>
  );
}
