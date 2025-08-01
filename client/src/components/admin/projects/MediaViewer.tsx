import React, { useState, useEffect, useRef } from 'react';
import { ProjectMedia } from '../../../types';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface MediaViewerProps {
  mediaItems: ProjectMedia[];
  autoplay?: boolean;
  interval?: number; // in milliseconds
}

const MediaViewer: React.FC<MediaViewerProps> = ({ 
  mediaItems, 
  autoplay = true,
  interval = 5000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Find the displayFirst item and use its index
  useEffect(() => {
    if (mediaItems && mediaItems.length > 0) {
      const displayFirstIndex = mediaItems.findIndex(item => item.displayFirst);
      if (displayFirstIndex !== -1) {
        setCurrentIndex(displayFirstIndex);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [mediaItems]);

  // Handle autoplay
  useEffect(() => {
    // Clear any existing autoplay timer
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    // Only setup autoplay if there's more than one media item and autoplay is enabled
    if (mediaItems.length > 1 && isPlaying) {
      autoplayTimerRef.current = setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % mediaItems.length);
      }, interval);
    }

    // Cleanup timer on unmount
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [currentIndex, mediaItems, isPlaying, interval]);

  // Handle video element when type changes or current index changes
  useEffect(() => {
    const currentItem = mediaItems[currentIndex];
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
  }, [currentIndex, isPlaying, mediaItems]);

  // Don't render if no media items
  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  const currentItem = mediaItems[currentIndex];

  const navigatePrev = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex === 0) return mediaItems.length - 1;
      return prevIndex - 1;
    });
  };

  const navigateNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % mediaItems.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative w-full overflow-hidden group">
      {/* Current media item */}
      <div className="w-full relative">
        {currentItem?.type === 'image' ? (
          <img 
            src={currentItem.url} 
            alt="Project media" 
            className="w-full h-48 object-cover"
          />
        ) : currentItem?.type === 'video' ? (
          <video 
            ref={videoRef}
            src={currentItem.url} 
            controls={false}
            loop
            muted
            playsInline
            className="w-full h-48 object-cover"
          />
        ) : null}
      </div>

      {/* Only show navigation controls if there are multiple items */}
      {mediaItems.length > 1 && (
        <>
          {/* Navigation arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={navigatePrev}
              className="p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none"
              aria-label="Previous media"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={navigateNext}
              className="p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none"
              aria-label="Next media"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Play/Pause button */}
          <button 
            onClick={togglePlayPause}
            className="absolute bottom-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
            aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          
          {/* Indicator dots */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors focus:outline-none ${
                  index === currentIndex 
                    ? 'bg-primary' 
                    : 'bg-white/60 hover:bg-white/80'
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

export default MediaViewer;
