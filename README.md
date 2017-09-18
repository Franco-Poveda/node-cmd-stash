![stash_logo](https://cloud.githubusercontent.com/assets/11579281/22157644/439ed802-df17-11e6-9178-05591a3daa9b.png)
[![Build Status](https://travis-ci.org/Franco-Poveda/node-cmd-stash.svg?branch=master)](https://travis-ci.org/Franco-Poveda/node-cmd-stash)
==================

[![Greenkeeper badge](https://badges.greenkeeper.io/Franco-Poveda/node-cmd-stash.svg)](https://greenkeeper.io/)

node-cmd-stash
==================

 **Usefull tool for:**
 * save
 * list
 * retrive (to clipboard)
 * delete
 * export list to gist
 * manage list groups (packs)
 * execute
 
 **your important shell commands.**


Install
-------

```
npm install -g command-stash

```
NOTE: For "copy to clipboard" functionality you need, [`xclip`](http://www.cyberciti.biz/faq/xclip-linux-insert-files-command-output-intoclipboard/) (for Linux, FreeBSD, and OpenBSD), and [`clip`](http://www.labnol.org/software/tutorials/copy-dos-command-line-output-clipboard-clip-exe/2506/) (for Windows). Pbcopy/pbpaste already installed on OSX.

Currently only works with nodejs >= v6.9.3 due ES6 use. 

Usage
-----

![output](https://cloud.githubusercontent.com/assets/11579281/22849760/d68d2240-efde-11e6-9a8e-c3fea9b36b01.gif)


```bash
#stash some commands 
#NOTE: stash [push | p] <command> olso works

stash docker run -d --hostname MQ37 --name mq37 -p 5672:5672 f00f2babc0bd
stash "for i in {1..40}; do node ./publisher.js; done"
stash sudo nmap -n -PN -sT -sU -p- remote_host

# list stashed commands:
stash [list | l]

# get a stashed command copied to your clipboard:
stash [get | g] <id>

# remove a stashed command from the list:
stash pop <id>

# save your list to a anonymous gits (https://gist.github.com/) and retrives the link :
stash save 

# exec a stashed command:
stash [exec | run] <id>

# Run detached, optional custom stdout filepath redirection:
stash [exec | run] <id> detached <stdout_filepath :: defaults to './<id>.out' >

# list packs of stashed commands:
stash pack list

# Switch between packs:
stash pack switch <id|name>

# Add a new pack:
stash pack add <name>

# Remove a entirly pack:
stash pack remove <id>
```


 Changelog
----------

1.5.0:

Added autocompletion generation and install (for Bash and Zsh).

Now, stash notifies when a new release of the tool is available for update.

1.4.0:

Running commands within stash is more stable.

Now, you can run commands detached, and specify the stdout piping file path.

1.3.0:

Added "packs" functionality.

Added "exec" option.

General code refactory.

ESlint.

postinstall migration script for safe 1.2.0 to 1.3.0 update.


1.2.0:

Added "save" option. 

This publish your current command stash at a anonymous gist via the github api and retrives the link to your cb.


Added options aliases.

