/**
 * 💎 Hermes Design System 0.0.7
 * Centralização de tokens de design para consistência soberana.
 */

export const DESIGN_TOKENS = {
  colors: {
    background: "#050505",
    primary: {
      base: "rgba(139, 92, 246, 1)", // violet-500
      glow: "rgba(139, 92, 246, 0.3)",
      border: "rgba(139, 92, 246, 0.1)",
      gradient: "from-violet-600 to-blue-700"
    },
    accent: {
      blue: "rgba(59, 130, 246, 1)",
      emerald: "rgba(16, 185, 129, 1)",
      orange: "rgba(249, 115, 22, 1)"
    },
    glass: {
      bg: "rgba(0, 0, 0, 0.4)",
      border: "rgba(255, 255, 255, 0.1)",
      blur: "backdrop-blur-xl"
    }
  },
  animations: {
    transitions: {
      smooth: { type: "spring", stiffness: 300, damping: 30 },
      flow: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    variants: {
      fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 }
      }
    }
  }
};
