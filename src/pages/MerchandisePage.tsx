import { useState, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

interface MerchItem {
  src: string;
  title: string;
  category: string;
  description: string;
}

const MERCH_ITEMS: MerchItem[] = [
  {
    src: "/merchandise/FFmockup.png",
    title: "Hoodie Front View",
    category: "Hoodie",
    description: "Astrophysics logo coordinates printed in high-density silver ink on front chest."
  },
  {
    src: "/merchandise/FBmockup.png",
    title: "Hoodie Back View",
    category: "Hoodie",
    description: "Full back blueprint layout illustrating radio astronomy horn calculations and waveguide geometry."
  },
  {
    src: "/merchandise/SHmockup.png",
    title: "Hoodie Sleeve Design",
    category: "Hoodie",
    description: "LIGO gravitational wave frequency signal trace printed along the sleeve."
  },
  {
    src: "/merchandise/Back element.png",
    title: "Varsity Back Design Element",
    category: "Varsity Details",
    description: "Full spacetime curvature and coordinate vector layout for the back panel of the Varsity Jacket."
  }
];

export default function MerchandisePage() {
  const [merchItems, setMerchItems] = useState<MerchItem[]>(MERCH_ITEMS);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem = selectedIndex !== null ? merchItems[selectedIndex] : null;

  useEffect(() => {
    const fetchMerch = async () => {
      try {
        const snap = await getDocs(collection(db, "merchandise"));
        const list: MerchItem[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as MerchItem);
        });
        if (list.length > 0) {
          setMerchItems(list);
        }
      } catch (err) {
        console.error("Error loading merchandise from Firestore, using static fallback:", err);
      }
    };
    fetchMerch();
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  // Match the header padding and title font size logic from vertical page/events
  useEffect(() => {
    const updateLayout = () => {
      const container = containerRef.current;
      const p = textRef.current;
      if (!container || !p) return;

      const availableWidth = container.getBoundingClientRect().width;
      
      const measureContainer = document.createElement("div");
      measureContainer.style.fontFamily = getComputedStyle(p).fontFamily || "'Helvetica Neue', 'HelveticaNeue', Helvetica, Arial, sans-serif";
      measureContainer.style.fontWeight = getComputedStyle(p).fontWeight || "800";
      measureContainer.style.letterSpacing = "-0.04em";
      measureContainer.style.fontSize = "100px";
      measureContainer.style.position = "absolute";
      measureContainer.style.visibility = "hidden";
      measureContainer.style.whiteSpace = "nowrap";

      const referenceText = "Astrophysics and Astronomy Club";
      const chars = referenceText.split("");
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

      const newPaddingTop = Math.max(80, window.innerHeight * 0.32);
      const pageContainer = container.closest(".vertical-page-container") as HTMLElement;
      if (pageContainer) {
        pageContainer.style.paddingTop = `${newPaddingTop}px`;
      }
    };

    updateLayout();
    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(prev => (prev === 0 ? merchItems.length - 1 : prev! - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(prev => (prev === merchItems.length - 1 ? 0 : prev! + 1));
    }
  };

  return (
    <>
      <main className="page-scroll">
        <div className="vertical-page-container" style={{ paddingRight: "32px", paddingLeft: "32px", paddingTop: "350px" }}>
          {/* Title - exactly aligned with the grid */}
          <div ref={containerRef} className="radio-headline" style={{ padding: "0 16px" }}>
            <h1 ref={textRef} className="radio-headline-text">
              {"Merchandise".split("").map((ch, i) => (
                <span key={i}>{ch === " " ? "\u00A0" : ch}</span>
              ))}
            </h1>
          </div>

          <div className="merch-grid-container" style={{ pointerEvents: "auto" }}>
            {merchItems.map((item, index) => {
              return (
                <div
                  key={index}
                  className="merch-card"
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="merch-img-wrapper">
                    <img src={item.src} alt={item.title} className="merch-img" loading="lazy" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="site-footer">
          <p className="footer-copy">© 2026 Team Dhruva | Licensed under the MIT License.</p>
        </footer>
      </main>

      {/* NASA-style Lightbox Modal */}
      {selectedItem && (
        <div className="nasa-lightbox-overlay" style={{ pointerEvents: "auto" }} onClick={() => setSelectedIndex(null)}>
          <button className="nasa-lightbox-close-btn" onClick={() => setSelectedIndex(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <button className="gallery-nav-btn prev-btn" onClick={handlePrev}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className="gallery-nav-btn next-btn" onClick={handleNext}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div className="nasa-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="nasa-lightbox-image-section">
              <img src={selectedItem.src} alt={selectedItem.title} className="nasa-lightbox-image" />
            </div>

            <div className="nasa-lightbox-details-section">
              <div className="nasa-details-content">
                <span className="nasa-tag">{selectedItem.category} Collection</span>
                <h2 className="nasa-title">{selectedItem.title}</h2>
                <div className="nasa-divider" />
                <p className="nasa-description">{selectedItem.description}</p>
                
                <div className="nasa-meta-grid">
                  <div className="nasa-meta-item">
                    <span className="nasa-meta-label">Availability</span>
                    <span className="nasa-meta-val">Limited Batch Epoch J2026.9</span>
                  </div>
                  <div className="nasa-meta-item">
                    <span className="nasa-meta-label">Material</span>
                    <span className="nasa-meta-val">Premium Heavyweight Cotton</span>
                  </div>
                </div>

                <div className="nasa-actions">
                  <a href={selectedItem.src} download className="nasa-download-btn">
                    <span className="download-icon">↓</span> Download Mockup File
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
