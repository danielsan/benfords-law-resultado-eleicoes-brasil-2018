const { spinner } = require('../lib/spinner');

const lineBreak = Buffer.from('\r\n');
const breakLen = lineBreak.length;

const getCandidateStructure = () => ({
  percentage: '',
  votes: 0,
  formattedVotes: '',
});

const processLine = (_buffers, initials, candidateType, indexes) => new Promise((resolve) => {
  const message = 'Processing lines';
  spinner.start(`${message} ...`);

  const buffers = Array.isArray(_buffers) ? _buffers : [_buffers];
  // const numOfBuffers = buffers.length;
  const {benford, candidates} = initials;

  let counter = 0;

  const innerProcess = (previous = 0, bufferIndex = 0) => {
    const buffer = buffers[bufferIndex];
    const index = buffer.indexOf(lineBreak, previous + breakLen);
    const lineBuffer = buffer.slice(previous + breakLen, index);
    const line = lineBuffer.toString();

    if (line.length === 0 && !buffers[bufferIndex + 1]) {
      console.log('');
      spinner.text = `${message} line.length ${line.length}`;
      spinner.succeed();
      return resolve(initials);
    }

    const splitLine = line.split(';');
    const splitLineLength = splitLine.length;
    // if (bufferIndex % 100 === 0) console.log({splitLineLength, numOfBuffers, bufferIndex, bufferLength: buffer.length, previous, index, counter});
    if (splitLineLength < 42 || index === -1) {
      const nextBuffer = buffers[bufferIndex + 1];
      const newNextBuffer = Buffer.concat([lineBuffer, nextBuffer]);

      buffers[bufferIndex + 1] = newNextBuffer;

      return setImmediate(() => innerProcess(0, bufferIndex + 1));
    }
    const [CD_CARGO_PERGUNTA, NR_VOTAVEL, QT_VOTOS] = indexes.map(i => splitLine[i].replace(/"/g, ''));

    ++counter;
    spinner.text = `${message} ${counter}`;

    if (CD_CARGO_PERGUNTA !== candidateType) return setImmediate(() => innerProcess(index, bufferIndex));

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
