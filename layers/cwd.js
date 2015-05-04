var cdAgent = require( 'cd-agent' ); 
  
function CWDManager() {

  this.changeDir = function(o) {
    cdAgent({ 
        argv: o.argv,
        cwd: process.cwd()
      }, 
      function(cwd, list) {
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
  };
}

module.exports = CWDManager;