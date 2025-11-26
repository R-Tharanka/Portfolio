import { ProjectMedia } from '../types';

export type MediaFit = 'contain' | 'cover';

interface MediaFitOptions {
  includeDimensions?: boolean;
}

// Utility to keep media fit class names consistent across components
export const mediaFitClass = (fit: MediaFit = 'contain', options?: MediaFitOptions): string => {
  const baseClass = fit === 'cover'
    ? 'object-cover object-center'
    : 'object-contain object-center';

  if (options?.includeDimensions === false) {
    return baseClass;
  }

  return `w-full h-full ${baseClass}`;
};

export const mediaFitForItem = (item?: ProjectMedia | null): MediaFit => {
  if (!item) {
    return 'contain';
  }

  if (item.type === 'video') {
    return 'contain';
  }

  if (item.displayVariant === 'desktop') {
    return 'cover';
  }

  if (item.displayVariant === 'mobile') {
    return 'contain';
  }

  return 'contain';
};

export const ensureDisplayVariant = <T extends ProjectMedia>(item: T): T => {
  if (item.type !== 'image' || item.displayVariant) {
    return item;
  }

  return { ...item, displayVariant: 'mobile' };
};

export const normalizeMediaItems = <T extends ProjectMedia>(items: T[] = []): T[] =>
  items.map((item) => ensureDisplayVariant(item));
