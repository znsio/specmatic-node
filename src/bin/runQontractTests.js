const runQontractTests = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const jarPath = path.resolve('qontract.jar');
  const contractsPath = path.resolve('*.qontract');
  
  console.log('running qontract tests')
  execSh(
    `java -jar ${jarPath} test ${contractsPath}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

runQontractTests();