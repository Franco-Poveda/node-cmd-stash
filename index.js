#!/usr/bin/env node
'use strict'

const fs      = require('fs'),
      ncp     = require('copy-paste'),
      colors  = require('colors'),
      sqlite3 = require('sqlite3');

const file = "stash.db";
const exists = fs.existsSync(file);
const db = new sqlite3.Database(file);

db.serialize(() => {
  if (!exists) {
    db.run("CREATE TABLE stash (cmd TEXT)");
  }
});

const stmt = db.prepare("INSERT INTO stash VALUES (?)");

const options = (type) => {
  const actions = {
    'push': () => {
      const argcmd = process.argv.slice(3);
      const command = argcmd.join(' ');
      stmt.run(command);
      stmt.finalize();
    },
    'list': () => {
      console.log("[ID]\t".green.bold + "[COMMAND]".green.bold);
      db.each("SELECT rowid as id, cmd FROM stash", (err, row) => {
        console.log("[" + row.id.toString().cyan.bold + "]\t" + row.cmd.toString().yellow);
      });
    },
    'get': () => {
      db.get("SELECT cmd FROM stash where rowid ==" + args[1] + " limit 1", function (err, row) {
        if (row === undefined) {
          console.log("id ".red + "[" + args[1].cyan.bold + "]" + " not found".red);
          process.exit();

        }
        ncp.copy(row.cmd, () => process.exit());
      });
    },
    'pop': () => {
      db.run("DELETE FROM stash WHERE rowid = " + args[1], () => process.exit());
    },
    'default': () => {
      const save = args.join(' ');
      stmt.run(save);
      stmt.finalize();
    }
  };
  return (actions[type] || actions['default'])();
}

const args = process.argv.slice(2);
options(args[0]);