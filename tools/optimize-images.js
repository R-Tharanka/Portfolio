const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../client/src/assets/img');
const OPTIMIZED_DIR = path.join(__dirname, '../client/src/assets/img-optimized');

// Configuration for different image sizes
const imageSizes = {
  thumbnail: 150,
  small: 300,
  medium: 600,
  large: 1200
};

// Supported image formats
const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImage(inputPath, outputPath, width) {
  try {
    await sharp(inputPath)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 }) // Convert to WebP format
      .toFile(outputPath);

    console.log(`✓ Optimized: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error);
  }
}

async function processDirectory(directory) {
  try {
    // Create optimized directory if it doesn't exist
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

    // Read all files in the directory
    const files = await fs.readdir(directory);

    for (const file of files) {
      const inputPath = path.join(directory, file);
      const stats = await fs.stat(inputPath);

      if (stats.isDirectory()) {
        // Recursively process subdirectories
        const subOptimizedDir = path.join(OPTIMIZED_DIR, file);
        await fs.mkdir(subOptimizedDir, { recursive: true });
        await processDirectory(inputPath);
      } else if (supportedFormats.includes(path.extname(file).toLowerCase())) {
        // Process image files
        const fileName = path.parse(file).name;
        
        // Generate different sizes
        for (const [size, width] of Object.entries(imageSizes)) {
          const outputFileName = `${fileName}-${size}.webp`;
          const outputPath = path.join(OPTIMIZED_DIR, outputFileName);
          await optimizeImage(inputPath, outputPath, width);
        }
      }
    }
  } catch (error) {
    console.error('Error processing directory:', error);
  }
}

// Start the optimization process
console.log('🔄 Starting image optimization...');
processDirectory(IMAGES_DIR)
  .then(() => console.log('✨ Image optimization complete!'))
  .catch(error => console.error('❌ Failed to optimize images:', error));