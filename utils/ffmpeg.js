const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs-extra');
const path = require('path');

// Tell fluent-ffmpeg exactly where the FFmpeg binary is
ffmpeg.setFfmpegPath(ffmpegPath);

async function cutClip(videoUrl, start, end, speed, format, title) {
  const tempDir = path.join(__dirname, '../downloads');
  await fs.ensureDir(tempDir);

  const videoPath = path.join(tempDir, `input-${Date.now()}.mp4`);

  console.log('Downloading video...');

  // ✅ Download using ytdl-core
  await new Promise((resolve, reject) => {
    const stream = ytdl(videoUrl, {
      quality: 'highest',
      filter: 'audioandvideo'
    });

    const writeStream = fs.createWriteStream(videoPath);

    stream.pipe(writeStream);

    stream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  const outputPath = path.join(tempDir, `clip-${Date.now()}.${format}`);
  const duration = end - start;

  console.log(`Cutting clip from ${start}s to ${end}s...`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(start)
      .duration(duration)
      .videoFilters(`setpts=${1 / speed}*PTS`)
      .output(outputPath)
      .on('end', async () => {
        console.log('Clip ready!');
        await fs.remove(videoPath).catch(() => {});
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
