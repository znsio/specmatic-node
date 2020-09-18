import execSh from 'exec-sh';
import path from 'path';
import { qontractJarPathLocal } from '../config';

const startQontractServer = (args?: string[]) => {
  const qontractJarPath = path.resolve(qontractJarPathLocal);
  const cliArgs = (args || process.argv).slice(2).join(' '); 

  console.log('starting qontract server', cliArgs)
  execSh(
    `java -jar ${qontractJarPath} ${cliArgs}`,
    {  },
    (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
};

export default startQontractServer;