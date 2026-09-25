export const animations = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    standard: [0.2, 0, 0, 1] as const,
    decelerate: [0, 0, 0.2, 1] as const,
    accelerate: [0.4, 0, 1, 1] as const,
  },
};
