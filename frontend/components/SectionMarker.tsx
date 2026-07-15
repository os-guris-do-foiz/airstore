import React from "react";

interface SectionMarkerProps {
  title: string;
  count?: React.ReactNode;
}

const SectionMarker: React.FC<SectionMarkerProps> = ({ title, count }) => (
  <div className="flex items-center justify-between border-b border-brand-border pb-4">
    <h2 className="flex items-center gap-3 text-2xl font-black text-white uppercase tracking-tight font-display">
      <span
        className="w-2 h-8 bg-brand-primary shrink-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 60% 100%, 0 100%)" }}
      />
      {title}
    </h2>
    {count !== undefined && (
      <div className="text-gray-500 text-xs font-bold uppercase tracking-widest font-mono">
        {count}
      </div>
    )}
  </div>
);

export default SectionMarker;
