const http = require('http');
const fs   = require('fs');
const unzipper = require('unzipper');
const fastCsv  = require('fast-csv');
const assert   = require('assert');

const headersWhiteList = 'CD_CARGO_PERGUNTA,NM_VOTAVEL,QT_VOTOS'.split(',');

// eslint-disable-next-line no-confusing-arrow
const headersList = require('./boletim_urna_1_turno.headers.json').map(_ => headersWhiteList.includes(_) ? _ : undefined);

const shaUrl = process.argv[2] || '';

assert(shaUrl.startsWith('http://agencia.tse.jus.br/estatistica/sead/eleicoes/eleicoes2018/'));
assert(shaUrl.match(/\.zip\.sha512$/));

const downloadContent = url => new Promise((resolve) => {
  console.log(downloadContent.name, {url});
  http.get(url, (res) => {
    const chunks = [];
    console.log(downloadContent.name, 'setting events', res.headers);
    res
      .on('data', (_) => {
        console.log(downloadContent.name, url, Buffer.byteLength(_));
        chunks.push(_);
      })
      .on('end', () => resolve(Buffer.concat(chunks)));
  });
});


const unzipFile = zipFile => new Promise(resolve => fs.createReadStream(zipFile)
  .pipe(unzipper.Parse())
  .on('entry', (entry) => {
    const fileName = entry.path;
    // const {type, size} = entry; // 'Directory' or 'File'

    if (fileName.match(/\.csv$/)) {
      console.log({fileName}, 'FOUND!');
      // entry.pipe(fs.createWriteStream('output/path'));
      const bufferz = [];
      entry
        .on('data', _ => bufferz.push(_))
        .on('end',  () => resolve(Buffer.concat(bufferz)));
    } else {
      entry.autodrain();
    }
  }));

downloadContent(shaUrl).then((shaBuffer) => {
  const [sha512, filename] = shaBuffer.toString().split(/\s+/);
  console.log({sha512, filename});

  const localFilename = `./resources/${filename}`.replace(/\/\//g, '/');
  fs.promises.stat(localFilename)
    .catch((err) => {
      console.error({err});
      const downloadUrl = shaUrl.replace('.sha512', '');
      console.log(`downloading ${downloadUrl}...`);
      return downloadContent(downloadUrl)
        .then((zipBuffer) => {
          console.log(`download completed ${downloadUrl}!`);
          fs.promises.writeFile(localFilename, zipBuffer)
            .then((writeFileRes) => {
              console.log({writeFileRes});
            })
            .catch((writeFileErr) => {
              console.error({writeFileErr});
            });
        })
        .catch((zipDownloadError) => {
          console.log({zipDownloadError});
        });
    })
    .then(() => unzipFile(localFilename).then((csvBuffer) => {
      console.log('unzipping worked', csvBuffer);
      const rows = [];
      const initials = {
        1: {times: 0, percentage: 0},
        2: {times: 0, percentage: 0},
        3: {times: 0, percentage: 0},
        4: {times: 0, percentage: 0},
        5: {times: 0, percentage: 0},
        6: {times: 0, percentage: 0},
        7: {times: 0, percentage: 0},
        8: {times: 0, percentage: 0},
        9: {times: 0, percentage: 0},
        total: 0,
      };

      fastCsv
        .fromString(csvBuffer.toString(), {headers: headersList, objectMode: true, strictColumnHandling: true, delimiter: ';', discardUnmappedColumns: true})
        .on('data', (row) => {
          if (!row.CD_CARGO_PERGUNTA === '1') return;

          row.initial = row.QT_VOTOS.substr(0, 1);
          if (!initials[row.initial]) return;

          process.stdout.write('.');
          initials[row.initial].times++;
          initials.total++;

          rows.push(row);
        })
        .on('end', () => {
          console.log('\n');
          Object.keys(initials).forEach(number => initials[number].percentage = ((initials[number].times / initials.total) * 100).toFixed(2) + '%');
          console.log('done', initials);
        });
    }));
});
