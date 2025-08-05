# Cloudinary Migration

This project has been migrated to use Cloudinary for media storage instead of local file storage. This change addresses CORS issues with video playback and provides better scalability.

## Migration Changes

1. All media uploads now go directly to Cloudinary
2. Videos are streamed directly from Cloudinary CDN
3. Images are optimized and delivered via Cloudinary CDN
4. The server no longer stores any media files

## Setup Instructions

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Add your Cloudinary credentials to your server `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=portfolio
   ```
3. Run the Cloudinary checker script to verify your setup:
   ```
   cd server
   npm run check:cloudinary
   ```

## Testing the Migration

After setup, you should:

1. Try uploading media through the admin interface
2. Verify that the media is stored in your Cloudinary account
3. Check that videos play without CORS errors
4. Verify that deleting media works properly

## Migration of Existing Media

We've created a migration script to automatically move your existing media to Cloudinary:

1. Ensure your Cloudinary credentials are set in your `.env` file
2. Run the migration script:
   ```
   cd server
   npm run migrate:media
   ```
3. The script will:
   - Find all projects with media items
   - Upload local media files to Cloudinary
   - Update database records with new Cloudinary URLs and publicIds
   - Keep external URLs as-is

This process preserves all your existing project data while moving the media storage to Cloudinary.

For more detailed information, see:
- [CLOUDINARY.md](CLOUDINARY.md) - Setup and usage guide
- [CLOUDINARY_CHANGES.md](CLOUDINARY_CHANGES.md) - Detailed implementation notes
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Summary of all changes made

## Testing the Integration

After setting up your Cloudinary account and credentials, you can verify the integration with:

```bash
cd server
npm run check:cloudinary  # Verify configuration
npm run test:cloudinary   # Run integration tests
```

The tests will verify that:
1. Your configuration is correct
2. You can upload files to Cloudinary
3. URL transformations work correctly
4. File deletion works properly

A test report will be generated in `server/tools/cloudinary-test-results.json`.
