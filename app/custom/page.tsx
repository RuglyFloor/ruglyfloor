export default function CustomPage() {
  return (
    <main style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1>Custom / Surprise Me</h1>

      <p>
        This is the premium path. We interpret, design, and build something
        specific to your space.
      </p>

      <form style={{ display: "grid", gap: 20 }}>
        <input placeholder="Name" required />
        <input placeholder="Email" required />
        <input placeholder="Phone (optional)" />

        <textarea placeholder="Describe the vibe / goal" rows={5} />

        <label>Upload inspiration (optional)</label>
        <input type="file" />

        <label>Upload room photo (recommended)</label>
        <input type="file" />

        <button style={{ padding: 16, fontWeight: 700 }}>
          SUBMIT FOR QUOTE
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 14 }}>
        We’ll review and send a quote. Production starts after payment.
      </p>
    </main>
  );
}
