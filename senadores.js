
const fs = require('fs');


const parseLine = (line) => {
  const [date, time, year, x, , uf, , cep, city, a, b, c, role, candidate, votes] = line.replace(/"/g, '').split(';');
  const o = {
    date, time, year, x, uf, cep, city, a, b, c, role, candidate, votes,
  };
  return o;
};

const init = async (filename) => {
  const result = await fs.promises.readFile(filename).then(buffer => buffer.toString().split('\n').map(parseLine));
  const roles = {};

  result.forEach(row => (roles[row.role] ? roles[row.role].push(row) : (roles[row.role] = [row])));

  const map = {};

  roles.SENADOR.forEach(({candidate, votes}) => {
    if (!map[candidate]) {
      const x = {};
      map[candidate] = x;
      Object.defineProperty(x, 'total', {writable: true, value:0});
    }

    const k = votes.substr(0, 1);

    if (!map[candidate][k]) map[candidate][k] = {percentage:null, value:0};

    map[candidate][k].value++;
  });

  Object.keys(map).forEach((candidate) => {
    const currentCandidate = map[candidate];
    const firstNumbers = Object.keys(currentCandidate);
    firstNumbers.forEach(number => currentCandidate.total += currentCandidate[number].value);
    firstNumbers.forEach(number => currentCandidate[number].percentage = ((currentCandidate[number].value / currentCandidate.total) * 100).toFixed(2) + ' %');
  });

  // console.log(JSON.stringify(map, null, 2));
};

init(process.argv[2] || 'votacao_secao_2014_AL.txt');
