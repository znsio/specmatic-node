import execSh from 'exec-sh';
import path from 'path';
import { specmaticJarPathLocal } from '../config';

const callSpecmaticCli = (args?: string[]) => {
  const specmaticJarPath = path.resolve(specmaticJarPathLocal);
  const cliArgs = (args || process.argv).slice(2).join(' '); 

  console.log('starting specmatic server', cliArgs)
  execSh(
    `java -jar ${specmaticJarPath} ${cliArgs}`,
    {  },
    (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
};

export default callSpecmaticCli;