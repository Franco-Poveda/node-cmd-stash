const readline = require('readline');

class Pack {
    constructor(db, currpack, args) {
        this.db = db;
        this.pack = currpack;
        this.args = args;
    }

    add() {
                const that = this;
        this.db.get("SELECT rowid FROM pack WHERE name = '" + this.args[1] + "' limit 1", function (err, row) {
            if (row === undefined) {
                that.db.run("INSERT INTO pack VALUES ('" + that.args[1] + "')");
                return 'pack ' + that.args[1] + ' created';
            }
            else {
                return "pack ".red + "[" + that.args[1] + "]".red + " alredy exists.".red;
            }
        });
    }

    list() {
        console.log("[ID]\t".green.bold + "[PACK]".green.bold);
        this.db.each("SELECT rowid as id, name FROM pack", (err, row) => {
            let formated = "[" + row.id.toString().cyan.bold + "]\t" + row.name.toString().yellow;
            formated += (row.id == this.pack) ? ' \u25C1'.cyan.bold : '';
            console.log(formated);
        });
    }

    switch() {
        const that = this;
        this.db.get("SELECT rowid FROM pack where rowid ='" + this.args[1] + "' OR name == '" + this.args[1] + "' limit 1", function (err, row) {
            if (row !== undefined) {
                that.db.run("UPDATE state SET pack = " + row.rowid);
            }
            else
                console.log("Can't find pack ".yellow + '[' + that.args[1].cyan.bold + ']');
        });
    }

    remove() {
       const that = this;
        if (this.pack != this.args[1]) {
            this.db.get("SELECT name FROM pack where rowid ==" + this.args[1] + " limit 1", function (err, row) {
                if (row !== undefined) {
                    that.db.get("SELECT COUNT(rowid) AS c FROM stash where bid ==" + that.args[1], function (err, count) {
                        console.log('\u2716 '.red.bold + 'About to remove pack [' + row.name.yellow.bold + '] with [' + count.c.toString().cyan.bold + '] stashed commands.');
                        const rl = readline.createInterface({
                            input: process.stdin,
                            output: process.stdout
                        });
                        rl.question('\u2716 '.red.bold + 'Are you sure? ' + '[Y/n] '.bold, (answer) => {
                            if (['y', 'Y', '', 'yes'].includes(answer)) {

                                that.db.run("DELETE FROM stash WHERE bid = " + that.args[1]);
                                that.db.run("DELETE FROM pack WHERE rowid = " + that.args[1]);

                            }
                            rl.close();
                        });
                    });
                }
                else
                    console.log("Can't find pack with ID ".yellow + '[' + that.args[1].cyan.bold + ']');
            });
        }
        else
            console.log("Can't remove current pack, switch to other pack first.".red);
    }
    help() {
        console.log(`\n
        stash 1.5.4 - https://github.com/Franco-Poveda/node-cmd-stash \n
        Released under the MIT License.\n
        \n
        add             Add a fresh pack\n
        list            list packs of commands\n
        switch          Switch between packs\n
        remove          Remove a entirly pack\n       
        \n`);
    }
    default() { console.log('invalid pack action'.red) }
}

module.exports = Pack;
