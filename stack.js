var CD_Agent = require( 'cd-agent' )
  , AppStack = require( 'app-stack' )
  , logger = require( './logger.js')
  , splitargs = require( 'splitargs' );

function Stack(controller) {
  var app = new AppStack( controller )
    , agent = new CD_Agent( controller )
    , cwd = process.cwd()
    , context = [];

  app.use( split );
  app.use( logger );
  app.use( /cd\s+.*/, changeDir );

  this.request = app.request;

  function split(params, res) {
    res.argv = splitargs(params);
    res.end();
  }

  function changeDir(params, req) {
    controller.once( 'cwd', function(next) {
      cwd = next;
      console.log( 'cwd: ', cwd );
    });

    controller.once( 'ls', function(list) {
      context = list;
    });

    agent.process(req.argv, cwd);
  }
}

module.exports = Stack; 