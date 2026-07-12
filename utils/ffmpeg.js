const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ytdl = require('ytdl-core');
const fs = require('fs-extra');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

async function cutClip(videoUrl, start, end, speed, format, title) {
  const tempDir = path.join(__dirname, '../downloads');
  await fs.ensureDir(tempDir);

  const videoPath = path.join(tempDir, `input-${Date.now()}.mp4`);
  const outputPath = path.join(tempDir, `clip-${Date.now()}.${format || 'mp4'}`);

  console.log('⬇️ Downloading video...');

  // Download using ytdl-core (no python needed)
  await new Promise((resolve, reject) => {
    const stream = ytdl(videoUrl, {
      quality: 'highestvideo',
      filter: 'videoandaudio'
    });

    const writeStream = fs.createWriteStream(videoPath);
    stream.pipe(writeStream);

    stream.on('error', reject);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  console.log('✅ Download complete!');

  const duration = end - start;
  console.log(`✂️ Cutting clip from ${start}s to ${end}s...`);

  return new Promise((resolve, reject) => {
    let command = ffmpeg(videoPath)
      .setStartTime(start)
      .duration(duration);

    if (speed && speed !== 1) {
      command = command.videoFilters(`setpts=${1 / speed}*PTS`);
    }

    command
      .output(outputPath)
      .on('end', () => {
        console.log('✅ Clip ready!');
        fs.remove(videoPath).catch(() => {});
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err.message);
        fs.remove(videoPath).catch(() => {});
        reject(err);
      })
      .run();
  });
}

module.exports = { cutClip };
