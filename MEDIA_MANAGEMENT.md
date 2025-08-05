# Media Management Guide

This document explains how media is managed in the portfolio project using Cloudinary.

## How Media Works in the Portfolio

### Media Storage 

All media is stored in Cloudinary with the following structure:
- Base folder: `portfolio` (configurable via `CLOUDINARY_FOLDER` environment variable)
- Project media: `portfolio/projects/{projectId}/{timestamp}`

### Media Upload Flow

1. The client selects files through the `MediaUploader` component
2. Files are sent to the server as multipart/form-data
3. Multer middleware processes the files in memory (no disk storage)
4. The server uploads the files to Cloudinary using the `CloudinaryService`
5. Cloudinary returns metadata including public_id and secure URL
6. The data is returned to the client and stored in the project's media array

### Media Display

Media is displayed directly from Cloudinary's CDN with:
- Automatic transformations for responsive images
- Optimized delivery for different screen sizes
- CDN caching for better performance

### Media Deletion

When media is deleted:
1. The client sends a request with the Cloudinary public_id
2. The server deletes the file from Cloudinary
3. The media item is removed from the project's media array in the database

## Maintenance Tools

Several tools are available to maintain the media system:

- `npm run check:cloudinary` - Verify Cloudinary configuration
- `npm run test:cloudinary` - Run integration tests for Cloudinary
- `npm run migrate:media` - Migrate existing local media to Cloudinary
- `npm run fix:media` - Fix issues with media data in the database
- `npm run cleanup:media` - Remove leftover local media files

## Troubleshooting

If you encounter issues with media:

1. **Media not displaying**:
   - Check the URL format in the database
   - Ensure the publicId is correctly formatted

2. **Media deletion issues**:
   - Verify the publicId is correct
   - Check if there are multiple items with `displayFirst=true`

3. **Upload errors**:
   - Verify your Cloudinary credentials
   - Check file size limits (5MB for images, 50MB for videos)
   - Ensure file types are supported

## Important Notes

- We're using multer's memory storage, not disk storage
- All file validation happens on the server side
- The old local storage system has been completely replaced
