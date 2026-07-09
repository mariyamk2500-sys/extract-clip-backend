const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const youtubeDl = require('youtube-dl-exec');
const fs = require('fs-extra');
const path = require('path');

// Tell fluent-ffmpeg exactly where the FFmpeg binary is
ffmpeg.setFfmpegPath(ffmpegPath);

async function cutClip(videoUrl, start, end, speed, format, title) {
  const tempDir = path.join(__dirname, '../downloads');
  await fs.ensureDir(tempDir);

  const videoPath = path.join(tempDir, `input-${Date.now()}.mp4`);

  console.log('⬇️ Downloading video...');
  await youtubeDl(videoUrl, {
    output: videoPath,
    format: 'best[ext=mp4]',
  });

  const outputPath = path.join(tempDir, `clip-${Date.now()}.${format}`);
  const duration = end - start;

  console.log(`✂️ Cutting clip from ${start}s to ${end}s...`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(start)
      .duration(duration)
      .videoFilters(`setpts=${1 / speed}*PTS`)
      .output(outputPath)
      .on('end', () => {
        console.log('✅ Clip ready!');
        fs.remove(videoPath).catch(() => {});
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message);
        reject(err);
      })
      .run();
  });
}

module.exports = { cutClip };