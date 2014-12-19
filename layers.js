var assert = require( 'assert' )
  , NRepeater = require( './layers/nrepeater.js' )
  , Executer = require( './layers/executer.js' )
  , Filter = require( './layers/filter.js' )
  , Splitter = require( './layers/splitter.js' )
  , nrep = new NRepeater()
  , exe = new Executer()
  , filter = new Filter()
  , splitter = new Splitter(); 

var Layers = {

  nRepeater: nrep.handle, 
  execute: exe.handle,
  filter: filter.handle, 
  split: splitter.handle
};

module.exports = Layers;