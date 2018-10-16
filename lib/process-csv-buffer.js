const { spinner } = require('../lib/spinner');

const lineBreak = Buffer.from('\r\n');
const breakLen = lineBreak.length;

const getCandidateStructure = () => ({
  percentage: '',
  votes: 0,
  formatted: '',
});
/*
const processLine = (_buffers, initials, candidateType, indexes) => new Promise((resolve) => {
  const message = 'Processing lines';
//   spinner.start(`${message} ...`);

  const buffers = Array.isArray(_buffers) ? _buffers : [_buffers];
  // const numOfBuffers = buffers.length;
  const {benford, candidates} = initials;

  const bufferLinesCounter = Array.from({length: buffers.length}, () => 0);
  let counter = 0;
  let goOn = undefined;
  let previouLine = '';

  const innerProcess = (previous = 0, bufferIndex = 0) => {
    const buffer = buffers[bufferIndex];
    const index = buffer.indexOf(lineBreak, previous) + breakLen;
    // const lineBuffer = buffer.slice(previous + breakLen, index);
    const lineBuffer = buffer.slice(previous, index);
    const line = lineBuffer.toString();

    console.log(`${(''+counter).padStart(5)} ${(''+bufferIndex).padStart(5)} ${line.substr(0, 120)}...${JSON.stringify(line.substr(-20))}`);

    if (goOn === false || (line.length === 0 && !buffers[bufferIndex + 1])) {
      console.log('');
      spinner.text = `${message} line.length ${line.length}`;
      spinner.succeed();
      return resolve(initials);
    }

    ++counter;
    bufferLinesCounter[bufferIndex]++;

    const splitLine = line.split(';');
    const splitLineLength = splitLine.length;
    // if (bufferIndex % 100 === 0) console.log({splitLineLength, numOfBuffers, bufferIndex, bufferLength: buffer.length, previous, index, counter});
    if (splitLineLength > 42) {
      console.log({previouLine, line});
      throw new Error(`Line number ${counter} has splitLineLength > 42 [${splitLineLength}]`);
    }

    if (splitLineLength < 42 || index === -1) {
      const lessThan42Message = `Line number ${counter} has splitLineLength < 42 [${splitLineLength}]`;

      console.log({previouLine, line, 'line.length': line.length, 'lineBuffer.length': lineBuffer.length, bufferIndex});
      if (!buffers[bufferIndex + 1]) {
        throw new Error(`${lessThan42Message} | buffers.length [${buffers.length}] | bufferIndex [${bufferIndex}]`);
      }

      console.log({lessThan42Message});
      if (lineBuffer.length > 0 ){
          const nextBuffer = buffers[bufferIndex + 1];
          const newNextBuffer = Buffer.concat([lineBuffer, nextBuffer]);
    
          buffers[bufferIndex + 1] = newNextBuffer;
      }

    //   return setImmediate(() => innerProcess(0, bufferIndex + 1));
      return setTimeout(() => innerProcess(0, bufferIndex + 1), 1000);
    }

    previouLine = line;

    spinner.text = `${message} ${counter}`;

    const [CD_CARGO_PERGUNTA, NR_VOTAVEL, QT_VOTOS] = indexes.map(i => splitLine[i].replace(/"/g, ''));

    if (CD_CARGO_PERGUNTA !== candidateType) {
      if (goOn === true) {
        console.log('\n----\n',{
            line,
            CD_CARGO_PERGUNTA,
            NR_VOTAVEL,
            QT_VOTOS,
            indexes,
            bufferIndex,
            bufferLinesCounter: bufferLinesCounter[bufferIndex],
        });
        goOn = false;
      }
      return setImmediate(() => innerProcess(index, bufferIndex));
    }

    goOn = true;

    if (!candidates[NR_VOTAVEL]) candidates[NR_VOTAVEL] = getCandidateStructure();

    candidates[NR_VOTAVEL].votes += +QT_VOTOS;
    initials.candidatesTotal     += +QT_VOTOS;

    const initialDigit = QT_VOTOS.substr(0, 1);
    if (!benford[initialDigit]) return setImmediate(() => innerProcess(index, bufferIndex));

    // process.stdout.write(`${counter},`);
    // if (counter % 100 === 0) setImmediate(() => spinner.text = `${message} ${counter}`);
    benford[initialDigit].times++;
    initials.benfordsTotal++;

    // rows.push(row);

    // the current index is the next previous
    return setImmediate(() => innerProcess(index, bufferIndex));
  };

  innerProcess();
});
*/

const es = require('event-stream');
const processLine = (entry, initials, candidateType, indexes) => new Promise((resolve) => {
  const message = 'Processing lines';
  spinner.start(`${message} ...`);

  const buffers = Array.isArray(entry) ? entry : [entry];
  const {benford, candidates} = initials;

  let counter = 0;
  let goOn = undefined;

  const split   = es.split();
  const mapSync = es.mapSync((line) => {
    ++counter;
    // spinner.text = `${message} ${counter}`;

    if (goOn === false) return;

    const splitLine = line.split(';');

    const [CD_CARGO_PERGUNTA, NR_VOTAVEL, QT_VOTOS] = indexes.map(i => (''+splitLine[i]).replace(/"/g, ''));

    if (CD_CARGO_PERGUNTA !== candidateType) {
      if (goOn === true) {
        console.log('\n----\n',{
            line,
            CD_CARGO_PERGUNTA,
            NR_VOTAVEL,
            QT_VOTOS,
        });
        goOn = false;
        return mapSync.end();
      }
    }

    goOn = true;

    if (!candidates[NR_VOTAVEL]) candidates[NR_VOTAVEL] = getCandidateStructure();

    const numberOfVotes = +QT_VOTOS;
    if (Number.isNaN(numberOfVotes)) return console.log({numberOfVotes, QT_VOTOS});

    candidates[NR_VOTAVEL].votes += numberOfVotes;
    initials.candidatesTotal     += numberOfVotes;

    const initialDigit = QT_VOTOS.substr(0, 1);
    if (!benford[initialDigit]) return console.log({initialDigit, numberOfVotes, QT_VOTOS});

    // process.stdout.write(`${counter},`);
    if (counter % 100 === 0) setImmediate(() => spinner.text = `${message} ${counter}`);
    benford[initialDigit].times++;
    initials.benfordsTotal++;
  });

  entry
    .pipe(split)
    .pipe(mapSync)
    .on('end', () => {
      spinner.succeed();
      resolve(initials);
    });
});

const getReportingStructure = () => ({
  benford: {
    1: {percentage: 0, times: 0},
    2: {percentage: 0, times: 0},
    3: {percentage: 0, times: 0},
    4: {percentage: 0, times: 0},
    5: {percentage: 0, times: 0},
    6: {percentage: 0, times: 0},
    7: {percentage: 0, times: 0},
    8: {percentage: 0, times: 0},
    9: {percentage: 0, times: 0},
  },
  benfordsTotal: 0,
  candidates: {},
  candidatesTotal: 0,
});

const processCsvBuffer = (candidateType, indexes) => (csvBuffer) => {
  const initials = getReportingStructure();

  // returning a promise should create the chain
  return processLine(csvBuffer, initials, candidateType, indexes);
};

module.exports = {
  processCsvBuffer,
  getCandidateStructure,
};
