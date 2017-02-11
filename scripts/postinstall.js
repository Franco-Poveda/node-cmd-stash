#!/usr/bin/env node
'use strict'

const fs = require('fs');
const sqlite3 = require('sqlite3');
require('colors');

const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
const filePath = homePath + '/stash.db';
const exists = fs.existsSync(filePath);
const db = new sqlite3.Database(filePath);


if (exists) {
    db.get("SELECT count(rowid) AS c FROM sqlite_master WHERE type='table' AND name='pack';", function (err, migrate) {
        if (migrate.c === 0) {
            db.serialize(() => {
                console.log("\u2731 ".blue.bold + "Seems you updated stash from a previous version.".yellow);
                console.log("\u2731 ".blue.bold + "Running the database migration.".yellow);
                db.run("ALTER TABLE stash ADD COLUMN bid INTEGER");
                db.run("CREATE TABLE pack (name TEXT)");
                db.run("CREATE TABLE state (pack INTEGER)");
                db.run("INSERT INTO pack VALUES ('default')");
                db.run("INSERT INTO state VALUES (1)");
                db.run("UPDATE stash SET bid = 1");
            });
        }
    });
}
else {
    db.serialize(() => {
        db.run("CREATE TABLE stash (cmd TEXT, bid INTEGER)");
        db.run("CREATE TABLE pack (name TEXT)");
        db.run("CREATE TABLE state (pack INTEGER)");
        db.run("INSERT INTO pack VALUES ('default')");
        db.run("INSERT INTO state VALUES (1)");
    });
}
