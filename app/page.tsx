export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", background: "#0b0b0d", color: "#fff" }}>
      {/* Top bar */}
      <header style={{ position: "sticky", top: 0, background: "rgba(11,11,13,.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,.08)", zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "#7c3aed" }} />
            <strong style={{ letterSpacing: 0.4 }}>Rugly Floor</strong>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="#services" style={{ color: "rgba(255,255,255,.85)", textDecoration: "none", fontSize: 14 }}>Services</a>
            <a href="#process" style={{ color: "rgba(255,255,255,.85)", textDecoration: "none", fontSize: 14 }}>Process</a>
            <a href="#contact" style={{ color: "rgba(255,255,255,.85)", textDecoration: "none", fontSize: 14 }}>Contact</a>
            <a
              href="#contact"
              style={{
                marginLeft: 6,
                background: "#7c3aed",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                boxShadow: "0 10px 30px rgba(124,58,237,.35)",
              }}
            >
              Get a Quote
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "70px 20px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 26, alignItems: "start" }}>
          <div>
            <p style={{ margin: 0, color: "rgba(255,255,255,.7)", fontSize: 14, letterSpacing: 0.6 }}>
              Residential + Commercial • Clean installs • No shortcuts
            </p>
            <h1 style={{ fontSize: 54, lineHeight: 1.05, margin: "14px 0 14px" }}>
              Floors that look expensive.
              <br />
              <span style={{ color: "rgba(255,255,255,.75)" }}>Built like they should.</span>
            </h1>
            <p style={{ margin: "0 0 22px", fontSize: 18, lineHeight: 1.6, color: "rgba(255,255,255,.82)", maxWidth: 720 }}>
              Rugly Floor delivers professional flooring installation and refinishing that holds up. We show up, prep correctly,
              install clean, and finish on schedule. It’s not magic — it’s standards.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="#contact"
                style={{
                  background: "#ffffff",
                  color: "#0b0b0d",
                  padding: "12px 16px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Request a Quote
              </a>
              <a
                href="#services"
                style={{
                  border: "1px solid rgba(255,255,255,.18)",
                  color: "#fff",
                  padding: "12px 16px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                See Services
              </a>
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap", color: "rgba(255,255,255,.7)", fontSize: 14 }}>
              <span style={{ border: "1px solid rgba(255,255,255,.12)", padding: "8px 10px", borderRadius: 999 }}>Hardwood</span>
              <span style={{ border: "1px solid rgba(255,255,255,.12)", padding: "8px 10px", borderRadius: 999 }}>LVP</span>
              <span style={{ border: "1px solid rgba(255,255,255,.12)", padding: "8px 10px", borderRadius: 999 }}>Laminate</span>
              <span style={{ border: "1px solid rgba(255,255,255,.12)", padding: "8px 10px", borderRadius: 999 }}>Subfloor Prep</span>
              <span style={{ border: "1px solid rgba(255,255,255,.12)", padding: "8px 10px", borderRadius: 999 }}>Removal</span>
            </div>
          </div>

          {/* Side card */}
          <div style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 18, background: "rgba(255,255,255,.03)" }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Quick facts</h3>
            <div style={{ marginTop: 12, display: "grid", gap: 10, color: "rgba(255,255,255,.82)", fontSize: 14, lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: "#fff" }}>What you get:</strong> clean install, honest timeline, no drama.
              </div>
              <div>
                <strong style={{ color: "#fff" }}>Good fit for:</strong> homeowners, landlords, small commercial spaces.
              </div>
              <div>
                <strong style={{ color: "#fff" }}>How we quote:</strong> info + photos first, then measure if needed.
              </div>
            </div>

            <div style={{ marginTop: 16, borderTop: "1px solid rgba(255,255,255,.10)", paddingTop: 14 }}>
              <p style={{ margin: "0 0 10px", color: "rgba(255,255,255,.7)", fontSize: 13 }}>Fastest way to reach us:</p>
              <a
                href="mailto:info@ruglyfloor.com?subject=Quote%20Request%20-%20Rugly%20Floor"
                style={{
                  display: "inline-block",
                  width: "100%",
                  textAlign: "center",
                  background: "#7c3aed",
                  color: "#fff",
                  padding: "12px 14px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Email for a Quote
              </a>
              <p style={{ margin: "10px 0 0", color: "rgba(255,255,255,.6)", fontSize: 12 }}>
                info@ruglyfloor.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 20px 10px" }}>
        <h2 style={{ fontSize: 28, margin: "0 0 14px" }}>Services</h2>
        <p style={{ margin: "0 0 18px", color: "rgba(255,255,255,.78)", lineHeight: 1.6, maxWidth: 820 }}>
          Pick the lane, we’ll handle the details. Prep, install, cleanup — the whole job.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            ["Hardwood Installation", "Solid installs, tight cuts, clean transitions."],
            ["Luxury Vinyl Plank (LVP)", "Durable, waterproof-friendly, done right."],
            ["Laminate Flooring", "Budget smart without looking cheap."],
            ["Floor Removal", "Demo + haul-off, no mess left behind."],
            ["Subfloor Prep", "Leveling, repairs, squeak control."],
            ["Residential & Commercial", "Homes, rentals, offices, retail."],
          ].map(([title, desc]) => (
            <div key={title} style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 16, background: "rgba(255,255,255,.03)" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
              <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.75)", lineHeight: 1.55, fontSize: 14 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="process" style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 20px" }}>
        <h2 style={{ fontSize: 28, margin: "0 0 14px" }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            ["1) Tell us what you need", "Send photos + rough square footage + timeline."],
            ["2) Measure + quote", "We confirm scope and price it correctly."],
            ["3) Install + finish", "Prep, install, clean up. Then you enjoy it."],
          ].map(([title, desc]) => (
            <div key={title} style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
              <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.75)", lineHeight: 1.55, fontSize: 14 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 20px 70px" }}>
        <div style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 22, padding: 18, background: "rgba(124,58,237,.08)" }}>
          <h2 style={{ fontSize: 28, margin: "0 0 10px" }}>Get a quote</h2>
          <p style={{ margin: "0 0 16px", color: "rgba(255,255,255,.82)", lineHeight: 1.6, maxWidth: 900 }}>
            Email us with: your address (or neighborhood), what type of flooring, approximate sqft, and a couple photos.
            We’ll respond with next steps.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="mailto:info@ruglyfloor.com?subject=Quote%20Request%20-%20Rugly%20Floor&body=Name%3A%0APhone%3A%0ALocation%3A%0AFlooring%20type%3A%0AApprox%20sqft%3A%0ATimeline%3A%0APhotos%20link%20(optional)%3A%0A"
              style={{
                background: "#7c3aed",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Email info@ruglyfloor.com
            </a>
            <a
              href="#services"
              style={{
                border: "1px solid rgba(255,255,255,.25)",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Review services
            </a>
          </div>

          <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,.65)", fontSize: 13 }}>
            Want a phone number on the site? Tell me the number and I’ll wire it in.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.10)", padding: "22px 20px", color: "rgba(255,255,255,.6)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>© {new Date().getFullYear()} Rugly Floor</span>
          <span>
            <a href="mailto:info@ruglyfloor.com" style={{ color: "rgba(255,255,255,.75)", textDecoration: "none" }}>
              info@ruglyfloor.com
            </a>
          </span>
        </div>
      </footer>
    </main>
  );
}
