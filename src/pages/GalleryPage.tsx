import { useState, useEffect } from "react";
import { GALLERY_IMAGES, GalleryImage } from "../data/galleryData";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(GALLERY_IMAGES);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: GalleryImage[] = [];
        snap.forEach((docSnap) => {
          list.push(docSnap.data() as GalleryImage);
        });
        if (list.length > 0) {
          setImages(list);
        }
      } catch (err) {
        console.error("Error loading gallery from Firestore, using static fallback:", err);
      }
    };
    fetchGallery();
  }, []);

  const getSubtitleNumber = (img: { src: string; alt: string }) => {
    // 1. Try to match trailing number in alt (e.g. "Telescope setup and alignment 2" -> 2)
    const altMatch = img.alt.trim().match(/\d+$/);
    if (altMatch) return altMatch[0];

    // 2. Try to match clean number in filename (e.g. "19.jpg" -> 19)
    const filename = img.src.split("/").pop() || "";
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    if (/^\d+$/.test(nameWithoutExt)) return nameWithoutExt;

    return "";
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev! - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev! + 1));
    }
  };

  return (
    <>
      <main className="page-scroll">
        <div className="vertical-page-container" style={{ paddingRight: "32px", paddingLeft: "32px", paddingTop: "350px" }}>
          {/* Photo Grid covering the whole width */}
          <div className="gallery-grid-container" style={{ pointerEvents: "auto" }}>
            {images.map((img, index) => {
              // Collage sizing logic: large (2x2), medium (2x1), small (1x1)
              let sizeClass = "gallery-small";
              if (index === 7 || index === 8) {
                sizeClass = "gallery-small";
              } else {
                const virtualIndex = index >= 9 ? index - 2 : index;
                const rem = virtualIndex % 10;
                if (virtualIndex === 5 || rem === 0 || rem === 7) {
                  sizeClass = "gallery-large";
                } else if (rem === 3) {
                  sizeClass = "gallery-medium";
                }
              }
              const subNum = getSubtitleNumber(img);
              return (
                <div key={index} className={`gallery-grid-item ${sizeClass}`} onClick={() => setSelectedIndex(index)}>
                  <img src={img.src} alt={img.alt} className="gallery-grid-image" loading="lazy" />
                  {subNum && (
                    <span className="gallery-item-number">{subNum}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <footer className="site-footer">
          <p className="footer-copy">© 2026 Team Dhruva | Licensed under the MIT License.</p>
        </footer>
      </main>

      {/* Lightbox Modal Overlay showing only image and nav buttons */}
      {selectedImage && (
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

          <div className="gallery-lightbox-image-wrapper" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.alt} className="gallery-lightbox-image" />
          </div>
        </div>
      )}
    </>
  );
}
