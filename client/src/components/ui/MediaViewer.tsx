import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Images
} from 'lucide-react';
import { ProjectMedia } from '../../types';
import { getTransformedImageUrl, isCloudinaryUrl } from '../../utils/cloudinary';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: ProjectMedia[];
  projectTitle: string;
  initialIndex?: number;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  isOpen,
  onClose,
  mediaItems,
  projectTitle,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter media items to only show those marked for viewer
  console.log('MediaViewer received items:', mediaItems);
  console.log('MediaItems showInViewer values:', mediaItems.map(item => ({ 
    url: item.url.substring(0, 30) + '...', 
    showInViewer: item.showInViewer 
  })));
  
  const viewerMediaItems = mediaItems.filter(item => {
    const shouldShow = item.showInViewer !== false;
    console.log(`Item ${item.url.substring(0, 30)}... showInViewer=${item.showInViewer}, shouldShow=${shouldShow}`);
    return shouldShow;
  });

  // We need to track whether this is the initial render or a subsequent update
  const isInitialRender = useRef(true);

  // Reset index only on the initial render or when viewerMediaItems changes significantly
  useEffect(() => {
    // Only set the index if:
    // 1. It's the first render, OR
    // 2. The number of media items has changed (which means the content has truly changed)
    if (isInitialRender.current || prevMediaItemsLength.current !== viewerMediaItems.length) {
      console.log("Initial render or media items count changed, resetting index");
      setCurrentIndex(Math.min(initialIndex, viewerMediaItems.length - 1));
      isInitialRender.current = false;
    }
    
    // Update our reference of the previous length
    prevMediaItemsLength.current = viewerMediaItems.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [viewerMediaItems, initialIndex]);
  
  // Keep track of previous media items length to detect real changes
  const prevMediaItemsLength = useRef(viewerMediaItems.length);

  // Define navigation functions as useCallback hooks to ensure stability between renders
  const navigatePrev = React.useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    console.log("MediaViewer: Navigating to previous");
    setCurrentIndex(prev => {
      const newIndex = prev === 0 ? viewerMediaItems.length - 1 : prev - 1;
      console.log(`MediaViewer: Going from ${prev} to ${newIndex}`);
      return newIndex;
    });
  }, [viewerMediaItems.length]);

  const navigateNext = React.useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    console.log("MediaViewer: Navigating to next");
    setCurrentIndex(prev => {
      const newIndex = (prev + 1) % viewerMediaItems.length;
      console.log(`MediaViewer: Going from ${prev} to ${newIndex}`);
      return newIndex;
    });
  }, [viewerMediaItems.length]);
  
  const goToIndex = React.useCallback((index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    console.log(`MediaViewer: Going directly to index: ${index}`);
    setCurrentIndex(index);
  }, []);

  const togglePlayPause = React.useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = React.useCallback(() => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const toggleFullscreen = React.useCallback(async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent event bubbling
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events when input elements are focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigatePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateNext();
          break;
        case ' ':
          e.preventDefault();
          if (currentItem?.type === 'video') {
            togglePlayPause();
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          if (currentItem?.type === 'video') {
            toggleMute();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, isFullscreen, navigatePrev, navigateNext, togglePlayPause, toggleMute, toggleFullscreen, onClose, viewerMediaItems]);

  // Handle fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Disable scroll on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || viewerMediaItems.length === 0) return null;

  const currentItem = viewerMediaItems[currentIndex];

  const handleVideoLoadedData = () => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-lg shadow-2xl ${
          isFullscreen 
            ? 'fixed inset-0 rounded-none' 
            : 'w-10/12 max-w-3xl h-auto max-h-[80vh] mx-auto'
        }`}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images size={20} className="text-white/80" />
              <h2 className="text-white text-lg font-semibold truncate">
                {projectTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-red-400 transition-colors"
              aria-label="Close media viewer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative w-full h-full flex items-center justify-center p-8 pt-16 pb-16">
          {/* Current Media */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Use a key based on currentIndex to force unmount/remount when media changes */}
            <div 
              key={`viewer-media-${currentIndex}`}
              className="w-full h-full flex items-center justify-center transition-opacity duration-300"
            >
              {currentItem?.type === 'image' ? (
                <img
                  src={isCloudinaryUrl(currentItem.url) 
                    ? getTransformedImageUrl(currentItem.url, { 
                        width: isFullscreen ? 1920 : 1000, 
                        height: isFullscreen ? 1080 : 700, 
                        quality: 'auto' 
                      })
                    : currentItem.url
                  }
                  alt={`${projectTitle} media ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{ maxHeight: isFullscreen ? 'calc(100vh - 8rem)' : 'calc(70vh - 8rem)' }}
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click download
                  draggable={false} // Disable drag download
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentItem.url}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  style={{ maxHeight: isFullscreen ? 'calc(100vh - 8rem)' : 'calc(70vh - 8rem)' }}
                  onLoadedData={handleVideoLoadedData}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click download
                  controls
                  playsInline
                  controlsList="nodownload" // Disable download option in controls
                />
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          {viewerMediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Previous button clicked');
                  navigatePrev(e);
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all z-[9999] cursor-pointer"
                aria-label="Previous media"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Next button clicked');
                  navigateNext(e);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all z-[9999] cursor-pointer"
                aria-label="Next media"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* Media Counter */}
            <div className="text-white text-sm flex items-center gap-2">
              <span>{currentIndex + 1} of {viewerMediaItems.length}</span>
              
              {/* Keyboard shortcuts help button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowKeyboardShortcuts(prev => !prev);
                }}
                className="ml-1 p-1 text-white/60 hover:text-white/90 rounded-full transition-colors flex items-center text-xs"
                aria-label="Show keyboard shortcuts"
                title="Keyboard Shortcuts"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
                  <path d="M6 8h.01"></path>
                  <path d="M10 8h.01"></path>
                  <path d="M14 8h.01"></path>
                  <path d="M18 8h.01"></path>
                  <path d="M8 12h.01"></path>
                  <path d="M12 12h.01"></path>
                  <path d="M16 12h.01"></path>
                  <path d="M7 16h10"></path>
                </svg>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              
              {/* Video-specific controls */}
              {currentItem?.type === 'video' && !videoRef.current?.controls && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal close
                      togglePlayPause();
                    }}
                    className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal close
                      toggleMute();
                    }}
                    className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </>
              )}
            </div>

            {/* Dots Indicator */}
            {viewerMediaItems.length > 1 && (
              <div className="flex items-center gap-2">
                {viewerMediaItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation(); // Prevent modal close
                      console.log('Indicator dot clicked, navigating to index:', index);
                      goToIndex(index, e);
                    }}
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to media ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Keyboard shortcuts help - shown conditionally */}
        <KeyboardShortcutsHelp isVisible={showKeyboardShortcuts} />
      </div>
    </div>,
    document.body
  );
};

export default MediaViewer;
