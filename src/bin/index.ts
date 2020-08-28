#!/usr/bin/env node
import execSh from 'exec-sh';
import path from 'path';
import { qontractJarPathLocal } from '../config';

const startStubServer = () => {
  const qontractJarPath = path.resolve(qontractJarPathLocal);
  const args = process.argv.reduce((acc, arg, currentIndex) => {
    if(currentIndex === 0 || currentIndex === 1) { 
      return '';
    } 
    return acc + ' ' + arg; 
  });

  console.log(`java -jar ${qontractJarPath} ${args}`)

  console.log('starting qontract stub server')
  execSh(
    `java -jar ${qontractJarPath} ${args}`,
    {  },
    (err: any) => {
      if (err) {
        console.log('Exit code: ', err.code);
      }
    }
  );  
}

startStubServer();