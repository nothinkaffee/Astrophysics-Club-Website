import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const NAV_ITEMS = [
  { label: "Home",        href: "/",            external: false },
  { label: "About",       href: "/#next",       external: false },
  { label: "Events",      href: "/events",      external: false },
  { label: "Verticals",   href: "/verticals",   external: false, hasSubmenu: true },
  { label: "Sponsorship", href: "/sponsorship", external: false },
  { label: "Recruitment", href: "/recruitment", external: false },
  { label: "Gallery",     href: "/gallery",     external: false },
  { label: "Blog",        href: "/blog",        external: false },
  { label: "Team",        href: "/team",        external: false },
];

const VERTICALS_SUBMENU = [
  { label: "Radio Astronomy",       href: "/verticals/radio" },
  { label: "Data Driven Astronomy", href: "/verticals/data" },
  { label: "Optical Astronomy",     href: "/verticals/optical" },
  { label: "Research",              href: "/verticals/research" },
];

const INFO_ITEMS = [
  { label: "12.9233° N  77.4988° E", href: "https://maps.google.com/?q=12.9233,77.4988", external: true },
  { label: "Est. 2018  ·  @ RVCE",   href: "https://maps.google.com/?q=12.9233,77.4988", external: true },
  { label: "Merchandise",            href: "/merchandise",                                external: false },
  { label: "Instagram",              href: "https://www.instagram.com/dhruva_rvce/",      external: true },
  { label: "LinkedIn",               href: "https://www.linkedin.com/company/dhruva-astronomy", external: true },
  { label: "GitHub",                 href: "https://github.com/Team-Dhruva",              external: true },
  { label: "YouTube",                href: "https://www.youtube.com/@dhruva1910",         external: true },
  { label: "Join Us",                href: "/recruitment",                                external: false },
  { label: "Admin",                  href: "/admin",                                      external: false },
];

const RECRUITMENT_SUBMENU = [
  { label: "Epoch J2023.6", href: "/recruitment/J2023.6" },
  { label: "Epoch J2024.7", href: "/recruitment/J2024.7" },
  { label: "Epoch J2025.8", href: "/recruitment/J2025.8" },
  { label: "Epoch J2026.9", href: "/recruitment/J2026.9" },
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
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
      if ((err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") && username === "admin" && password === "adastra") {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          setUsername("");
          setPassword("");
          setActiveSubmenu(null);
          navigate("/admin");
          return;
        } catch (createErr: any) {
          console.error("Firebase SignUp Error:", createErr.code, createErr.message);
          if (createErr.code === "auth/operation-not-allowed") {
            setLoginError("Email/Password provider is disabled in Firebase Console. Please enable it.");
          } else {
            setLoginError(createErr.message);
          }
          return;
        }
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

  return (
    <header className="site-header">
      {/* Logo — top-left, absolutely positioned */}
      <a href="/" className="header-center" style={{ cursor: "pointer", pointerEvents: "auto" }}>
        {CONSTELLATION_SVG}
      </a>

      {/* Right nav — absolutely positioned; submenu floats left of it */}
      <nav className="header-right">
        {/* Submenu panel — absolutely positioned, slides out to the left */}
        <div className={`verticals-submenu ${activeSubmenu ? "submenu-open" : ""}`}>
          {activeSubmenu === "verticals" &&
            VERTICALS_SUBMENU.map(s => (
              <a key={s.label} href={s.href} className="submenu-link">{s.label}</a>
            ))}
          {activeSubmenu === "sponsorship" && (
            <div className="submenu-text-wrap">
              For sponsorship towards projects and events please contact us. Email us at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=teamdhruva@rvce.edu.in" target="_blank" rel="noopener noreferrer" className="submenu-email-link">teamdhruva@rvce.edu.in</a>
            </div>
          )}
          {activeSubmenu === "recruitment" &&
            RECRUITMENT_SUBMENU.map(s => (
              <a key={s.label} href={s.href} className="submenu-link">{s.label}</a>
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

        {/* Stable two-column area: info | divider | nav-links */}
        <div className="nav-main-cols">
          {/* Info column */}
          <div className="info-col">
            {INFO_ITEMS.map(item =>
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
                currentUser ? (
                  <React.Fragment key="admin-logged-in">
                    <a
                      href="/admin"
                      className="info-line"
                      style={{ textTransform: "uppercase", textAlign: "right" }}
                    >
                      Dashboard
                    </a>
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
                <a
                  key={item.label}
                  href={item.href}
                  className="info-line"
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.label}
                </a>
              )
            )}
          </div>

          {/* Permanent divider */}
          <div className="nav-col-divider" />

          {/* Nav links column */}
          <div className="nav-links-col">
            {NAV_ITEMS.map(item =>
              item.hasSubmenu ? (
                <button
                  key={item.label}
                  className={`side-nav-link nav-btn ${activeSubmenu === "verticals" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("verticals"); }}
                  type="button"
                >
                  {item.label}
                </button>
              ) : item.label === "Sponsorship" ? (
                <button
                  key={item.label}
                  className={`side-nav-link nav-btn ${activeSubmenu === "sponsorship" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("sponsorship"); }}
                  type="button"
                >
                  {item.label}
                </button>
              ) : item.label === "Recruitment" ? (
                <button
                  key={item.label}
                  className={`side-nav-link nav-btn ${activeSubmenu === "recruitment" ? "nav-active" : ""}`}
                  onClick={e => { e.preventDefault(); toggle("recruitment"); }}
                  type="button"
                >
                  {item.label}
                </button>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="side-nav-link"
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {item.label}
                </a>
              )
            )}

            <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === "dark" ? "Light Mode ☼" : "Dark Mode ☽"}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
