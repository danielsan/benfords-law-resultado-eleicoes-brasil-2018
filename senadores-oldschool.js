
const fs = require('fs');


const parseLine = (line) => {
  const [date, time, year, x, , uf, , cep, city, a, b, c, role, candidate, votes] = line.replace(/"/g, '').split(';'),
    o = {
      date, time, year, x, uf, cep, city, a, b, c, role, candidate, votes,
    };  return o;
};

const init = async (filename) => {
  const result = await fs.promises.readFile(filename).then(buffer => buffer.toString().split('\n').map(parseLine));
  const roles = {};

  for (let i = result.length; i--;) {
    const row = result[i];
    if (roles[row.role]) {
      roles[row.role].push(row);
    } else {
      roles[row.role] = [row];
    }
  }

  const map = {};

  roles.SENADOR.forEach(({candidateNumber, votes}) => {
    if (!map[candidateNumber]) {
      const x = {};
      map[candidateNumber] = x;
      Object.defineProperty(x, 'total', {writable: true, value:0});
    }

    const currentCandidateObj = map[ candidateNumber ];
    const firstNumber = votes.substr(0, 1);

    if (!currentCandidateObj[firstNumber]) {
      currentCandidateObj[firstNumber] = {percentage: null, value: 0};
    }

    currentCandidateObj[firstNumber].value++;
  });


  Object.keys(map).forEach((candidateNumber) => {
    const candidateObj = map[ candidateNumber ];
    const firstNumbers = Object.keys(candidateObj);
    const candidateKeysLength = firstNumbers.length;
    
    let number, firstNumber;
    
    console.log(firstNumbers);
    for (let i = 0; i < candidateKeysLength; i++) {
      firstNumber = firstNumbers[i];
      // {percentage: null, value: 0}
      console.log({firstNumber, firstNumbers});

      candidateObj.total += candidateObj[firstNumber].value;
    }

    for (let i = candidateKeysLength; i--;) {
      firstNumber = firstNumbers[i];
      candidateObj[firstNumber].percentage = ((candidateObj[firstNumber].value / candidateObj.total) * 100).toFixed(2) + ' %';
    }
  });

  console.log(JSON.stringify(map, null, 2));
};

init(process.argv[2] || 'votacao_secao_2014_AL.txt');
