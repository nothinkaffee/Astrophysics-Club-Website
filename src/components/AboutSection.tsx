import { useEffect, useRef, useState, useCallback } from "react";
import ApodPanel from "./ApodPanel";


const PARAS = [
  `Dhruva is the Astrophysics and Astronomy Club at RV College of Engineering — an interdisciplinary team working towards understanding our universe better. What began as a quest to explore the secrets of the universe is now a growing team of passionate astrophysics enthusiasts. Like Dhruva, the pole star, we constantly try to keep up with the happenings of the universe through our telescopes, radio telescopes and analysis.`,
  `We host stargazing events, astrophysics-related coding competitions and engage in impactful discussions on the latest observations made by the astrophysics community across the globe. We also believe in sharing our understanding through informative videos, blogs and journals.`,
  `We have also delved into astrophotography to capture the marvelous pictures of the universe. We collaborate with ABBA and other student astrophysics clubs for interactive sessions and better outreach.`,
];

export default function AboutSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Trigger TextDecode animation on scroll-into-view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const updateLayout = useCallback(() => {
    const section   = sectionRef.current;
    const container = headlineRef.current;
    if (!section || !container) return;

    const p = container.querySelector("p");
    if (p) {
      const availableWidth = container.getBoundingClientRect().width;
      
      const measureContainer = document.createElement("div");
      measureContainer.style.fontFamily = getComputedStyle(p).fontFamily || "'Helvetica Neue', 'HelveticaNeue', Helvetica, Arial, sans-serif";
      measureContainer.style.fontWeight = getComputedStyle(p).fontWeight || "800";
      measureContainer.style.letterSpacing = "-0.04em";
      measureContainer.style.fontSize = "100px";
      measureContainer.style.position = "absolute";
      measureContainer.style.visibility = "hidden";
      measureContainer.style.whiteSpace = "nowrap";

      const text = "Astrophysics and Astronomy Club";
      const chars = text.split("");
      chars.forEach(ch => {
        const s = document.createElement("span");
        if (ch === " ") {
          s.innerHTML = "&nbsp;";
        } else {
          s.textContent = ch;
        }
        measureContainer.appendChild(s);
      });

      document.body.appendChild(measureContainer);
      const containerLeft = measureContainer.getBoundingClientRect().left;
      const lastSpan = measureContainer.lastElementChild;
      const lastSpanRight = lastSpan ? lastSpan.getBoundingClientRect().right : measureContainer.getBoundingClientRect().right;
      const probeWidth = lastSpanRight - containerLeft;
      document.body.removeChild(measureContainer);

      if (availableWidth > 0 && probeWidth > 0) {
        const exactSize = (availableWidth / probeWidth) * 100;
        p.style.fontSize = `${exactSize.toFixed(2)}px`;
      }
    }

    const headlineHeight = container.getBoundingClientRect().height || 130;

    // Position headline bottom at 60% of the viewport height
    // so when the about section is fully in view, the tagline sits
    // comfortably in the lower-middle of the screen
    const targetBottom = window.innerHeight * 0.60;
    const newPaddingTop = Math.max(40, targetBottom - headlineHeight);
    section.style.paddingTop = `${newPaddingTop}px`;

    // Position padding-bottom to keep a gap below the header when scrolled down
    const headerEl = document.querySelector(".site-header") as HTMLElement | undefined;
    const footerEl = document.querySelector(".site-footer") as HTMLElement | undefined;
    const columnsEl = section.querySelector(".about-columns") as HTMLElement | undefined;

    if (headerEl && footerEl && columnsEl) {
      const headerBottom = headerEl.getBoundingClientRect().bottom;
      const footerHeight = footerEl.getBoundingClientRect().height;
      const columnsHeight = columnsEl.getBoundingClientRect().height;
      const gap = columnsEl.getBoundingClientRect().top - container.getBoundingClientRect().bottom;

      // We want a gap of 48px below the header and the top of the title (container)
      const targetGapBelowHeader = 48;
      const computedPaddingBottom = window.innerHeight - (headerBottom + targetGapBelowHeader) - footerHeight - columnsHeight - gap - headlineHeight;
      section.style.paddingBottom = `${Math.max(40, computedPaddingBottom)}px`;
    }
  }, []);

  // Update layout when element visibility changes
  useEffect(() => {
    if (visible) {
      updateLayout();
    }
  }, [visible, updateLayout]);

  // Update layout on window resize
  useEffect(() => {
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [updateLayout]);

  // Update layout when the columns resize (e.g. image loads, text wrap changes)
  useEffect(() => {
    if (!visible) return;
    const columnsEl = sectionRef.current?.querySelector(".about-columns");
    if (!columnsEl) return;

    const observer = new ResizeObserver(() => {
      updateLayout();
    });
    observer.observe(columnsEl);
    return () => observer.disconnect();
  }, [visible, updateLayout]);

  return (
    <section ref={sectionRef} id="next" className="section section-about">

      {/* Full-width headline */}
      <div ref={headlineRef} className="about-headline">
        {visible && (
          <p className="about-headline-text">
            {"Astrophysics and Astronomy Club".split("").map((ch, i) => (
              <span key={i}>{ch === " " ? "\u00A0" : ch}</span>
            ))}
          </p>
        )}
      </div>

      {/* Two-column: body text left, APOD panel right */}
      <div className="about-columns">
        <div className="about-body">
          <p className={`about-quote ${visible ? "about-fadein" : "about-hidden"}`}
             style={{ animationDelay: "1.7s" }}>
            "We are stardust brought to life, then empowered by the universe to figure itself out — and we have only just begun."
            <span style={{ display: "block", marginTop: "12px", fontSize: "0.88em", opacity: 0.85 }}>
              — Neil deGrasse Tyson
            </span>
          </p>
          {PARAS.map((para, i) => (
            <p key={i}
               className={`about-para ${visible ? "about-fadein" : "about-hidden"}`}
               style={{ animationDelay: `${2.1 + i * 0.22}s` }}>
              {para}
            </p>
          ))}
        </div>

        <ApodPanel />
      </div>

    </section>
  );
}
