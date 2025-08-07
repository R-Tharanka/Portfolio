import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ProjectMedia } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  X, 
  Maximize, 
  Minimize, 
  Images
} from 'lucide-react';
import { getTransformedImageUrl, isCloudinaryUrl } from '../../utils/cloudinary';

interface MediaViewerPopupProps {
  mediaItems: ProjectMedia[];
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  autoplay?: boolean;
  interval?: number; // in milliseconds
}

const MediaViewerPopup: React.FC<MediaViewerPopupProps> = ({ 
  mediaItems, 
  isOpen,
  onClose,
  projectTitle,
  autoplay = true,
  interval = 4000 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter media items to only show those marked for popup display
  const popupMediaItems = mediaItems.filter(item => item.showInViewer !== false);

  // Find the displayFirst item and use its index among popup items
  useEffect(() => {
    if (popupMediaItems.length > 0) {
      const displayFirstIndex = popupMediaItems.findIndex(item => item.displayFirst);
      if (displayFirstIndex !== -1) {
        setCurrentIndex(displayFirstIndex);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [popupMediaItems]);

  // Handle autoplay
  useEffect(() => {
    // Clear any existing autoplay timer
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    // Only setup autoplay if there's more than one media item, autoplay is enabled, and popup is open
    if (popupMediaItems.length > 1 && isPlaying && isOpen) {
      autoplayTimerRef.current = setTimeout(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % popupMediaItems.length);
      }, interval);
    }

    // Cleanup timer on unmount
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [currentIndex, popupMediaItems, isPlaying, interval, isOpen]);

  // Handle video element when type changes or current index changes
  useEffect(() => {
    const currentItem = popupMediaItems[currentIndex];
    if (currentItem?.type === 'video' && videoRef.current) {
      // Reset video to beginning
      videoRef.current.currentTime = 0;
      
      // Play the current video if autoplay is enabled
      if (isPlaying && isOpen) {
        videoRef.current.play().catch(err => {
          console.error('Video play error:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying, popupMediaItems, isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard events when input elements are focused
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Get the current item inside this handler to avoid dependency issues
      const current = popupMediaItems[currentIndex];
      
      switch (event.key) {
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigatePrev();
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateNext();
          break;
        case ' ':
          event.preventDefault();
          if (current?.type === 'video' && videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play().catch(err => console.error('Error playing video:', err));
            } else {
              videoRef.current.pause();
            }
          } else {
            togglePlayPause();
          }
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          isFullscreen ? exitFullscreen() : enterFullscreen();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, onClose, popupMediaItems, currentIndex]);

  // Fullscreen functionality
  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Don't render if not open or no media items to show
  if (!isOpen || popupMediaItems.length === 0) {
    return null;
  }

  const currentItem = popupMediaItems[currentIndex];

  const navigatePrev = () => {
    setCurrentIndex(prevIndex => {
      if (prevIndex === 0) return popupMediaItems.length - 1;
      return prevIndex - 1;
    });
  };

  const navigateNext = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % popupMediaItems.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Prevent download by disabling right-click and drag
  const preventDownload = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  const popup = (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={containerRef}
        className={`${isFullscreen 
          ? 'fixed inset-0 bg-black' 
          : 'relative bg-black/90 w-11/12 max-w-4xl h-auto max-h-[85vh] rounded-lg shadow-2xl'
        } overflow-hidden`}
      >
        {/* Header */}
        <div className={`absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent ${
          isFullscreen ? 'opacity-0 hover:opacity-100 transition-opacity' : ''
        }`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Images size={20} />
              <h3 className="text-lg font-semibold">{projectTitle}</h3>
              <span className="text-sm text-white/70">
                {currentIndex + 1} of {popupMediaItems.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Fullscreen toggle */}
              <button
                onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                className="p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all focus:outline-none"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all focus:outline-none"
                aria-label="Close viewer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="relative w-full h-full flex items-center justify-center p-4 pt-20 pb-20">
          {/* Current media item */}
          <div className="relative max-w-7xl max-h-full flex items-center justify-center">
            {currentItem?.type === 'image' ? (
              <img 
                src={isCloudinaryUrl(currentItem.url) 
                  ? getTransformedImageUrl(currentItem.url, { 
                      width: isFullscreen ? 1920 : 1200, 
                      height: isFullscreen ? 1080 : 800, 
                      quality: 'auto' 
                    }) 
                  : currentItem.url
                }
                alt={`${projectTitle} - Media ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onContextMenu={preventDownload}
                onDragStart={preventDownload}
                style={{ userSelect: 'none' }}
              />
            ) : currentItem?.type === 'video' ? (
              <video 
                ref={videoRef}
                src={currentItem.url}
                controls={true}
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={preventDownload}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{ userSelect: 'none' }}
              />
            ) : null}
          </div>

          {/* Navigation arrows (only show if multiple items) */}
          {popupMediaItems.length > 1 && (
            <>
              <button 
                onClick={() => navigatePrev()}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all focus:outline-none shadow-lg hover:scale-110 z-40"
                aria-label="Previous media"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => navigateNext()}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all focus:outline-none shadow-lg hover:scale-110 z-40"
                aria-label="Next media"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Bottom controls */}
        <div className={`absolute bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/80 to-transparent ${
          isFullscreen ? 'opacity-0 hover:opacity-100 transition-opacity' : ''
        }`}>
          <div className="flex items-center justify-between">
            {/* Media indicator dots */}
            <div className="flex gap-2">
              {popupMediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log(`Setting index to ${index}`);
                    setCurrentIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all focus:outline-none hover:scale-125 ${
                    index === currentIndex 
                      ? 'bg-primary shadow-lg scale-110' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to media ${index + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause button (only show if multiple items) */}
            {popupMediaItems.length > 1 && (
              <button 
                onClick={togglePlayPause}
                className="p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all focus:outline-none shadow-lg hover:scale-110"
                aria-label={isPlaying ? "Pause slideshow" : "Start slideshow"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(popup, document.body);
};

export default MediaViewerPopup;
