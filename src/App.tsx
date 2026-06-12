import { useCallback, useEffect, useState, useRef } from "react";
import ScrambleTitle from "./components/ScrambleTitle";
import AboutSection from "./components/AboutSection";

export default function App() {
  const [titleDone, setTitleDone] = useState(false);
  const onTitleComplete = useCallback(() => setTitleDone(true), []);
  const modelViewerRef = useRef<any>(null);

  // Smooth scroll-driven fade for the hero title
  useEffect(() => {
    const heroContent = document.querySelector<HTMLElement>(".hero-content");
    if (!heroContent) return;

    const update = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const fadeOver = window.innerHeight * 0.5;
      const pct = Math.min(1, Math.max(0, scrollY / fadeOver));
      heroContent.style.opacity = String(1 - pct);
      heroContent.style.transform = `translateY(${pct * -40}px)`;
    };

    // Run once immediately in case page loaded mid-scroll
    update();

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      heroContent.style.opacity = "1";
      heroContent.style.transform = "none";
    };
  }, []);

  // Smooth scroll to About section if hash present
  useEffect(() => {
    if (window.location.hash === "#next") {
      const el = document.getElementById("next");
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, []);
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
          {/* @ts-ignore */}
          <model-viewer
            ref={modelViewerRef}
            src="https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/i/ISS_stationary.glb"
            alt="International Space Station 3D Model"
            camera-controls
            touch-action="pan-y"
            interaction-prompt="none"
            camera-orbit="-112.3deg 127.8deg 2400m"
            camera-target="7.88m 11.16m 15.52m"
            field-of-view="8deg"
            min-field-of-view="1deg"
            max-field-of-view="120deg"
            min-camera-orbit="auto auto 200m"
            max-camera-orbit="auto auto 10000m"
            style={{ width: "100%", height: "100%" }}
          />
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
