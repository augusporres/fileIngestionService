import {processFile} from './worker/worker';

processFile().catch(err => {
    console.error("Error processing file:", err);
});