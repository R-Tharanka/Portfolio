export type MediaFit = 'contain' | 'cover';

// Utility to keep media fit class names consistent across components
export const mediaFitClass = (fit: MediaFit = 'contain'): string => {
  return fit === 'cover'
    ? 'w-full h-full object-cover'
    : 'w-full h-full object-contain object-center';
};
