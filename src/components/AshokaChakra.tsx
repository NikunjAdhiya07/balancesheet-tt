export default function AshokaChakra({ className }: { className?: string }) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    return (
      <line
        key={i}
        x1="100"
        y1="100"
        x2="100"
        y2="14"
        stroke="#0f2a52"
        strokeWidth="2.5"
        transform={`rotate(${angle} 100 100)`}
      />
    );
  });

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="94" fill="none" stroke="#0f2a52" strokeWidth="3" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="#0f2a52" strokeWidth="1.5" />
      {spokes}
      <circle cx="100" cy="100" r="9" fill="#0f2a52" />
    </svg>
  );
}
