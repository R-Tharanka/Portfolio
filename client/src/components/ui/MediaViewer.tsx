import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ProjectMedia } from '../../types';
import { getTransformedImageUrl, isCloudinaryUrl } from '../../utils/cloudinary';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter media items to only show those marked for viewer
  const viewerMediaItems = mediaItems.filter(item => item.showInViewer !== false);

  // Reset index when media items change
  useEffect(() => {
    setCurrentIndex(Math.min(initialIndex, viewerMediaItems.length - 1));
  }, [viewerMediaItems, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrev();
          break;
        case 'ArrowRight':
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
          if (currentItem?.type === 'video') {
            toggleFullscreen();
          }
          break;
        case 'm':
        case 'M':
          if (currentItem?.type === 'video') {
            toggleMute();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, viewerMediaItems]);

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

  const navigatePrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? viewerMediaItems.length - 1 : prev - 1
    );
  };

  const navigateNext = () => {
    setCurrentIndex(prev => 
      (prev + 1) % viewerMediaItems.length
    );
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleVideoLoadedData = () => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  };

  return createPortal(
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center ${
        isFullscreen ? 'bg-black' : 'bg-black/95'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold truncate">
            {projectTitle} - Media Viewer
          </h2>
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
      <div className="relative w-full h-full flex items-center justify-center p-16">
        {/* Current Media */}
        <div className="relative max-w-full max-h-full">
          {currentItem.type === 'image' ? (
            <img
              src={isCloudinaryUrl(currentItem.url) 
                ? getTransformedImageUrl(currentItem.url, { width: 1920, height: 1080, quality: 'auto' })
                : currentItem.url
              }
              alt={`${projectTitle} media ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 8rem)' }}
              onContextMenu={(e) => e.preventDefault()} // Disable right-click download
              draggable={false} // Disable drag download
            />
          ) : (
            <video
              ref={videoRef}
              src={currentItem.url}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(100vh - 8rem)' }}
              onLoadedData={handleVideoLoadedData}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onContextMenu={(e) => e.preventDefault()} // Disable right-click download
              loop
              playsInline
              controlsList="nodownload" // Disable download option in controls
            />
          )}
        </div>

        {/* Navigation Controls */}
        {viewerMediaItems.length > 1 && (
          <>
            <button
              onClick={navigatePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all"
              aria-label="Previous media"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={navigateNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all"
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
          <div className="text-white text-sm">
            {currentIndex + 1} of {viewerMediaItems.length}
          </div>

          {/* Video Controls */}
          {currentItem.type === 'video' && (
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {viewerMediaItems.length > 1 && (
            <div className="flex items-center gap-2">
              {viewerMediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
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

      {/* Keyboard shortcuts help */}
      <div className="absolute top-16 right-4 text-white/70 text-xs max-w-xs">
        <div className="bg-black/60 rounded-lg p-3 backdrop-blur-sm">
          <div className="font-semibold mb-2">Keyboard Shortcuts</div>
          <div>← → Navigate</div>
          <div>Space: Play/Pause</div>
          <div>F: Fullscreen</div>
          <div>M: Mute/Unmute</div>
          <div>Esc: Close</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MediaViewer;
