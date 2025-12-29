export default function Home() {
  return (
    <main style={{ background: "#0f0f0f", color: "#f2f2f2", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>

      {/* HERO */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 24px 72px" }}>
        <h1 style={{ fontSize: 56, lineHeight: 1.05, marginBottom: 24 }}>
          Custom-painted rugs.
          <br />
          <span style={{ color: "#999" }}>No fluff. No filters.</span>
        </h1>

        <p style={{ fontSize: 20, maxWidth: 720, lineHeight: 1.6, marginBottom: 40 }}>
          You send the image. We cut the stencil and paint it onto a real rug.
          Not printed. Not woven. Painted by hand.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="/upload" style={btnPrimary}>UPLOAD IMAGE · FROM $99</a>
          <a href="/custom" style={btnSecondary}>CUSTOM / SURPRISE ME</a>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section style={section}>
        <h2 style={h2}>What Rugly Is</h2>
        <p style={p}>
          Rugly turns your images into <strong>painted rugs</strong>.
          Every rug starts blank. Your design is reduced to a stencil and
          painted directly onto a low-pile rug.
        </p>
        <p style={p}>
          One color is standard. Two-color overlays cost more.
          Complex designs go through custom quoting.
        </p>
      </section>

      {/* ORDER PATHS */}
      <section style={sectionAlt}>
        <h2 style={h2}>Two Ways to Order</h2>

        <div style={grid}>
          <div style={card}>
            <h3>UPLOAD & ORDER</h3>
            <p>
              For bold, graphic designs where you know what you want.
            </p>
            <ul>
              <li>Upload your image</li>
              <li>Select size & base color</li>
              <li>1-color stencil included</li>
              <li>Optional 2-color overlay</li>
              <li>Preview before paying</li>
            </ul>
            <strong>Starting at $99</strong>
            <br />
            <a href="/upload" style={btnPrimarySmall}>UPLOAD IMAGE</a>
          </div>

          <div style={card}>
            <h3>CUSTOM / SURPRISE ME</h3>
            <p>
              You want taste, interpretation, and creative decisions made for you.
            </p>
            <ul>
              <li>Upload inspiration or nothing at all</li>
              <li>Room photo recommended</li>
              <li>We design it</li>
              <li>You approve the quote</li>
              <li>We build it</li>
            </ul>
            <strong>Quoted per project</strong>
            <br />
            <a href="/custom" style={btnSecondarySmall}>REQUEST CUSTOM RUG</a>
          </div>
        </div>
      </section>

      {/* EXPECTATIONS */}
      <section style={section}>
        <h2 style={h2}>Read This Before Ordering</h2>
        <ul>
          <li>Rugs are painted, not printed</li>
          <li>Bold designs work best</li>
          <li>High contrast = clean edges</li>
          <li>Thin lines & gradients may be simplified</li>
          <li>Dark base colors require more labor (upcharge)</li>
        </ul>
        <p style={p}>
          The preview is accurate — but this is still hand work.
          Each rug has character. That’s the point.
        </p>
      </section>

      {/* BASE PRODUCT */}
      <section style={sectionAlt}>
        <h2 style={h2}>Base Rug Details</h2>
        <ul>
          <li>Low-pile / flat weave</li>
          <li>Matte finish</li>
          <li>Washable</li>
          <li>Non-slip backing</li>
        </ul>

        <p style={p}>
          Sizes:
          <br />
          4×6 · 5×8 · 6×9 rectangles<br />
          5′ round
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #222", padding: "48px 24px", textAlign: "center", color: "#777" }}>
        © {new Date().getFullYear()} RUGLY · Painted rugs, built different.
      </footer>
    </main>
  );
}

/* styles */
const section = { maxWidth: 1200, margin: "0 auto", padding: "72px 24px" };
const sectionAlt = { ...section, background: "#151515" };
const h2 = { fontSize: 32, marginBottom: 24 };
const p = { fontSize: 18, lineHeight: 1.6, maxWidth: 800 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 };
const card = { border: "1px solid #222", padding: 24 };
const btnPrimary = { background: "#f2f2f2", color: "#0f0f0f", padding: "14px 20px", fontWeight: 700, textDecoration: "none" };
const btnSecondary = { border: "1px solid #f2f2f2", color: "#f2f2f2", padding: "14px 20px", textDecoration: "none" };
const btnPrimarySmall = { ...btnPrimary, display: "inline-block", marginTop: 16 };
const btnSecondarySmall = { ...btnSecondary, display: "inline-block", marginTop: 16 };
