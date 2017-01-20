![stash_logo](https://cloud.githubusercontent.com/assets/11579281/22157644/439ed802-df17-11e6-9178-05591a3daa9b.png)
==================

node-cmd-stash
==================

 Usefull tool for save, list and retrive (to clipboard) your important shell commands.


Install
-------

```
npm install -g command-stash

```
NOTE: For "copy to clipboard" functionality you need [`pbcopy/pbpaste`](https://developer.apple.com/library/mac/#documentation/Darwin/Reference/Manpages/man1/pbcopy.1.html) (for OSX), [`xclip`](http://www.cyberciti.biz/faq/xclip-linux-insert-files-command-output-intoclipboard/) (for Linux, FreeBSD, and OpenBSD), and [`clip`](http://www.labnol.org/software/tutorials/copy-dos-command-line-output-clipboard-clip-exe/2506/) (for Windows). Only tested with nodejs v7. 

Usage
-----

```bash
#stash some commands 
#NOTE: stash [push | p] <command> olso works

stash docker run -d --hostname MQ37 --name mq37 -p 5672:5672 f00f2babc0bd
stash "for i in {1..40}; do node ./publisher.js; done"
stash sudo nmap -n -PN -sT -sU -p- remote_host

# list stashed commands:
stash [list | l]
```

![List example](https://cloud.githubusercontent.com/assets/11579281/21877076/4dab4d96-d867-11e6-9044-4b487e1bc56d.png)

```bash
# get a stashed command copied to your clipboard:
stash [get | g] <id>

# remove a stashed command from the list:
stash pop <id>

# save your list to a anonymous gits (https://gist.github.com/) and retrives the link :
stash save 
```


 Changelog
----------

1.2.0:

Added "save" option. 

This publish your current command stash at a anonymous gist via the github api and retrives the link to your cb.


Added options aliases.

