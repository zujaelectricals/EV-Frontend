import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Petal {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  duration: number;
  delay: number;
  color: string;
}

const petalColors = [
  "rgba(219, 39, 119, 0.3)", // pink
  "rgba(236, 72, 153, 0.3)", // rose
  "rgba(244, 114, 182, 0.3)", // light pink
  "rgba(232, 121, 249, 0.3)", // fuchsia
  "rgba(192, 132, 252, 0.3)", // purple
];

// Petal SVG path
const PetalSVG = ({ color, size }: { color: string; size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C12 2 8 6 8 10C8 12 10 14 12 14C14 14 16 12 16 10C16 6 12 2 12 2Z"
      fill={color}
      opacity={0.6}
    />
    <path
      d="M12 22C12 22 8 18 8 14C8 12 10 10 12 10C14 10 16 12 16 14C16 18 12 22 12 22Z"
      fill={color}
      opacity={0.6}
    />
    <path
      d="M2 12C2 12 6 8 10 8C12 8 14 10 14 12C14 14 12 16 10 16C6 16 2 12 2 12Z"
      fill={color}
      opacity={0.6}
    />
    <path
      d="M22 12C22 12 18 8 14 8C12 8 10 10 10 12C10 14 12 16 14 16C18 16 22 12 22 12Z"
      fill={color}
      opacity={0.6}
    />
  </svg>
);

export function FloatingPetals({ count = 15 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate random petals
    const newPetals: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Percentage of viewport width
      y: -10 - Math.random() * 20, // Start above viewport
      size: 20 + Math.random() * 30, // 20-50px
      rotation: Math.random() * 360,
      duration: 15 + Math.random() * 20, // 15-35 seconds
      delay: Math.random() * 5, // 0-5 seconds delay
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    }));
    setPetals(newPetals);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          initial={{
            x: `${petal.x}vw`,
            y: `${petal.y}vh`,
            rotate: petal.rotation,
            opacity: 0,
          }}
          animate={{
            y: [`${petal.y}vh`, "110vh"], // Fall from top to bottom
            x: [
              `${petal.x}vw`,
              `${petal.x + (Math.random() - 0.5) * 10}vw`,
            ], // Slight horizontal drift
            rotate: petal.rotation + 360 + (Math.random() - 0.5) * 180,
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            willChange: "transform",
          }}
        >
          <PetalSVG color={petal.color} size={petal.size} />
        </motion.div>
      ))}
    </div>
  );
}
