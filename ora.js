const ora = require('ora');

const spinner = ora('Loading unicorns').start();

setTimeout(() => {
  spinner.color = 'yellow';
  spinner.text = 'Loading rainbows';
}, 1000);

setTimeout(() => {
  spinner.color = 'red';
  spinner.text = 'Loading something';
}, 2000);

setTimeout(() => {
  spinner.color = 'blue';
  spinner.text = 'Loading something else';
}, 3000);


setTimeout(() => {
  spinner.stop();
  console.log('done');
}, 10000);