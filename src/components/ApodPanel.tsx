import { useEffect, useState } from "react";

interface ApodData {
  title: string;
  date: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  explanation: string;
  copyright?: string;
}

// Replace DEMO_KEY with your NASA API key from https://api.nasa.gov
const API_KEY = "CXw8rZkaGYCA4JnlE3jLB87C8de6uOcmcEGmnFc1";

export default function ApodPanel() {
  const [data, setData]       = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`)
      .then(r => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d: ApodData) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="apod-panel">

      <div className="apod-frame">
        {loading && (
          <div className="apod-placeholder">
            <span className="apod-loading-text">Fetching today's image…</span>
          </div>
        )}
        {error && (
          <div className="apod-placeholder">
            <span className="apod-loading-text">Unable to load</span>
          </div>
        )}
        {data && data.media_type === "image" && (
          <img
            src={data.url ?? data.hdurl}
            alt={data.title}
            className="apod-img"
            loading="lazy"
          />
        )}
        {data && data.media_type === "video" && (
          <div className="apod-placeholder">
            <span className="apod-loading-text">Today's feature is a video</span>
          </div>
        )}

        {/* Title overlay at the bottom of the frame */}
        {data && (
          <div className="apod-meta-overlay">
            <span className="apod-title">{data.title}</span>
            <span className="apod-date">
              {data.date}{data.copyright ? ` · ${data.copyright.trim()}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Label sits below the image */}
      <span className="apod-label">Astronomy Picture of the Day</span>

    </div>
  );
}
