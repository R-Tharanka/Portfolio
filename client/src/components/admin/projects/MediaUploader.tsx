import React, { useState, useRef, useEffect } from 'react';
import { Image, Video, X, UploadCloud, Check, AlertCircle } from 'lucide-react';
import { ProjectMedia } from '../../../types';
import { uploadProjectMedia, deleteProjectMedia } from '../../../services/mediaService';
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

  // Handle file input change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (!event.target.files || event.target.files.length === 0) return;
    if (!token) {
      setError('You must be authenticated to upload files');
      return;
    }

    setUploading(true);
    setError(null);

    const files = Array.from(event.target.files);
    
    try {
      // If we don't have a projectId yet, we'll need to use a temp ID
      const uploadId = projectId || 'temp';
      
      const uploadData: { image?: File[], video?: File[] } = {};
      if (type === 'image') {
        uploadData.image = files;
      } else {
        uploadData.video = files;
      }
      
      const result = await uploadProjectMedia(uploadId, uploadData, token);
      
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
        
        toast.success(`${result.mediaItems.length} ${type}${result.mediaItems.length > 1 ? 's' : ''} uploaded successfully`);
      } else {
        setError(result.error || `Failed to upload ${type}`);
        toast.error(result.error || `Failed to upload ${type}`);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setError(`Failed to upload ${type}`);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Set an item as display first
  const setDisplayFirst = (index: number) => {
    setMediaItems(prevItems => {
      return prevItems.map((item, i) => ({
        ...item,
        displayFirst: i === index
      }));
    });
  };

  // Remove a media item
  const removeMediaItem = async (index: number) => {
    const itemToRemove = mediaItems[index];
    
    // If the item is from an external source or doesn't have a URL, just remove it from state
    if (!itemToRemove.url || itemToRemove.isExternal) {
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
    
    // Otherwise, try to delete the file from the server
    if (token && projectId) {
      try {
        const result = await deleteProjectMedia(projectId, itemToRemove.url, token);
        
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

  // Drag and drop reordering could be implemented in the future

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Project Media</h3>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 text-sm flex items-center">
          <AlertCircle size={16} className="mr-2" />
          {error}
        </div>
      )}
      
      {/* Media items display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {mediaItems.map((item, index) => (
          <div 
            key={item._id || `media-${index}`}
            className={`relative border ${item.displayFirst 
              ? 'border-primary border-2' 
              : 'border-border'} rounded-md overflow-hidden group h-24`}
          >
            {/* Media preview */}
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={`Project media ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/10">
                <Video size={24} className="text-foreground/60" />
              </div>
            )}
            
            {/* Display first indicator */}
            {item.displayFirst && (
              <div className="absolute top-1 left-1 bg-primary text-white rounded-full p-0.5">
                <Check size={12} />
              </div>
            )}
            
            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {/* Set as display first */}
              {!item.displayFirst && (
                <button
                  onClick={() => setDisplayFirst(index)}
                  className="p-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                  title="Set as main display"
                >
                  <Check size={14} />
                </button>
              )}
              
              {/* Remove media */}
              <button
                onClick={() => removeMediaItem(index)}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove media"
              >
                <X size={14} />
              </button>
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
      </div>
    </div>
  );
};

export default MediaUploader;
