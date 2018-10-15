const fs   = require('fs');
const assert   = require('assert');
const crypto   = require('crypto');
const babar    = require('babar');
const { run }  = require('@everymundo/runner');

const { turnos }    = require('./config');
const { spinner }   = require('./lib/spinner');
const { lpad }      = require('./lib/spinner');
const { unzipFile } = require('./lib/unzip-file');
const { processCsvBuffer } = require('./lib/process-csv-buffer');
const {
  downloadToFile,
  downloadContent, 
} = require('./lib/downloaders');

const headersWhiteList = 'CD_CARGO_PERGUNTA,NR_VOTAVEL,QT_VOTOS'.split(',');
const headersFromFile  = require('./boletim_urna_1_turno.headers.json');
// eslint-disable-next-line no-confusing-arrow
const headersList = headersFromFile.map(_ => headersWhiteList.includes(_) ? _ : undefined);
// eslint-disable-next-line no-confusing-arrow
const indexes = headersFromFile.map((_, i) => headersWhiteList.includes(_) ? i : null).filter(_ => _ != null);

const getZipFile = downloadUrl => (shaBuffer) => {
  const [sha512, filename] = shaBuffer.toString().split(/\s+/);
  console.log({sha512, filename});

  const localZipFilename = `./resources/${filename}`.replace(/\/\//g, '/');
  return fs.promises.stat(localZipFilename).then(() => {
    console.log('file already exists, let\'s process it');
    return {localZipFilename, sha512};
  }).catch((err) => {
    console.error('ZIP File does not exist, let\'s download it', err.message);
    return downloadToFile(downloadUrl, localZipFilename).then(() => ({localZipFilename, sha512}));
  });
};

const validateFileHash = ({localZipFilename, sha512}) => {
  const ceBuffer = fs.readFileSync(localZipFilename);
  const fileHash = crypto.createHash('sha512').update(ceBuffer).digest('hex');
  // console.log('file downloaded', downloadToFile.name);
  assert(sha512 === fileHash, `remote hash does not match localFile hash remote[${sha512}] === local[${fileHash}]`);
  console.log('hashes match');
  return localZipFilename;
};

const formatVotes = votes => votes.toString().split('').reverse().map((l, i) => (i) % 3 === 0 ? `${l},` : l).reverse().join('').replace(/^,|,$/g, '');

const buildAndDisplayReport = (reportingStructure) => {
  const benfordReport = [];
  const candidatesReport = [];

  const {benford, benfordsTotal, candidates, candidatesTotal} = reportingStructure;

  Object.keys(benford).forEach((number) => {
    const item = benford[number];

    const percent = (item.times / benfordsTotal) * 100;

    item.percentage = `0${percent.toFixed(2)}%`.substr(-6);

    benfordReport.push([number, percent]);
  });

  let candidatesText = '';
  Object.keys(candidates)
    .filter(_ => +_)
    .sort()
    .forEach((number) => {
      const item = candidates[number];

      const percent = (item.votes / candidatesTotal) * 100;

      item.percentage = `0${percent.toFixed(2)}%`.substr(-6);

      item.formatted = formatVotes(item.votes);

      // candidatesReport.push([number, percent]);
      candidatesReport.push([number, item.votes]);
      candidatesText += `${number} has ${item.percentage} of votes with ${item.formatted.padStart(10, ' ')} total votes\n`;
    });

  console.log(babar(benfordReport, {caption: 'Benfords Curve'}));
  // console.log(babar(candidatesReport, {caption: 'Benfords Curve', color: 'yellow', width: 160}));
  console.log({benford});
  console.log('\nCandidates\n', candidatesText);
  console.log('Total votes', formatVotes(candidatesTotal));
  
  // console.log({benfordReport, candidatesReport, candidatesReportLen:candidatesReport.length});
};

const dealWithError = (chainError) => {
  spinner.stopAndPersist();
  console.error('chainError');
  console.error(chainError);
  process.exit(1);
};

const validateHashUrl = async(hashUrl) => {
  assert(hashUrl.startsWith('http://agencia.tse.jus.br/estatistica/sead/eleicoes/eleicoes2018/'));
  assert(hashUrl.match(/\.zip\.sha512$/));

  return hashUrl;
};

const unzipLocalFile = localZipFilename => unzipFile(localZipFilename);

const init = async () => {
  const UF            = (process.argv[2] || '').substr(0, 2).toUpperCase();
  const turno         = process.argv[4] || '1';
  const candidateType = process.argv[3] || '1';

  const shaUrl = turnos[turno][UF];
  assert(shaUrl, `Não foi possível encontrar url para turno:${turno} UF:${UF}`);

  const downloadUrl = shaUrl.replace('.sha512', '');

  validateHashUrl(shaUrl)
    .then(downloadContent)
    .then(getZipFile(downloadUrl))
    .then(validateFileHash)
    .then(unzipLocalFile)
    .then(processCsvBuffer(candidateType, indexes))
    .then(buildAndDisplayReport)
    .catch(dealWithError);
};

run(__filename, init);

module.exports = {
  unzipFile,
  init,
  headersList,
};
