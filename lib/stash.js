const https = require('https');

const ncp = require('copy-paste');
const fs = require('fs');
var _ = require('lodash');

const truncate = require('cli-truncate');
var querystring = require('querystring');

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
            '?': 'help',
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
            console.log(truncate("[" + row.id.toString().cyan.bold + "]\t" + row.cmd.toString().yellow, process.stdout.columns - 4));
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
    export() {
        if (this.args[1] === undefined) {
            console.log("no token!".bold.red, "usage: ".grey, "stash export <token>".cyan);
            process.exit();
        }
        const token = this.args[1];

        let response = "",
            cmdList = [];
        this.db.all("SELECT stash.rowid as id, stash.cmd, pack.name FROM stash JOIN pack ON stash.bid = pack.rowid", (err, rows) => {
            if (err) console.log(err);
            rows.forEach(function (value) {
                cmdList.push({ pack: value.name, cmd: value.cmd })
            });
            var red = _.mapValues(_.groupBy(cmdList, 'pack'),
                cl => cl.map(cmd => _.omit(cmd, 'pack')));

            Object.keys(red).forEach(function (k) {
                red[k] = red[k].map(pk => pk.cmd);
            });

            var post_data = querystring.stringify({
                'bkp': JSON.stringify(red),
                'access_token': token
            });


            var options = {
                hostname: 'api.cstash.cloud',
                port: 443,
                path: '/stash',
                method: 'POST',
                headers: {
                    "user-agent": "node-cmd-stash",
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(post_data)
                }
            };
            var req = https.request(options, (res) => {

                if (res.statusCode === 401) {
                    console.log("unauthorized token...".red);
                    process.exit();

                }
                if (res.statusCode === 201) {
                    console.log("local stash synched to ".cyan + " stash.cloud".bold.cyan);

                }
            });

            req.write(post_data);
            req.end();
            req.on('error', (e) => {
                console.log("stash not uploaded...".red, e);
            });
        });
    }
    import() {
        if (this.args[1] === undefined) {
            console.log("no token!".bold.red, "usage: ".grey, "stash import <token>".cyan);
            process.exit();
        }
        const token = this.args[1];

        var options = {
            hostname: 'api.cstash.cloud',
            port: 443,
            path: '/stash?access_token=' + token
        };

        var req = https.get(options, (res) => {
            var body = '';
            if (res.statusCode === 401) {
                console.log("unauthorized token...".red);
                process.exit();

            }
            if (res.statusCode === 200) {
                console.log("remote stash synched with ".cyan + " stash.cloud".bold.cyan);

            }
            // A chunk of data has been recieved.
            res.on('data', (chunk) => {
                body += chunk;
            });

            // The whole response has been received. Print out the result.
            res.on('end', () => {
                const bkp = JSON.parse(body);
                const packs = JSON.parse(bkp.bkp)
                Object.keys(packs).forEach(k => {
                    this.db.run("INSERT INTO pack (name) SELECT ? WHERE NOT EXISTS (SELECT 1 FROM pack WHERE name = ?)",k,k, (err,r) =>{
                        packs[k].forEach(c =>{
                            const stmt = this.db.prepare("INSERT INTO stash(cmd, bid) VALUES (?,(SELECT rowid FROM pack WHERE name = ?))");               
                            stmt.run(c, k);
                            stmt.finalize();
                        })
        
                    });
                });

            });
        });

        req.end();

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
    help() {
        console.log(`\n
        stash 1.5.4 - https://github.com/Franco-Poveda/node-cmd-stash \n
        Released under the MIT License.\n
        \n
        push p          stash some commands. This is default not nedded \n
        list l          list stashed commands\n
        get g           get a stashed command copied to your clipboard\n
        pop             remove a stashed command from the list\n
        export          export your stash to stash cloud\n
        import          import your stash from stash cloud\n
        pack            Manage your packs, (try stash pack ?)\n
        exec run        exec a stashed command. (detached and custom stdout options) \n        
        \n`);
    }
    def() {
        const stmt = this.db.prepare("INSERT INTO stash VALUES (?,?)");
        const save = this.args.join(' ');
        stmt.run(save, this.currpack);
        stmt.finalize();
    }
}

module.exports = Stash;
