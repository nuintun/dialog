'use strict'

const fs = require('fs');
const rollup = require('rollup');
const uglify = require('uglify-js');

rollup.rollup({
  legacy: true,
  entry: 'src/dialog.js'
}).then(function(bundle) {
  let stat;
  const map = 'dialog.js.map';
  const src = 'dist/dialog.js';
  const min = 'dist/dialog.min.js';

  try {
    stat = fs.statSync('dist')
  } catch (e) {
    // no such file or directory
  }

  if (!stat) {
    fs.mkdirSync('dist');
  }

  let result = bundle.generate({
    format: 'umd',
    indent: true,
    useStrict: true,
    moduleId: 'dialog',
    moduleName: 'Dialog',
    globals: { jquery: 'jQuery' }
  });

  fs.writeFileSync(src, result.code);
  console.log(`  Build ${ src } success!`);

  result = uglify.minify(result.code, {
    fromString: true,
    compress: { screw_ie8: false },
    mangle: { screw_ie8: false },
    output: { screw_ie8: false },
    outSourceMap: map
  });

  fs.writeFileSync(min, result.code);
  console.log(`  Build ${ min } success!`);
  fs.writeFileSync(src + '.map', result.map.replace('"sources":["?"]', '"sources":["dialog.js"]'));
  console.log(`  Build ${ src + '.map' } success!`);
}).catch(function(error) {
  console.error(error);
});
