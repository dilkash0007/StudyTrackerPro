import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

export const NeuralNetIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="7" r="2" className="fill-cyan-400" />
    <circle cx="4" cy="17" r="2" className="fill-green-400" />
    <circle cx="12" cy="12" r="2" className="fill-teal-400" />
    <circle cx="20" cy="7" r="2" className="fill-emerald-400" />
    <circle cx="20" cy="17" r="2" className="fill-cyan-400" />

    <path
      d="M4 7L12 12M4 17L12 12M20 7L12 12M20 17L12 12"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.6"
      className="stroke-cyan-300"
    />
  </svg>
);

// Decorative neural dots for card corners and backgrounds
export function NeuralDots({
  className,
  count = 5,
}: {
  className?: string;
  count?: number;
}) {
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

  return (
    <div className={cn("relative", className)}>
      {Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 4 + 2; // Size between 2-6px
        const top = Math.random() * 100;
        const left = Math.random() * 100;

        return (
          <div
            key={i}
            className={cn(
              "absolute rounded-full",
              isRedTheme ? "bg-rose-400" : "bg-teal-400"
            )}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        );
      })}
    </div>
  );
}

// Card with neural network design elements
export function NeuralCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl backdrop-blur-sm border p-6 shadow-md",
        isRedTheme
          ? "bg-gray-900/50 border-rose-500/30"
          : "bg-gray-900/50 border-teal-500/30",
        className
      )}
      {...props}
    >
      <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
      <NeuralDots
        className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
        count={3}
      />
      {children}
    </div>
  );
}

// Green glowing dot animation
export function PulsingDot({
  className,
  size = "small",
}: {
  className?: string;
  size?: "small" | "medium" | "large";
}) {
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

  const sizeClasses = {
    small: "w-2 h-2",
    medium: "w-3 h-3",
    large: "w-4 h-4",
  };

  return (
    <span
      className={cn(
        "relative flex rounded-full",
        sizeClasses[size],
        isRedTheme ? "bg-rose-400" : "bg-teal-400",
        className
      )}
    >
      <span
        className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          isRedTheme ? "bg-rose-400" : "bg-teal-400"
        )}
      ></span>
    </span>
  );
}

// Neural network themed separator
export const NeuralSeparator: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div className={`flex items-center py-2 ${className}`}>
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
      <NeuralNetIcon className="w-4 h-4 mx-3 text-teal-400" />
      <div className="flex-grow h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"></div>
    </div>
  );
};

// Neural network card header with icon
export function NeuralCardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

  return (
    <div
      className={cn(
        "mb-4 pb-4",
        isRedTheme
          ? "border-b border-rose-500/20"
          : "border-b border-teal-500/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Neural background decoration
export function NeuralBackgroundDecoration({
  className,
}: {
  className?: string;
}) {
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

  const [dots, setDots] = useState<
    Array<{ x: number; y: number; size: number; opacity: number }>
  >([]);

  useEffect(() => {
    const newDots = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.2 + 0.05,
    }));
    setDots(newDots);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none z-0",
        className
      )}
    >
      {dots.map((dot, i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-full",
            isRedTheme ? "bg-rose-400" : "bg-teal-400"
          )}
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            top: `${dot.y}%`,
            left: `${dot.x}%`,
            opacity: dot.opacity,
          }}
        />
      ))}
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0 pointer-events-none"
      >
        {dots.map((dot, i) => {
          // Connect some dots with lines
          if (i % 3 === 0 && i < dots.length - 1) {
            const nextDot = dots[i + 1];
            return (
              <line
                key={i}
                x1={`${dot.x}%`}
                y1={`${dot.y}%`}
                x2={`${nextDot.x}%`}
                y2={`${nextDot.y}%`}
                stroke={isRedTheme ? "#fb7185" : "#2dd4bf"}
                strokeWidth="0.5"
                opacity="0.1"
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}
