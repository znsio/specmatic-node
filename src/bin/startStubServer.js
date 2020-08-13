const startStubServer = () => {
  const execSh = require('exec-sh');
  const path = require('path');
  const jarPath = path.resolve('qontract.jar');
  const contractsPath = path.resolve('*.qontract');
  
  execSh(
    `java -jar ${jarPath} stub ${contractsPath}`,
    {  },
    err => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

startStubServer();