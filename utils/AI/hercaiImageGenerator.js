const { Hercai } = require('hercai');
const { Buffer } = require('buffer');

const hercai = new Hercai({ apiKey: process.env.HERCAI_API_KEY });

async function generateImage(prompt) {
  try {
    const response = await hercai.images.generations({
      prompt,
      model: 'blackforestlabs/Flux-1.0', // Try prodia first
      negative_prompt: 'low quality, blurry, distorted'
    });

    // Log response structure for debugging
    console.log('Herc.ai response:', {
      hasBuffer: !!response.buffer,
      hasData: !!response.data,
      responseKeys: Object.keys(response)
    });

    // Check for buffer or data
    let imageBuffer = response.buffer || response.data;
    if (!imageBuffer) {
      throw new Error('No image buffer or data returned by Herc.ai');
    }

    // Ensure Buffer format
    if (!(imageBuffer instanceof Buffer)) {
      imageBuffer = Buffer.from(imageBuffer);
    }

    return imageBuffer; // Buffer for Discord attachment
  } catch (err) {
    console.error('Error generating image with Herc.ai:', err.message, err.response?.data);
    // Try simurg as fallback
    if (err.message.includes('Invalid model') || err.response?.data?.error?.includes('model')) {
      console.warn('Retrying with model: simurg');
      const response = await hercai.images.generations({
        prompt,
        model: 'simurg',
        negative_prompt: 'low quality, blurry, distorted',
        response_format: 'buffer'
      });

      console.log('Herc.ai simurg response:', {
        hasBuffer: !!response.buffer,
        hasData: !!response.data,
        responseKeys: Object.keys(response)
      });

      let imageBuffer = response.buffer || response.data;
      if (!imageBuffer) {
        throw new Error('No image buffer or data returned by Herc.ai (simurg)');
      }

      if (!(imageBuffer instanceof Buffer)) {
        imageBuffer = Buffer.from(imageBuffer);
      }

      return imageBuffer;
    }
    throw err;
  }
}

module.exports = { generateImage };