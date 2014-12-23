var cdAgent = require( 'cd-agent' ); 
  
function CWDManager() {

  var home = process.cwd();

  this.changeDir = function(req, res) {
    cdAgent({ 
        argv: req.argv,
        cwd: process.cwd()
      }, 
      function(cwd, list) {
        delete req.argv;
        
        if (typeof cwd !== 'undefined') {
          res.cwd = cwd;
          process.chdir(cwd);
        }
        if (typeof list !== 'undefined') {
          res.context = list;
          context = list;
        }
        res.end();
      });
  };
}

module.exports = CWDManager;