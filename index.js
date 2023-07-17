const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(parseFloat(duration));
      }
    });
  });
}

function getTotalVideoDuration(folderPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, async (err, files) => {
      if (err) {
        reject(err);
      } else {
        let totalDuration = 0;
        for (const file of files) {
          const filePath = path.join(folderPath, file);
          const stats = fs.statSync(filePath);
          if (stats.isFile() && isVideoFile(filePath)) {
            try {
              const duration = await getVideoDuration(filePath);
              totalDuration += duration;
            } catch (err) {
              console.error(`Hata: ${file} videosunun süresi alınamadı.`, err);
            }
          }
        }
        resolve(totalDuration);
      }
    });
  });
}

function isVideoFile(filePath) {
  const validExtensions = ['.mp4', '.avi', '.mkv']; // Videoların kabul edilen dosya uzantıları
  const fileExtension = path.extname(filePath);
  return validExtensions.includes(fileExtension);
}

// Kullanıcıdan klasör yolu alınması
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Videoların bulunduğu klasörün yolunu girin: ', async (folderPath) => {
  try {
    const totalDuration = await getTotalVideoDuration(folderPath);
    console.log(`Videoların toplam uzunluğu: ${(totalDuration/60).toFixed(2)} dakika`);
  } catch (err) {
    console.error('Hata:', err);
  } finally {
    readline.close();
  }
});