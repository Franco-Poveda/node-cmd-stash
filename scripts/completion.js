path = require("path");
fs = require("fs");

getShell = function () {
    var SHELL;
    SHELL = process.env.SHELL;
    if (SHELL.match(/bash/)) {
        return 'bash';
    } else if (SHELL.match(/zsh/)) {
        return 'zsh';
    }
};

getInitFile = function () {
    var fileAt, fileAtHome;
    fileAt = function (root) {
        return function (file) {
            return path.join(root, file);
        };
    };
    fileAtHome = fileAt(process.env.HOME);
    switch (getShell()) {
        case 'bash':
           return fileAtHome(['.bashrc', '.bash_profile', '.profile'].find(f => {
                return fs.existsSync(fileAtHome(f));
            }));
        case 'zsh':
            return fileAtHome('.zshrc');
    }
};

setup = function () {
    var completionPath, initFile;
    initFile = this.getInitFile();

    function template(command) {
        return "\n# command-stash completion\n" + command +"\nalias sth=\"stash\"";
    };

    completionPath = path.join(fs.realpathSync(__dirname), 'stash.sh');
    fs.appendFileSync(initFile, template(". " + completionPath));
    require('child_process').execSync('. '+ completionPath,{shell: "/bin/bash"});
    
    return;
};

setup();