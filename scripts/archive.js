import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const output = fs.createWriteStream('pixelcrafter-project.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Archive created successfully: ${archive.pointer()} total bytes`);
  console.log('Archive has been finalized and the output file descriptor has closed.');
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files and directories, excluding specified patterns
archive.glob('**/*', {
  ignore: [
    'node_modules/**',
    'dist/**',
    '.git/**',
    '*.log',
    'pixelcrafter-project.zip'
  ]
});

// Finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();