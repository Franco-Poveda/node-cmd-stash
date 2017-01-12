var fs = require("fs");
var ncp = require("copy-paste");

var file = "test.db";
var exists = fs.existsSync(file);

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);


db.serialize(function () {
  if (!exists) {
    db.run("CREATE TABLE stash (cmd TEXT)");
  }
});
var stmt = db.prepare("INSERT INTO stash VALUES (?)");


// print process.argv
const args = process.argv.slice(2);

switch (args[0]) {
  case 'push':
    case 'p':

    const argcmd = process.argv.slice(3);
    const command = argcmd.join(' ');
    stmt.run(command);

    console.log('Pushed command: ', command);
    stmt.finalize();

    break;

  case 'list':
    case 'l':
    db.each("SELECT rowid as id, cmd FROM stash", function (err, row) {
      console.log(row.id + ": " + row.cmd);
    });
    break;

  case 'get':
    case 'g':

    db.get("SELECT cmd FROM stash where rowid =="+args[1]+" limit 1", function (err, row) {
      if(row === undefined) {
        console.log('bad id');
                process.exit();

      }
      console.log(row.cmd);
      ncp.copy(row.cmd, function () {
        console.log("copiado");
        process.exit();
      });
    });
    break;

    case 'pop':
     db.run("DELETE FROM stash WHERE rowid = "+args[1], function() {
              console.log("poped!");
        process.exit();
     });
     
    break;

    default:
    const save = args.join(' ');
    stmt.run(save);

    console.log('Pushed command: ', save);
    stmt.finalize();
    break;
}


