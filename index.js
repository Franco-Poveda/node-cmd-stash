#!/usr/bin/env node
'use strict'
const sqlite3 = require('sqlite3');
require('colors');

const Stash = require('./lib/stash');

const args = process.argv.slice(2);
const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const filePath = homePath + '/stash.db';
const db = new sqlite3.Database(filePath);

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({
	pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24
}).notify();

const options = (type) => {

  //Get current pack:
  db.get("SELECT pack FROM state limit 1", function (err, row) {
    if (err)
      console.log(err);
    const currpack = row.pack;

    const stash = new Stash(db, currpack, args);
    const actions = {
      'push': 'push',
      'p': 'push',
      'list': 'list',
      'l': 'list',
      'get': 'get',
      'g': 'get',
      'pop': 'pop',
      'save': 'save',
      's': 'save',
      'pack': 'pack',
      'pa': 'pack',
      'exec': 'run',
      'run': 'run',
      '?': 'help',
      'default': 'def'
    };
    return stash[(actions[type] || actions['default'])]();
  });
}

options(args[0]);
