# Media Handling with Cloudinary

This project uses Cloudinary for media storage and delivery. This document explains how to set up and use this integration.

## Why Cloudinary?

Cloudinary provides several advantages over server-side file storage:

1. **No CORS issues**: Media is served from Cloudinary's CDN with proper headers
2. **Automatic optimization**: Images and videos are automatically optimized for web delivery
3. **Responsive delivery**: Media can be resized and transformed on-the-fly
4. **Better scalability**: No need to worry about storage limits on your server
5. **Video streaming**: Proper handling of video streaming with adaptive bitrates

## Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key and API secret from your Cloudinary dashboard
3. Add the following environment variables to your `.env` file:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=portfolio
```

## How It Works

### Uploading Media

1. The `MediaUploader` component handles file uploads on the client side
2. Files are sent to the server via multipart/form-data
3. The server uses Multer to handle the upload in memory (no files are saved to disk)
4. The server then uploads the file to Cloudinary using our CloudinaryService
5. Cloudinary returns metadata including the public_id and secure_url
6. These details are stored in the database as part of the project's media array

### Displaying Media

1. Media is served directly from Cloudinary's CDN
2. URLs are already optimized and secure (https)
3. For videos, Cloudinary handles streaming automatically

### Deleting Media

1. When a media item is deleted from the UI, the client sends the publicId to the server
2. The server calls Cloudinary's API to delete the resource
3. Once confirmed, the media item is removed from the database

## Advanced Usage

### Image Transformations

You can apply transformations to images by modifying the URL parameters:

```javascript
// Example of resizing an image
const imageUrl = `${originalUrl.split('/upload/')[0]}/upload/w_500,h_300,c_fill/${originalUrl.split('/upload/')[1]}`;
```

### Video Transformations

Videos can be transformed similarly:

```javascript
// Example of setting video quality
const videoUrl = `${originalUrl.split('/upload/')[0]}/upload/q_auto:good/${originalUrl.split('/upload/')[1]}`;
```

## Troubleshooting

If you encounter issues with media uploads or display:

1. Check that your Cloudinary credentials are correct
2. Ensure your upload preset allows the file types you're trying to upload
3. Verify that CORS is properly configured in your Cloudinary settings
4. Check browser console for errors related to media loading

For more information, see the [Cloudinary documentation](https://cloudinary.com/documentation).
