import React, { useState, useEffect, useRef } from 'react';
import { ProjectMedia } from '../../types';
import { mediaFitClass, mediaFitForItem } from '../../utils/mediaClasses';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from 'lucide-react';

interface MediaCarouselProps {
  mediaItems?: ProjectMedia[];
  fallbackImageUrl?: string;
  autoplay?: boolean;
  interval?: number; // in milliseconds
  className?: string;
  height?: string;
  onViewMedia?: (media: ProjectMedia) => void; // Callback to open media viewer popup
  showViewButton?: boolean; // Whether to show the view media button
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ 
  mediaItems = [], 
  fallbackImageUrl,
  autoplay = true,
  interval = 7000,
  className = '',
  height = 'h-52',
  onViewMedia,
  showViewButton = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Combine media items with fallback image if provided and no media items
  const allMediaItems = mediaItems.length > 0 
    ? mediaItems 
    : fallbackImageUrl
      ? [{ type: 'image' as const, url: fallbackImageUrl, isExternal: true, order: 0, displayFirst: true, showInViewer: true, displayVariant: 'desktop' } as ProjectMedia]
      : [];

  // Find the displayFirst item and use its index
  useEffect(() => {
    if (allMediaItems.length > 0) {
      const displayFirstIndex = allMediaItems.findIndex(item => item.displayFirst);
      if (displayFirstIndex !== -1) {
        setCurrentIndex(displayFirstIndex);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [allMediaItems]);

  // Handle autoplay
  useEffect(() => {
    // Clear any existing autoplay timer
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    // Only setup autoplay if there's more than one media item and autoplay is enabled
    if (allMediaItems.length > 1 && isPlaying) {
      autoplayTimerRef.current = setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % allMediaItems.length);
      }, interval);
    }

    // Cleanup timer on unmount
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [currentIndex, allMediaItems, isPlaying, interval]);

  // Handle video element when type changes or current index changes
  useEffect(() => {
    const currentItem = allMediaItems[currentIndex];
    if (currentItem?.type === 'video' && videoRef.current) {
      // Pause any previously playing video when switching items
      videoRef.current.pause();
      
      // Play the current video if autoplay is enabled
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err);
        });
      }
    }
  }, [currentIndex, isPlaying, allMediaItems]);

  // Don't render if no media items and no fallback image
  if (allMediaItems.length === 0) {
    return null;
  }

  const currentItem = allMediaItems[currentIndex];

  const navigatePrev = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex === 0) return allMediaItems.length - 1;
      return prevIndex - 1;
    });
  };

  const navigateNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % allMediaItems.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`relative w-full overflow-hidden group ${className}`}>
      {/* Current media item */}
      <div className={`w-full relative ${height} bg-background`}>
        {currentItem?.type === 'image' ? (
          <img 
            src={currentItem.url} 
            alt="Project media" 
            className={mediaFitClass(mediaFitForItem(currentItem))} 
            draggable={false}
          />
        ) : currentItem?.type === 'video' ? (
          <video 
            ref={videoRef}
            src={currentItem.url} 
            controls={false}
            muted
            playsInline
            className={mediaFitClass(mediaFitForItem(currentItem))}
            onEnded={() => {
              // Move to next item when video ends if autoplay is enabled
              if (isPlaying && allMediaItems.length > 1) {
                setCurrentIndex(prevIndex => (prevIndex + 1) % allMediaItems.length);
              }
            }}
          />
        ) : null}
        
        {/* Gradient overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
      </div>

      {/* Only show navigation controls if there are multiple items */}
      {allMediaItems.length > 1 && (
        <>
          {/* Navigation arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button 
              onClick={navigatePrev}
              className="p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all focus:outline-none shadow-lg hover:scale-110 pointer-events-auto"
              aria-label="Previous media"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={navigateNext}
              className="p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all focus:outline-none shadow-lg hover:scale-110 pointer-events-auto"
              aria-label="Next media"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Play/Pause button - positioned higher to avoid conflict with tag row */}
          <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={togglePlayPause}
              className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all focus:outline-none shadow-lg hover:scale-110 backdrop-blur-sm border border-white/20"
              aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>

          {/* View Media button */}
          {showViewButton && onViewMedia && (
            <div className="absolute top-2 right-16 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={() => {
                  if (currentItem && 'type' in currentItem && (currentItem.type === 'image' || currentItem.type === 'video')) {
                    onViewMedia(currentItem as ProjectMedia);
                  }
                }}
                className="p-2 bg-black/70 text-white rounded-full hover:bg-black/90 transition-all focus:outline-none shadow-lg hover:scale-110 backdrop-blur-sm border border-white/20"
                aria-label="View all media"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          )}
          
          {/* Indicator dots - positioned higher to avoid conflict */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
            {allMediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none hover:scale-125 border ${
                  index === currentIndex 
                    ? 'bg-primary border-white shadow-lg scale-110' 
                    : 'bg-white/60 hover:bg-white/80 border-white/30'
                }`}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MediaCarousel;
