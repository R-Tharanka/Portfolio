import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, X, UploadCloud, AlertCircle, ArrowLeft, ArrowRight, Eye, CloudCog } from 'lucide-react';
import { ProjectMedia } from '../../../types';
import { uploadProjectMedia, deleteProjectMedia } from '../../../services/mediaService';
import { getTransformedImageUrl, getVideoThumbnail, isCloudinaryUrl } from '../../../utils/cloudinary';
import toast from 'react-hot-toast';

interface MediaUploaderProps {
  projectId: string | null;
  token: string | null;
  initialMedia: ProjectMedia[];
  onMediaChange: (media: ProjectMedia[]) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  projectId,
  token,
  initialMedia,
  onMediaChange
}) => {
  const [mediaItems, setMediaItems] = useState<ProjectMedia[]>(initialMedia || []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Update parent component when media items change
  useEffect(() => {
    onMediaChange(mediaItems);
  }, [mediaItems, onMediaChange]);

  // Update local state when initialMedia changes
  useEffect(() => {
    setMediaItems(initialMedia || []);
  }, [initialMedia]);

  // These handlers are no longer needed since we're using labels

  // State for upload progress
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Handle file input change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (!event.target.files || event.target.files.length === 0) return;
    if (!token) {
      setError('You must be authenticated to upload files');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const files = Array.from(event.target.files);
    
    try {
      // Show toast notification for upload start
      const toastId = toast.loading(`Uploading ${files.length} ${type}${files.length > 1 ? 's' : ''}...`);
      
      // If we don't have a projectId yet, we'll need to use a temp ID
      const uploadId = projectId || 'temp';
      
      const uploadData: { image?: File[], video?: File[] } = {};
      if (type === 'image') {
        uploadData.image = files;
      } else {
        uploadData.video = files;
      }
      
      // Upload to Cloudinary via our service with progress tracking
      const result = await uploadProjectMedia(
        uploadId, 
        uploadData, 
        token,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      if (result.success && result.mediaItems.length > 0) {
        // Add new media items to the list
        setMediaItems(prevItems => {
          const newItems = [...prevItems, ...result.mediaItems];
          
          // Ensure only one item has displayFirst=true
          const hasDisplayFirst = newItems.some(item => item.displayFirst);
          if (!hasDisplayFirst && newItems.length > 0) {
            newItems[0].displayFirst = true;
          }
          
          return newItems;
        });
        
        // Update toast to success
        toast.success(`${result.mediaItems.length} ${type}${result.mediaItems.length > 1 ? 's' : ''} uploaded to Cloudinary`, {
          id: toastId
        });
      } else {
        setError(result.error || `Failed to upload ${type}`);
        
        // Update toast to error
        toast.error(result.error || `Failed to upload ${type}`, {
          id: toastId
        });
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setError(`Failed to upload ${type}`);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Move an item left (decrease index)
  const moveItemLeft = (index: number) => {
    if (index <= 0) return; // Can't move first item left
    
    setMediaItems(prevItems => {
      const newItems = [...prevItems];
      // Swap with previous item
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      // Update order property
      newItems.forEach((item, i) => {
        item.order = i;
      });
      // First item is always displayFirst
      newItems.forEach((item, i) => {
        item.displayFirst = i === 0;
      });
      return newItems;
    });
  };
  
  // Move an item right (increase index)
  const moveItemRight = (index: number) => {
    if (index >= mediaItems.length - 1) return; // Can't move last item right
    
    setMediaItems(prevItems => {
      const newItems = [...prevItems];
      // Swap with next item
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      // Update order property
      newItems.forEach((item, i) => {
        item.order = i;
      });
      // First item is always displayFirst
      newItems.forEach((item, i) => {
        item.displayFirst = i === 0;
      });
      return newItems;
    });
  };

  // Remove a media item
  const removeMediaItem = async (index: number) => {
    const itemToRemove = mediaItems[index];
    
    // If the item is from an external source, just remove it from state
    if (itemToRemove.isExternal) {
      setMediaItems(prevItems => {
        const newItems = prevItems.filter((_, i) => i !== index);
        
        // Ensure at least one item has displayFirst=true if we have items
        if (newItems.length > 0 && !newItems.some(item => item.displayFirst)) {
          newItems[0].displayFirst = true;
        }
        
        return newItems;
      });
      return;
    }
    
    // Otherwise, try to delete the file from Cloudinary
    if (token && projectId) {
      try {
        const result = await deleteProjectMedia(projectId, itemToRemove, token);
        
        if (result.success) {
          setMediaItems(prevItems => {
            const newItems = prevItems.filter((_, i) => i !== index);
            
            // Ensure at least one item has displayFirst=true if we have items
            if (newItems.length > 0 && !newItems.some(item => item.displayFirst)) {
              newItems[0].displayFirst = true;
            }
            
            return newItems;
          });
          
          toast.success('Media removed successfully');
        } else {
          toast.error(result.error || 'Failed to remove media');
        }
      } catch (error) {
        console.error('Error removing media:', error);
        toast.error('Failed to remove media');
      }
    } else {
      // If we don't have a token or projectId, just remove from state
      setMediaItems(prevItems => {
        const newItems = prevItems.filter((_, i) => i !== index);
        
        // Ensure at least one item has displayFirst=true if we have items
        if (newItems.length > 0 && !newItems.some(item => item.displayFirst)) {
          newItems[0].displayFirst = true;
        }
        
        return newItems;
      });
    }
  };

  // These functions were duplicates and have been merged with the ones above

  // Preview a media item
  const [previewItem, setPreviewItem] = useState<ProjectMedia | null>(null);
  
  const openPreview = (item: ProjectMedia) => {
    setPreviewItem(item);
  };
  
  const closePreview = () => {
    setPreviewItem(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Project Media</h3>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm flex items-center">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Upload progress indicator */}
      {uploading && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-md text-sm">
          <div className="flex items-center mb-2">
            <UploadCloud size={16} className="mr-2 text-primary animate-pulse" />
            <span>Uploading to Cloudinary...</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1 text-muted-foreground">
            Your files are being uploaded to Cloudinary and will appear below when complete
          </p>
        </div>
      )}
      
      {/* Media items display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {mediaItems.map((item, index) => (
          <div 
            key={item._id || `media-${index}`}
            className={`relative border ${index === 0
              ? 'border-primary border-2' 
              : 'border-border'} rounded-md overflow-hidden group h-24`}
          >
            {/* Media preview with instant preview on hover - optimized for Cloudinary */}
            {item.type === 'image' ? (
              <div className="relative w-full h-full">
                <img 
                  src={isCloudinaryUrl(item.url) 
                    ? getTransformedImageUrl(item.url, { width: 150, height: 150, quality: 'auto' }) 
                    : item.url
                  } 
                  alt={`Project media ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => openPreview(item)}
                  style={{ cursor: 'pointer' }}
                />
                {/* Subtle indicator for preview action */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={24} className="text-white" />
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <div 
                  className="w-full h-full flex items-center justify-center bg-black/10"
                  onClick={() => openPreview(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <Video size={24} className="text-foreground/60" />
                  
                  {/* Show video preview - either thumbnail or actual video */}
                  {isCloudinaryUrl(item.url) ? (
                    <>
                      <img 
                        src={getVideoThumbnail(item.url)}
                        alt={`Video thumbnail ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:opacity-0 transition-opacity"
                      />
                      <video 
                        src={item.url}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                        muted
                        loop
                        playsInline
                      />
                    </>
                  ) : (
                    <video 
                      src={item.url}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  )}
                </div>
                {/* Subtle indicator for preview action */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={24} className="text-white" />
                </div>
              </div>
            )}
            
            {/* Main display indicator for first item */}
            {index === 0 && (
              <div className="absolute top-1 left-1 bg-primary text-white px-1.5 py-0.5 text-xs rounded-md z-20">
                Main
              </div>
            )}
            
            {/* Order indicator */}
            <div className="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 text-xs rounded-md z-20">
              {index + 1}/{mediaItems.length}
            </div>
            
            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <div className="flex items-center justify-center gap-2">
                {/* Preview media */}
                <button
                  onClick={() => openPreview(item)}
                  className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  title="Preview media"
                >
                  <Eye size={14} />
                </button>
                
                {/* Remove media */}
                <button
                  onClick={() => removeMediaItem(index)}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove media"
                >
                  <X size={14} />
                </button>
              </div>
              
              {/* Reordering controls */}
              <div className="flex items-center justify-center gap-2 mt-1">
                <button
                  onClick={() => moveItemLeft(index)}
                  className="p-1.5 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move left"
                  disabled={index === 0}
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => moveItemRight(index)}
                  className="p-1.5 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move right"
                  disabled={index === mediaItems.length - 1}
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            
            {/* Media type indicator */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white rounded-full p-1">
              {item.type === 'image' ? (
                <Image size={12} />
              ) : (
                <Video size={12} />
              )}
            </div>
          </div>
        ))}
        
        {/* Add image button using label instead of nested button */}
        <div className={`border-2 border-dashed border-border rounded-md p-2 h-24 transition-colors ${
          uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'
        }`}>
          <label 
            htmlFor="image-upload"
            className={`flex flex-col items-center justify-center gap-1 h-full w-full ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            aria-disabled={Boolean(uploading)}
          >
            <Image size={18} className="text-foreground/60" />
            <span className="text-xs text-foreground/60">Add Image</span>
          </label>
          <input 
            id="image-upload"
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
            title="Upload project images"
            aria-label="Upload project images"
            disabled={uploading}
          />
        </div>
        
        {/* Add video button using label instead of nested button */}
        <div className={`border-2 border-dashed border-border rounded-md p-2 h-24 transition-colors ${
          uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'
        }`}>
          <label 
            htmlFor="video-upload"
            className={`flex flex-col items-center justify-center gap-1 h-full w-full ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            aria-disabled={Boolean(uploading)}
          >
            <Video size={18} className="text-foreground/60" />
            <span className="text-xs text-foreground/60">Add Video</span>
          </label>
          <input 
            id="video-upload"
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => handleFileChange(e, 'video')}
            className="hidden"
            title="Upload project videos"
            aria-label="Upload project videos"
            disabled={uploading}
          />
        </div>
      </div>
      
      {uploading && (
        <div className="flex items-center justify-center py-2 text-sm text-foreground/60">
          <UploadCloud size={16} className="animate-bounce mr-2" />
          Uploading media...
        </div>
      )}
      
      <div className="text-xs text-foreground/60">
        <p>Supported formats: </p>
        <p>• Images: JPG, PNG, GIF, WebP (max 5MB)</p>
        <p>• Videos: MP4, WebM, OGG (max 50MB)</p>
        <p className="mt-1 italic">Tip: You can reorder media by using the arrow buttons that appear when hovering over an item.</p>
      </div>
      
      {/* Media preview modal */}
      {previewItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={closePreview}>
          <div className="bg-card p-4 rounded-lg shadow-xl max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Media Preview</h3>
              <button
                onClick={closePreview}
                className="p-1.5 bg-background rounded-full hover:bg-background/80"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-hidden rounded-md">
              {previewItem.type === 'image' ? (
                <img 
                  src={isCloudinaryUrl(previewItem.url) 
                    ? getTransformedImageUrl(previewItem.url, { width: 1200, height: 800, quality: 'auto' }) 
                    : previewItem.url
                  } 
                  alt="Media preview" 
                  className="max-w-full h-auto object-contain max-h-[70vh]"
                />
              ) : previewItem.type === 'video' ? (
                <video 
                  src={previewItem.url}
                  controls
                  autoPlay
                  className="max-w-full h-auto max-h-[70vh]"
                />
              ) : null}
            </div>
            
            <div className="mt-4 text-sm text-foreground/70">
              {previewItem.isExternal ? 'External URL' : 'Uploaded file'}
              {mediaItems.indexOf(previewItem) === 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  Main display
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
