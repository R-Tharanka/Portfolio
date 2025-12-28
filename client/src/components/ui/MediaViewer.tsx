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
  Images,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';
import { ProjectMedia } from '../../types';
import { getTransformedImageUrl, isCloudinaryUrl } from '../../utils/cloudinary';
import { mediaFitClass, mediaFitForItem } from '../../utils/mediaClasses';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: ProjectMedia[];
  projectTitle: string;
  initialIndex?: number;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

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
  const [imageOrientations, setImageOrientations] = useState<Record<string, 'portrait' | 'landscape'>>({});
  const [viewMode, setViewMode] = useState<'default' | 'fit'>('default');
  const [zoomLevel, setZoomLevel] = useState<number>(MIN_ZOOM);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStateRef = useRef({
    isDragging: false,
    pointerId: null as number | null,
    originX: 0,
    originY: 0,
    startOffset: { x: 0, y: 0 }
  });

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

  const resetZoom = React.useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(MIN_ZOOM);
    setIsPanning(false);
    panStateRef.current = {
      ...panStateRef.current,
      isDragging: false,
      pointerId: null,
      originX: 0,
      originY: 0,
      startOffset: { x: 0, y: 0 }
    };
  }, []);

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
  const isImageMedia = currentItem?.type === 'image';
  const isVideoMedia = currentItem?.type === 'video';

  const resolvedImageSrc = isImageMedia
    ? (isCloudinaryUrl(currentItem.url)
      ? getTransformedImageUrl(currentItem.url, {
        crop: 'fit',
        quality: 'auto'
      })
      : currentItem.url)
    : undefined;
  const imageOrientationKey = resolvedImageSrc ?? currentItem?.url ?? '';
  const currentOrientation = isImageMedia
    ? imageOrientations[imageOrientationKey] ?? (currentItem.displayVariant === 'mobile' ? 'portrait' : undefined)
    : undefined;
  const supportsFitMode = isImageMedia;
  const isFitModeActive = supportsFitMode && viewMode === 'fit';
  const isPortraitImage = isImageMedia && !isFitModeActive && currentOrientation === 'portrait';
  const canShowZoomControls = isFitModeActive;
  const canZoomIn = canShowZoomControls && zoomLevel < MAX_ZOOM;
  const canZoomOut = canShowZoomControls && zoomLevel > MIN_ZOOM;
  const zoomDisplay = `${Math.round(zoomLevel * 100)}%`;

  const modalBaseClasses = isFullscreen
    ? 'fixed inset-0 rounded-none'
    : 'w-10/12 max-w-4xl max-h-[85vh] mx-auto rounded-lg shadow-2xl';
  const modalContainerClass = `relative bg-black flex flex-col overflow-hidden ${modalBaseClasses}`;
  const contentPaddingClass = isFullscreen ? 'p-0' : 'p-8 pt-16 pb-4';
  const portraitScrollMaxHeight = isFullscreen ? 'calc(100vh - 7rem)' : 'calc(85vh - 7rem)';
  const scrollContainerClasses = isFitModeActive
    ? `items-center h-full min-h-0 ${zoomLevel > MIN_ZOOM ? 'overflow-auto' : 'overflow-hidden'}`
    : isPortraitImage
      ? 'items-start h-full min-h-0 overflow-y-auto overflow-x-hidden py-8 pb-8'
      : 'items-center h-full min-h-0';
  const defaultWrapperClasses = isPortraitImage
    ? 'w-full flex items-start justify-center transition-opacity duration-300'
    : 'w-full h-full flex items-center justify-center transition-opacity duration-300';
  const fitWrapperCursor = zoomLevel > MIN_ZOOM ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default';
  const mediaWrapperClasses = isFitModeActive
    ? `relative w-full h-full flex items-center justify-center transition-opacity duration-300 ${fitWrapperCursor}`
    : defaultWrapperClasses;
  const scrollContainerStyle: React.CSSProperties | undefined = isPortraitImage
    ? { maxHeight: portraitScrollMaxHeight }
    : undefined;
  // Always show the full image in the popup viewer to avoid cropping
  const currentFit = isImageMedia
    ? 'contain'
    : mediaFitForItem(currentItem);
  const baseMaxHeightClass = isFullscreen ? 'max-h-[98vh]' : 'max-h-[70vh]';
  const defaultContainSizeClass = `${baseMaxHeightClass} max-w-full w-auto h-auto`;
  const fitContainSizeClass = `${baseMaxHeightClass} max-w-full h-full w-auto`;
  const baseFitClass = mediaFitClass(currentFit, { includeDimensions: false });
  const defaultImageClass = isPortraitImage
    ? `rounded-lg shadow-lg w-full h-auto max-h-none ${baseFitClass}`
    : `rounded-lg shadow-lg ${defaultContainSizeClass} ${baseFitClass}`;
  const fitImageClass = `rounded-lg shadow-lg ${fitContainSizeClass} ${baseFitClass}`;
  const resolvedImageClass = isFitModeActive ? fitImageClass : defaultImageClass;
  const imageInlineStyles: React.CSSProperties | undefined = isFitModeActive
    ? {
      transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
      transformOrigin: 'center center',
      transition: isPanning ? 'none' : 'transform 150ms ease-out'
    }
    : undefined;
  const resolvedVideoClass = `rounded-lg shadow-lg ${defaultContainSizeClass} ${mediaFitClass('contain', { includeDimensions: false })}`;

  const activateDefaultMode = React.useCallback(() => {
    setViewMode(prev => {
      if (prev === 'default') {
        return prev;
      }
      resetZoom();
      return 'default';
    });
  }, [resetZoom]);

  const activateFitMode = React.useCallback(() => {
    if (!supportsFitMode) {
      return;
    }
    setViewMode(prev => {
      if (prev === 'fit') {
        return prev;
      }
      resetZoom();
      return 'fit';
    });
  }, [resetZoom, supportsFitMode]);

  const handleZoomIn = React.useCallback(() => {
    if (!isFitModeActive) {
      return;
    }
    setZoomLevel(prev => Number(Math.min(prev + ZOOM_STEP, MAX_ZOOM).toFixed(2)));
  }, [isFitModeActive]);

  const handleZoomOut = React.useCallback(() => {
    if (!isFitModeActive) {
      return;
    }
    setZoomLevel(prev => {
      const next = Number(Math.max(prev - ZOOM_STEP, MIN_ZOOM).toFixed(2));
      if (next === MIN_ZOOM) {
        setPanOffset({ x: 0, y: 0 });
        setIsPanning(false);
        panStateRef.current.isDragging = false;
        panStateRef.current.pointerId = null;
        panStateRef.current.originX = 0;
        panStateRef.current.originY = 0;
        panStateRef.current.startOffset = { x: 0, y: 0 };
      }
      return next;
    });
  }, [isFitModeActive]);

  const handleZoomReset = React.useCallback(() => {
    if (!isFitModeActive) {
      return;
    }
    resetZoom();
  }, [isFitModeActive, resetZoom]);

  useEffect(() => {
    if (!supportsFitMode && viewMode === 'fit') {
      setViewMode('default');
      resetZoom();
    }
  }, [supportsFitMode, viewMode, resetZoom]);

  useEffect(() => {
    resetZoom();
  }, [currentIndex, resetZoom]);

  const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isFitModeActive || zoomLevel <= MIN_ZOOM) {
      return;
    }
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    panStateRef.current.isDragging = true;
    panStateRef.current.pointerId = event.pointerId;
    panStateRef.current.originX = event.clientX;
    panStateRef.current.originY = event.clientY;
    panStateRef.current.startOffset = { ...panOffset };
    setIsPanning(true);
  }, [isFitModeActive, panOffset, zoomLevel]);

  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!panStateRef.current.isDragging) {
      return;
    }
    event.preventDefault();
    const dx = event.clientX - panStateRef.current.originX;
    const dy = event.clientY - panStateRef.current.originY;
    const nextOffset = {
      x: panStateRef.current.startOffset.x + dx,
      y: panStateRef.current.startOffset.y + dy
    };
    setPanOffset(nextOffset);
  }, []);

  const handlePointerEnd = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!panStateRef.current.isDragging) {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    panStateRef.current.isDragging = false;
    panStateRef.current.pointerId = null;
    panStateRef.current.originX = 0;
    panStateRef.current.originY = 0;
    panStateRef.current.startOffset = { ...panOffset };
    setIsPanning(false);
  }, [panOffset]);

  const pointerHandlers = isFitModeActive
    ? {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerLeave: handlePointerEnd,
      onPointerCancel: handlePointerEnd
    }
    : undefined;

  const isZoomResetDisabled = zoomLevel === MIN_ZOOM && panOffset.x === 0 && panOffset.y === 0;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
          if (isVideoMedia) {
            e.preventDefault();
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
          if (isVideoMedia) {
            e.preventDefault();
            toggleMute();
          }
          break;
        case '1':
          if (supportsFitMode) {
            e.preventDefault();
            activateDefaultMode();
          }
          break;
        case '2':
          if (supportsFitMode) {
            e.preventDefault();
            activateFitMode();
          }
          break;
        case '+':
        case '=':
          if (isFitModeActive) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
        case '_':
          if (isFitModeActive) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case '0':
          if (isFitModeActive) {
            e.preventDefault();
            handleZoomReset();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    isFullscreen,
    isVideoMedia,
    isFitModeActive,
    supportsFitMode,
    navigatePrev,
    navigateNext,
    toggleFullscreen,
    onClose,
    togglePlayPause,
    toggleMute,
    activateDefaultMode,
    activateFitMode,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset
  ]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const orientation = naturalHeight > naturalWidth ? 'portrait' : 'landscape';
    const url = event.currentTarget.dataset.mediaKey || event.currentTarget.currentSrc;

    if (!url) {
      return;
    }

    setImageOrientations(prev => {
      if (prev[url] === orientation) {
        return prev;
      }
      return { ...prev, [url]: orientation };
    });
  };

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
        className={modalContainerClass}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pl-4">
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
        <div className={`relative flex-1 min-h-0 flex items-center justify-center ${contentPaddingClass}`}>
          {/* Current Media */}
          <div
            className={`relative flex ${scrollContainerClasses} justify-center w-full`}
            style={scrollContainerStyle}
          >
            {/* Use a key based on currentIndex to force unmount/remount when media changes */}
            <div
              key={`viewer-media-${currentIndex}`}
              className={mediaWrapperClasses}
              {...(pointerHandlers ?? {})}
            >
              {isImageMedia ? (
                <img
                  src={resolvedImageSrc}
                  alt={`${projectTitle} media ${currentIndex + 1}`}
                  className={`${resolvedImageClass} select-none`}
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click download
                  draggable={false} // Disable drag download
                  onLoad={handleImageLoad}
                  data-media-key={imageOrientationKey}
                  style={imageInlineStyles}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={currentItem.url}
                  className={resolvedVideoClass}
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
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>

              {supportsFitMode && (
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-1 py-1">
                  <button
                    onClick={activateDefaultMode}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${viewMode === 'default'
                      ? 'bg-white/30 text-white'
                      : 'bg-transparent text-white/70 hover:text-white/90'
                      }`}
                    aria-pressed={viewMode === 'default'}
                    aria-label="Original layout (Mode 1)"
                    title="Original layout (Mode 1)"
                  >
                    Mode 1
                  </button>
                  <button
                    onClick={activateFitMode}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${viewMode === 'fit'
                      ? 'bg-white/30 text-white'
                      : 'bg-transparent text-white/70 hover:text-white/90'
                      }`}
                    aria-pressed={viewMode === 'fit'}
                    aria-label="Fit to viewer (Mode 2)"
                    title="Fit to viewer (Mode 2)"
                  >
                    Mode 2
                  </button>
                </div>
              )}

              {canShowZoomControls && (
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-2 py-1">
                  <button
                    onClick={handleZoomOut}
                    className={`p-2 rounded-full transition-colors ${canZoomOut ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                    aria-label="Zoom out"
                    disabled={!canZoomOut}
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="text-xs font-medium text-white/80 w-12 text-center">{zoomDisplay}</span>
                  <button
                    onClick={handleZoomIn}
                    className={`p-2 rounded-full transition-colors ${canZoomIn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                    aria-label="Zoom in"
                    disabled={!canZoomIn}
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className={`p-2 rounded-full transition-colors ${isZoomResetDisabled ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    aria-label="Reset zoom"
                    disabled={isZoomResetDisabled}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}

              {/* Video-specific controls */}
              {isVideoMedia && !videoRef.current?.controls && (
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
                    className={`w-3 h-3 rounded-full transition-all cursor-pointer ${index === currentIndex
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
        <KeyboardShortcutsHelp
          isVisible={showKeyboardShortcuts}
          isVideoActive={isVideoMedia}
          canUseFitMode={supportsFitMode}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      </div>
    </div>,
    document.body
  );
};

export default MediaViewer;
