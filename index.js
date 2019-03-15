var fs = require("fs")
var path = require("path")

function UnusedFilesPlugin(options) {
  this.options = options;
}

function isNodeModulePath( path ) {
    return !!(
        !path ||
        path.toString().indexOf( 'node_modules' ) > -1 ||
        path.toString().indexOf( './~/' ) > -1
    );
}

function readDirSync(dir, result){
  console.log('walk dir: '+dir + JSON.stringify(result))
  var pa = fs.readdirSync(dir, result);
  pa.forEach(function(ele,index){
    var cur = path.join(dir,ele)
    var info = fs.statSync(cur)  
    if(info.isDirectory()){
      readDirSync(cur, result);
    }else{
      result.push(cur)
    } 
  })
}

UnusedFilesPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {

      console.log('UnusedFilesPlugin is running ==========');
      console.log('this.options: '+JSON.stringify(this.options));

      
      //walk all the files in src path

      var allFiles = [];
      var dependency = {};
      
      var root = path.join(__dirname,'../', this.options.srcDir)

      console.log('__dirname='+__dirname)

      readDirSync(root,allFiles);

      compilation.fileDependencies.filter(filepath => !isNodeModulePath( filepath )).map(filepath => {
        console.log('file dependency: '+filepath);
        dependency[filepath] = true;
      });

      var unused = [];
      allFiles.map(file=>{
        if(!dependency[file])
          console.log("found unused file : "+file)
          unused.push(file)
      });


      fs.writeFile('./unused_files.json', JSON.stringify({'total':unused.length, 'fileList':unused}), (err) => {
        if (err) {
          console.log('写入文件操作失败');
        } else {
          console.log('写入文件操作成功');
        }
      });

      console.log('UnusedFilesPlugin is done ==========');
      callback()
    });
};

module.exports = UnusedFilesPlugin;