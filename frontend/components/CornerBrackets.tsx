import React from "react";

type Corner = "tl" | "tr" | "bl" | "br";

interface CornerBracketsProps {
  corners?: Corner[];
  color?: string;
  size?: number;
  thickness?: number;
  inset?: number;
}

const CornerBrackets: React.FC<CornerBracketsProps> = ({
  corners = ["tl", "tr", "bl", "br"],
  color = "var(--color-brand-primary)",
  size = 18,
  thickness = 2,
  inset = -1,
}) => {
  const base: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    borderColor: color,
    pointerEvents: "none",
    zIndex: 20,
  };

  const positions: Record<Corner, React.CSSProperties> = {
    tl: { top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness },
    tr: { top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness },
    bl: { bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness },
    br: { bottom: inset, right: inset, borderBottomWidth: thickness, borderRightWidth: thickness },
  };

  return (
    <>
      {corners.map((c) => (
        <span key={c} style={{ ...base, ...positions[c] }} />
      ))}
    </>
  );
};

export default CornerBrackets;
