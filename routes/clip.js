const express = require('express');
const router = express.Router();
const { cutClip } = require('../utils/ffmpeg');

router.post('/cut', async (req, res) => {
  try {
    const { videoUrl, start, end, speed, format, title } = req.body;
    
    if (!videoUrl || start === undefined || end === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Start processing
    const outputPath = await cutClip(videoUrl, start, end, speed, format, title);
    
    // Send the file
    res.download(outputPath, `${title || 'clip'}.${format}`, (err) => {
      if (err) console.error('Download error:', err);
    });
    
  } catch (error) {
    console.error('Clip error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;