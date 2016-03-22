var assert = require( 'assert' )
  , cdAgent = require( 'cd-agent' ); 
  
function CWDManager() {

  this.changeDir = function(o) {
    assert( typeof o !== 'undefined' );
    console.log( 'changedir' );
  /*
    cdAgent({ 
        argv: o.argv,
        cwd: process.cwd()
      }, 
      function(cwd, list) {
        console.log( 'chnanged' );

        delete o.argv;
        
        if (typeof cwd !== 'undefined') {
          o.cwd = cwd;
          process.chdir(cwd);
        }
        if (typeof list !== 'undefined') {
          o.context = list;
        }
        o.next(); 
      });
*/
    setTimeout( o.next.bind(o), 1000 ); 
  };
}

module.exports = CWDManager;