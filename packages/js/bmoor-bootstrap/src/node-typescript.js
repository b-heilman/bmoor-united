import {register} from 'node:module';
import {pathToFileURL} from 'node:url';

process.on('uncaughtException', (err) => {
	console.log(err.stack);
});

register('ts-node/esm', pathToFileURL('./'));
