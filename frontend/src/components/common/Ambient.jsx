/** Quiet, static background tint behind the page (decorative). */
export default function Ambient() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="blob bg-brand-100" style={{ width: 520, height: 520, top: '-18%', left: '-10%' }} />
      <div className="blob bg-mint-50" style={{ width: 480, height: 480, bottom: '-20%', right: '-8%' }} />
    </div>
  );
}
