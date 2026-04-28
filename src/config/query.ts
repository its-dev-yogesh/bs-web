export const queryConfig = {
  staleTime: {
    short: 30 * 1000,
    default: 60 * 1000,
    long: 5 * 60 * 1000,
  },
  gcTime: {
    default: 5 * 60 * 1000,
    long: 30 * 60 * 1000,
  },
} as const;
