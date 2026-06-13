import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const DESKTOP_NAV_ITEMS = [
  { label: "Home",        href: "/",            external: false },
  { label: "About",       href: "/#next",       external: false },
  { label: "Events",      href: "/events",      external: false },
  { label: "Verticals",   href: "/verticals",   external: false, hasSubmenu: true },
  { label: "Sponsorship", href: "/sponsorship", external: false },
  { label: "Recruitment", href: "/recruitment", external: false },
  { label: "Merchandise", href: "/merchandise", external: false, mobileOnly: true },
  { label: "Gallery",     href: "/gallery",     external: false },
  { label: "Join Us",     href: "",             external: false, hasSubmenu: true },
  { label: "Blog",        href: "/blog",        external: false },
  { label: "Team",        href: "/team",        external: false },
];

const DESKTOP_INFO_ITEMS = [
  { label: "12.9233° N  77.4988° E", href: "https://maps.google.com/?q=12.9233,77.4988", external: true },
  { label: "Est. 2018  ·  @ RVCE",   href: "https://maps.google.com/?q=12.9233,77.4988", external: true },
  { label: "Merchandise",            href: "/merchandise",                                external: false },
  { label: "Instagram",              href: "https://www.instagram.com/dhruva_rvce/",      external: true },
  { label: "LinkedIn",               href: "https://www.linkedin.com/company/dhruva-astronomy", external: true },
  { label: "YouTube",                href: "https://www.youtube.com/@dhruva1910",         external: true },
  { label: "GitHub",                 href: "https://github.com/Team-Dhruva",              external: true },
  { label: "Admin",                  href: "/admin",                                      external: false },
];

const VERTICALS_SUBMENU = [
  { label: "Radio Astronomy",       href: "/verticals/radio" },
  { label: "Data Driven Astronomy", href: "/verticals/data" },
  { label: "Optical Astronomy",     href: "/verticals/optical" },
  { label: "Research",              href: "/verticals/research" },
];

const RECRUITMENT_SUBMENU = [
  { label: "Epoch J2023.6", href: "/recruitment/J2023.6" },
  { label: "Epoch J2024.7", href: "/recruitment/J2024.7" },
  { label: "Epoch J2025.8", href: "/recruitment/J2025.8" },
  { label: "Epoch J2026.9", href: "/recruitment/J2026.9" },
];

const MOBILE_SOCIAL_ITEMS = [
  { label: "Location",  href: "https://maps.google.com/?q=12.9233,77.4988", title: "Location", icon: "marker" },
  { label: "Instagram", href: "https://www.instagram.com/dhruva_rvce/",     title: "Instagram", icon: "instagram" },
  { label: "LinkedIn",  href: "https://www.linkedin.com/company/dhruva-astronomy", title: "LinkedIn", icon: "linkedin" },
  { label: "GitHub",    href: "https://github.com/Team-Dhruva",            title: "GitHub", icon: "github" },
  { label: "YouTube",   href: "https://www.youtube.com/@dhruva1910",       title: "YouTube", icon: "youtube" },
];

const CONSTELLATION_SVG = (
  <svg viewBox="0 0 250 180" className="constellation-svg" width="170" height="120" fill="none" stroke="currentColor">
    <path d="M 20,40 L 75,48 L 122,92" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 122,92 L 119,128 L 172,149 L 191,110 Z" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx="20"  cy="40"  r="4.5" strokeWidth="1.2" /><circle cx="20"  cy="40"  r="1.8" fill="currentColor" />
    <circle cx="75"  cy="48"  r="4.5" strokeWidth="1.2" /><circle cx="75"  cy="48"  r="1.8" fill="currentColor" />
    <circle cx="122" cy="92"  r="4.5" strokeWidth="1.2" /><circle cx="122" cy="92"  r="1.8" fill="currentColor" />
    <circle cx="119" cy="128" r="4.5" strokeWidth="1.2" /><circle cx="119" cy="128" r="1.8" fill="currentColor" />
    <circle cx="172" cy="149" r="4.5" strokeWidth="1.2" /><circle cx="172" cy="149" r="1.8" fill="currentColor" />
    <circle cx="191" cy="110" r="4.5" strokeWidth="1.2" /><circle cx="191" cy="110" r="1.8" fill="currentColor" />
  </svg>
);

export default function SiteHeader() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const path = location.pathname;
  const [activeSubmenu, setActiveSubmenu] = useState<"verticals" | "sponsorship" | "recruitment" | "join-us" | "admin" | null>(null);

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(() => localStorage.getItem("headerHidden") === "true");

  const toggleHeader = () => {
    setHeaderHidden(h => {
      const next = !h;
      localStorage.setItem("headerHidden", String(next));
      return next;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthResolved(true);
    });
    return unsubscribe;
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const email = username.includes("@") ? username : `${username}@teamdhruva.org`;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setUsername("");
      setPassword("");
      setActiveSubmenu(null);
      navigate("/admin");
    } catch (err: any) {
      console.error("Firebase Login Error:", err.code, err.message);
      if (err.code === "auth/operation-not-allowed") {
        setLoginError("Email/Password provider is disabled in Firebase Console. Please enable it.");
        return;
      }
      setLoginError("Invalid credentials");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveSubmenu(null);
    navigate("/");
  };

  useEffect(() => {
    if (path.startsWith("/verticals")) {
      setActiveSubmenu("verticals");
    } else if (path.startsWith("/recruitment")) {
      setActiveSubmenu("recruitment");
    } else {
      setActiveSubmenu(null);
    }
  }, [path]);

  const toggle = (menu: "verticals" | "sponsorship" | "recruitment" | "join-us" | "admin") =>
    setActiveSubmenu(prev => (prev === menu ? null : menu));

  const SOCIAL_ICON_SIZE = 17.25;
  const renderSocialIcon = (icon: string) => {
    switch (icon) {
      case "marker":
        return <svg viewBox="0 0 24 24" width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
      case "instagram":
        return <svg viewBox="0 0 24 24" width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
      case "linkedin":
        return <svg viewBox="0 0 24 24" width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
      case "github":
        return <svg viewBox="0 0 24 24" width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
      case "youtube":
        return <svg viewBox="0 0 24 24" width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>;
      case "admin":
        return <svg viewBox="0 0 24 24" width={SOCIAL_ICON_SIZE} height={SOCIAL_ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
      default:
        return null;
    }
  };

  const hasSubmenuOpen = activeSubmenu === "verticals" || activeSubmenu === "sponsorship" || activeSubmenu === "recruitment" || activeSubmenu === "join-us" || activeSubmenu === "admin";

  const headerToggleBtn = (
    <button
      className="header-toggle-btn"
      onClick={toggleHeader}
      type="button"
      title="Hide header"
      aria-label="Hide header"
    >
      <svg viewBox="0 0 24 24" className="header-toggle-x" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );

  const headerRevealBtn = (
    <button
      className="header-reveal-btn"
      onClick={toggleHeader}
      type="button"
      title="Show header"
      aria-label="Show header"
    >
      <svg viewBox="0 0 24 24" className="header-reveal-arrow" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 11 12 6 7 11" />
        <polyline points="17 18 12 13 7 18" />
      </svg>
    </button>
  );

  if (headerHidden) {
    return headerRevealBtn;
  }

  return (
    <header className="site-header">
      {/* Logo — top-left, absolutely positioned on desktop */}
      <Link to="/" className="header-center" style={{ cursor: "pointer", pointerEvents: "auto" }}>
        {CONSTELLATION_SVG}
      </Link>

      {/* Right nav */}
      <nav className="header-right">
        {/* Submenu panel */}
        <div className={`verticals-submenu ${activeSubmenu ? "submenu-open" : ""}`}>
          {activeSubmenu === "verticals" &&
            VERTICALS_SUBMENU.map(s => (
              <Link key={s.label} to={s.href} className="submenu-link">{s.label}</Link>
            ))}
          {activeSubmenu === "sponsorship" && (
            <div className="submenu-text-wrap">
              We welcome corporate and individual sponsors to support our projects, events, and outreach initiatives. Your contributions directly fund astronomical research, public stargazing sessions, and educational workshops. For sponsorship opportunities and partnership details, email us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=teamdhruva@rvce.edu.in" target="_blank" rel="noopener noreferrer" className="submenu-email-link">teamdhruva@rvce.edu.in</a>
            </div>
          )}
          {activeSubmenu === "recruitment" &&
            RECRUITMENT_SUBMENU.map(s => (
              <Link key={s.label} to={s.href} className="submenu-link">{s.label}</Link>
            ))}
          {activeSubmenu === "join-us" && (
            <div className="submenu-text-wrap" style={{ whiteSpace: "normal" }}>
              Send us a letter of motivation and interests through Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=teamdhruva@rvce.edu.in" target="_blank" rel="noopener noreferrer" className="submenu-email-link">teamdhruva@rvce.edu.in</a> and we will get back to you regarding your interview and evaluation as soon as possible
            </div>
          )}
          {activeSubmenu === "admin" && (
            currentUser ? null : (
              <form className="submenu-login-form" onSubmit={handleLoginSubmit}>
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="login-input" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{ width: "100%" }}
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="login-input" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ width: "100%" }}
                />
                <button type="submit" className="login-submit-btn" style={{ marginTop: "4px" }}>&gt;</button>
                {loginError && (
                  <span style={{ fontSize: "10px", color: "rgba(220, 38, 38, 0.85)", marginTop: "4px", textTransform: "none", fontFamily: "monospace" }}>
                    {loginError}
                  </span>
                )}
              </form>
            )
            )}
          </div>

        {/* Desktop: info | divider | nav-links.
            Mobile: socials | divider | logo-or-submenu | divider | nav-links */}
        <div className="nav-main-cols">
          {/* Social icons column — visible only on mobile */}
          <div className="mobile-social-col">
            {MOBILE_SOCIAL_ITEMS.map(item => (
              <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="mobile-social-link" title={item.title}>
                {renderSocialIcon(item.icon)}
              </a>
            ))}
            {!authResolved ? (
              <span className="mobile-social-link" style={{ opacity: 0 }}>{renderSocialIcon("admin")}</span>
            ) : currentUser ? (
              <>
                <Link to="/admin" className="mobile-social-link" title="Dashboard">{renderSocialIcon("admin")}</Link>
                <button
                  className="mobile-social-link"
                  onClick={handleLogout}
                  type="button"
                  title="Logout"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "rgba(220, 38, 38, 0.85)" }}
                >{renderSocialIcon("admin")}</button>
              </>
            ) : (
              <button
                className={`mobile-social-link ${activeSubmenu === "admin" ? "nav-active" : ""}`}
                onClick={e => { e.preventDefault(); toggle("admin"); }}
                type="button"
                title="Admin"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >{renderSocialIcon("admin")}</button>
            )}
            {headerToggleBtn}
          </div>

          {/* Left divider — visible only on mobile */}
          <div className="mobile-left-divider" />

          {/* Info column — hidden on mobile */}
          <div className="info-col">
            {DESKTOP_INFO_ITEMS.map(item =>
              item.label === "Join Us" ? (
                <button
                  key={item.label}
                  className={`info-line info-btn ${activeSubmenu === "join-us" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("join-us"); }}
                  type="button"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textTransform: "uppercase", textAlign: "right" }}
                >
                  {item.label}
                </button>
              ) : item.label === "Admin" ? (
                !authResolved ? (
                  <span key="admin-resolving" className="info-line" style={{ opacity: 0 }}>Admin</span>
                ) : currentUser ? (
                  <React.Fragment key="admin-logged-in">
                    <Link
                      to="/admin"
                      className="info-line"
                      style={{ textTransform: "uppercase", textAlign: "right" }}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="info-line"
                      type="button"
                      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textTransform: "uppercase", textAlign: "right", color: "rgba(220, 38, 38, 0.85)" }}
                    >
                      Logout
                    </button>
                  </React.Fragment>
                ) : (
                  <button
                    key={item.label}
                    className={`info-line info-btn ${activeSubmenu === "admin" ? "nav-active" : ""}`}
                    onClick={e => { e.preventDefault(); toggle("admin"); }}
                    type="button"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textTransform: "uppercase", textAlign: "right" }}
                  >
                    Admin
                  </button>
                )
              ) : (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="info-line"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="info-line"
                  >
                    {item.label}
                  </Link>
                )
              )
            )}
          </div>

          {/* Mobile logo area — shows logo normally, submenu items when a submenu is open */}
          <div className={`mobile-logo-area ${hasSubmenuOpen ? "submenu-active" : ""}`}>
            {/* Logo (shown when no submenu is open) */}
            <div className="mobile-logo-wrap">
              <Link to="/" style={{ display: "flex", pointerEvents: "auto" }}>
                {CONSTELLATION_SVG}
              </Link>
            </div>
            {/* Submenu items (shown when submenu is open, replacing logo) */}
            <div className="mobile-submenu-items">
              {activeSubmenu === "verticals" &&
                VERTICALS_SUBMENU.map(s => (
                  <Link key={s.label} to={s.href} className="submenu-link">{s.label}</Link>
                ))}
              {activeSubmenu === "sponsorship" && (
                <div className="submenu-text-wrap">
                  We welcome corporate and individual sponsors to support our projects, events, and outreach initiatives. Your contributions directly fund astronomical research, public stargazing sessions, and educational workshops. For sponsorship opportunities and partnership details, email us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=teamdhruva@rvce.edu.in" target="_blank" rel="noopener noreferrer" className="submenu-email-link">teamdhruva@rvce.edu.in</a>
                </div>
              )}
              {activeSubmenu === "recruitment" &&
                RECRUITMENT_SUBMENU.map(s => (
                  <Link key={s.label} to={s.href} className="submenu-link">{s.label}</Link>
                ))}
              {activeSubmenu === "join-us" && (
                <div className="submenu-text-wrap" style={{ maxWidth: "320px", whiteSpace: "normal" }}>
                  Send us a letter of motivation and interests through Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=teamdhruva@rvce.edu.in" target="_blank" rel="noopener noreferrer" className="submenu-email-link">teamdhruva@rvce.edu.in</a> and we will get back to you regarding your interview and evaluation as soon as possible
                </div>
              )}
              {activeSubmenu === "admin" && (
                currentUser ? null : (
                  <form className="submenu-login-form" onSubmit={handleLoginSubmit}>
                    <input 
                      type="text" 
                      placeholder="Username" 
                      className="login-input" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      style={{ width: "100%" }}
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      className="login-input" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ width: "100%" }}
                    />
                    <button type="submit" className="login-submit-btn" style={{ marginTop: "4px" }}>&gt;</button>
                    {loginError && (
                      <span style={{ fontSize: "10px", color: "rgba(220, 38, 38, 0.85)", marginTop: "4px", textTransform: "none", fontFamily: "monospace" }}>
                        {loginError}
                      </span>
                    )}
                  </form>
                )
            )}
          </div>
          </div>

          {/* Permanent divider */}
          <div className="nav-col-divider" />

          {/* Nav links column */}
          <div className="nav-links-col">
            {DESKTOP_NAV_ITEMS.map(item =>
              item.hasSubmenu && item.label === "Join Us" ? (
                <button
                  key={item.label}
                  className={`side-nav-link nav-btn${item.mobileOnly ? " mobile-only" : ""} ${activeSubmenu === "join-us" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("join-us"); }}
                  type="button"
                >
                  {item.label}
                </button>
              ) : item.hasSubmenu ? (
                <button
                  key={item.label}
                  className={`side-nav-link nav-btn${item.mobileOnly ? " mobile-only" : ""} ${activeSubmenu === "verticals" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("verticals"); }}
                  type="button"
                >
                  {item.label}
                </button>
              ) : item.label === "Sponsorship" ? (
                <button
                  key={item.label}
                  className={`side-nav-link nav-btn${item.mobileOnly ? " mobile-only" : ""} ${activeSubmenu === "sponsorship" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("sponsorship"); }}
                  type="button"
                >
                  {item.label}
                </button>
              ) : item.label === "Recruitment" ? (
                <button
                  key={item.label}
                  className={`side-nav-link nav-btn${item.mobileOnly ? " mobile-only" : ""} ${activeSubmenu === "recruitment" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("recruitment"); }}
                  type="button"
                >
                  {item.label}
                </button>
              ) : (
                item.external ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`side-nav-link${item.mobileOnly ? " mobile-only" : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`side-nav-link${item.mobileOnly ? " mobile-only" : ""}`}
                  >
                    {item.label}
                  </Link>
                )
              )
            )}

            <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            {headerToggleBtn}
          </div>
        </div>
      </nav>
    </header>
  );
}
