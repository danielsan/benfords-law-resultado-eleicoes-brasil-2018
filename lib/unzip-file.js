const fs       = require('fs');
const unzipper = require('unzipper');

const { spinner } = require('../lib/spinner');

const unzipFile = zipFile => new Promise((resolve) => {
  const message = `unzipFile ${zipFile}`;
  spinner.start(message);
  let chunks = 0;
  const csvCacheName = zipFile.replace(/\.zip$/i, '.csv');

  fs.promises.stat(csvCacheName)
    .then(() => {
        if (process.env.IGNORE_CACHE) throw new Error('Ignore Cahce');
        return fs.promises.readFile(csvCacheName);
    })
    .then(resolve)
    .catch((err) => {
        console.error(err);
        fs.createReadStream(zipFile)
          .on('data', (chunk) => {
            // console.log(unzipFile.name, zipFile, chunk);
            spinner.text = `${message} ${++chunks}`;
      
            return chunk;
          })
          .pipe(unzipper.Parse())
          .on('entry', (entry) => {
            const fileName = entry.path;
            // const {type, size} = entry; // 'Directory' or 'File'
      
            if (!/\.csv$/.test(fileName)) {
              // console.log(unzipFile.name, 'entry', fileName, 'autodrain');
              return entry.autodrain();
            }
      
            const matchMessage = `${message} ${fileName} FOUND!`;
            // console.log(matchMessage);
            spinner.text = matchMessage;
            // entry.pipe(fs.createWriteStream('output/path'));
            const bufferz = [];
            // const buff = Buffer.alloc(0);
            const {uncompressedSize} = entry.vars;
            let acc = 0;
            entry
            // .on('data', _ => bufferz.push(_))
              .on('data', (chunk) => {
                acc += chunk.length;
                const percentage = ((acc / uncompressedSize) * 100);
                const msg = `${message}/${fileName}: ${acc} / ${uncompressedSize} (${percentage.toFixed(2)} %)`;
                spinner.text = msg;
      
                bufferz.push(chunk);
      
                return chunk;
              })
              .on('end',  () => {
                spinner.text = `${message}/${fileName}: ${acc} / ${uncompressedSize} (100 %)`;
                spinner.succeed();
                try {
                  resolve(Buffer.concat(bufferz));
                } catch (e) {
                  console.error(e);
                  resolve(bufferz);
                }
              });
      
            if (process.env.CACHE_CSV === '1') {
              entry.pipe(fs.createWriteStream(csvCacheName));
            }
          });
    });

});

module.exports = { unzipFile };
