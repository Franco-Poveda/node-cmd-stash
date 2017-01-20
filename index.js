#!/usr/bin/env node
'use strict'

const fs = require('fs'),
  https = require('https'),
  ncp = require('copy-paste'),
  colors = require('colors'),
  sqlite3 = require('sqlite3');

const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const filePath = homePath + '/stash.db';
const exists = fs.existsSync(filePath);
const db = new sqlite3.Database(filePath);

db.serialize(() => {
  if (!exists) {
    db.run("CREATE TABLE stash (cmd TEXT)");
  }
});

const stmt = db.prepare("INSERT INTO stash VALUES (?)");

const options = (type) => {
  let actions = {
    'push': push,
    'p': push,
    'list': list,
    'l': list,
    'get': get,
    'g': get,
    'pop': pop,
    'save': save,
    's': save,
    'default': def
  };
  return (actions[type] || actions['default'])();
}


const push = () => {
  const argcmd = process.argv.slice(3);
  const command = argcmd.join(' ');
  stmt.run(command);
  stmt.finalize();
}

const list = () => {
  console.log("[ID]\t".green.bold + "[COMMAND]".green.bold);
  db.each("SELECT rowid as id, cmd FROM stash", (err, row) => {
    console.log("[" + row.id.toString().cyan.bold + "]\t" + row.cmd.toString().yellow);
  });
}

const pop = () => {
  db.run("DELETE FROM stash WHERE rowid = " + args[1], () => process.exit());
}

const get = () => {
  db.get("SELECT cmd FROM stash where rowid ==" + args[1] + " limit 1", function (err, row) {
    if (row === undefined) {
      console.log("id ".red + "[" + args[1].cyan.bold + "]" + " not found".red);
      process.exit();

    }
    ncp.copy(row.cmd, () => process.exit());
  });
}
const save = () => {
  let response = "",
    cmdList = "";

  db.all("SELECT rowid as id, cmd FROM stash", (err, rows) => {
    rows.forEach(function (value) {
      cmdList += "[" + value.id + "]\t" + value.cmd + "\n"
    });
    var options = {
      headers: {
        "user-agent": "node-cmd-stash",
        "Content-Type": "application/json"
      },
      hostname: 'api.github.com',
      port: 443,
      path: '/gists',
      method: 'POST',
    };
    var req = https.request(options, (res) => {

      if (res.statusCode !== 201) {
        console.log("stash not uploaded...".red);


      }
      res.on('data', (d) => {
        response += d.toString();
      });
    });
    const data = {
      "description": "Saved command stash",
      "public": "true", "files": { "stash.list": { "content": cmdList } }
    };
    req.write(JSON.stringify(data));
    req.end();

    req.on('close', () => {
      const res = JSON.parse(response);
      ncp.copy(res.html_url, () => {
        console.log("[".white.bold + res.html_url.bold.underline.magenta + "]".white.bold);
        process.exit();
      });
    });
    req.on('error', (e) => {
      console.log("stash not uploaded...".red);
    });
  });
}

const def = () => {
  const save = args.join(' ');
  stmt.run(save);
  stmt.finalize();
}

const args = process.argv.slice(2);
options(args[0]);

