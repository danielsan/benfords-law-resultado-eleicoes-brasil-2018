const http = require('http');
const fs   = require('fs');

const { spinner } = require('../lib/spinner');

const downloadToFile = (url, saveToFile) => new Promise((resolve) => {
  const spinnerMessage = `${downloadToFile.name} url:"${url}"`;
  spinner.start(spinnerMessage);

  http.get(url, (res) => {
    const ws = fs.createWriteStream(saveToFile);
    let downloaded = 0;
    const contentLength = +res.headers['content-length'];

    res.on('data', (chunk) => {
      downloaded += chunk.length;
      const percentage = ((downloaded / contentLength) * 100).toFixed(2);
      spinner.text = `${spinnerMessage} ${downloaded} / ${contentLength} (${percentage} %)`;

      return chunk;
    }).on('end', () => {
      spinner.succeed();
      resolve(saveToFile);
    }).pipe(ws);
  });
});


const downloadContent = url => new Promise((resolve) => {
  const spinnerMessage = `${downloadContent.name} url:"${url}"`;
  spinner.start(spinnerMessage);

  http.get(url, (res) => {
    const chunks = [];
    let downloaded = 0;
    const contentLength = +res.headers['content-length'];

    res
      .on('data', (chunk) => {
        downloaded += chunk.length;
        const percentage = ((downloaded / contentLength) * 100).toFixed(2);
        spinner.text = `${spinnerMessage} ${downloaded} / ${contentLength} (${percentage} %)`;

        chunks.push(chunk);
      })
      .on('end', () => {
        spinner.succeed();
        try {
          resolve(Buffer.concat(chunks));
        } catch (e) {
          console.error(e);
          resolve(chunks);
        }
      });
  });
});

module.exports = {
  downloadToFile,
  downloadContent,
};
