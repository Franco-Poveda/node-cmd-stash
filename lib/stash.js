const https = require('https');
const ncp = require('copy-paste');
const fs = require('fs');
const spawn = require('child_process').spawn;

const Pack = require('./pack');

class Stash {
    constructor(db, currpack, args) {

        this.db = db;
        this.currpack = currpack;
        this.args = args;
    }

    pack() {
        const type = this.args[1];
        const pack = new Pack(this.db, this.currpack, this.args.slice(1));
        const actions = {
            'add': 'add',
            'list': 'list',
            'switch': 'switch',
            'remove': 'remove',
            'default': 'default'
        };
        return pack[(actions[type] || actions['default'])]();
    }

    push() {
        const stmt = this.db.prepare("INSERT INTO stash VALUES (?,?)");
        const argcmd = process.argv.slice(3);
        const command = argcmd.join(' ');
        stmt.run(command, this.currpack);
        stmt.finalize();
    }

    list() {
        console.log("[ID]\t".green.bold + "[COMMAND]\t".green.bold + this.currpack.toString().grey);
        this.db.each("SELECT rowid as id, cmd FROM stash WHERE bid = " + this.currpack, (err, row) => {
            console.log("[" + row.id.toString().cyan.bold + "]\t" + row.cmd.toString().yellow);
        });
    }

    pop() {
        const ids = this.args[1].split(",");
        ids.map(id => {
            this.db.run("DELETE FROM stash WHERE rowid = " + id);
        });
    }

    get() {
        this.db.get("SELECT cmd FROM stash where rowid ==" + this.args[1] + " limit 1", function (err, row) {
            if (row === undefined) {
                console.log("id ".red + "[" + this.args[1].cyan.bold + "]" + " not found".red);
                process.exit();

            }
            ncp.copy(row.cmd, () => process.exit());
        });
    }
    save() {
        const that = this;
        this.db.get("SELECT name FROM pack where rowid ==" + this.currpack + " limit 1", function (err, row) {
            let filename = row.name + ".stash.list";
            let response = "",
                cmdList = "";
            that.db.all("SELECT rowid as id, cmd FROM stash where bid == " + that.currpack, (err, rows) => {
                if (err) console.log(err);
                rows.forEach(function (value) {
                    cmdList += "[" + value.id + "]\t" + value.cmd + "\n"
                });

                let fileOpt = {};
                fileOpt[filename] = { "content": cmdList };

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
                    "public": "true",
                    "files": fileOpt
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
        });
    }

    run() {
        const id = this.args[1];
        const path = this.args[3];
        const detached = (this.args[2] == 'detached') ? true : false;
        let pipes = [0, 1, 2];

        this.db.get("SELECT cmd FROM stash where rowid ==" + id + " limit 1", function (err, row) {
            if (row === undefined) {
                console.log("id ".red + "[" + this.args[1].cyan.bold + "]" + " not found".red);
                process.exit();
            }
            if (detached) {
                const file = (path) ? path : './' + id + '.out';
                const out = fs.openSync(file, 'a');
                pipes = ['ignore', out, out];
            }
            let cmd = row.cmd.match(/"[^"]+"|'[^']+'|\S+/g);
            const child = spawn(cmd.shift(), cmd, {
                stdio: pipes,
                detached: detached
            });
            if (detached) child.unref();
        });
    }
    def() {
        const stmt = this.db.prepare("INSERT INTO stash VALUES (?,?)");
        const save = this.args.join(' ');
        stmt.run(save, this.currpack);
        stmt.finalize();
    }
}

module.exports = Stash;
