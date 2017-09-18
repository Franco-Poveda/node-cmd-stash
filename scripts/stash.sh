#!/usr/bin/env bash

_stash() 
{
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"
    if [[ ${COMP_CWORD} = 1 ]] ; then
        opts="push list get pop run pack save"
        COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
        return 0
	  fi
    if [[ ${COMP_CWORD} = 2 ]] ; then
      case "$prev" in
        pack) 
          opts="add list switch remove"
          COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
        ;;
        get|pop|run) 
          opts=$(sth l | tail -n +2 | cut -f1)
          COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
        ;;
      esac
      return 0
	  fi
}

if [[ -n ${ZSH_VERSION-} ]]; then
  autoload -U +X bashcompinit && bashcompinit
fi

complete -F _stash stash