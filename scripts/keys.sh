# Source this file from Bash: source scripts/keys.sh [--linq]
# Values live only in the current shell and its child processes.
if [ -z "${BASH_VERSION:-}" ]; then
  printf '%s\n' 'Open Bash first, then run: source scripts/keys.sh'
  return 1 2>/dev/null || exit 1
fi
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
  printf '%s\n' 'Use: source scripts/keys.sh (executing it cannot update your shell).'
  exit 1
fi
set +x
openinstinct_read_key() {
  local openinstinct_name="$1"
  if [ -z "${!openinstinct_name:-}" ]; then
    read -r -s -p "$openinstinct_name (hidden): " "$openinstinct_name" || return 1
    printf '\n'
  fi
  export "$openinstinct_name"
}
openinstinct_read_key BROWSERBASE_API_KEY || return 1
openinstinct_read_key AI_GATEWAY_API_KEY || return 1
if [ "${1:-}" = "--linq" ]; then
  openinstinct_read_key LINQ_API_KEY || return 1
  openinstinct_read_key LINQ_WEBHOOK_SECRET || return 1
  read -r -p 'Allowed sender phone numbers, comma-separated, e.g. +14165550123: ' LINQ_ALLOWED_SENDERS || return 1
  export LINQ_ALLOWED_SENDERS
fi
unset -f openinstinct_read_key
printf '%s\n' 'Credentials are available to commands in this shell. Nothing was written to disk.'
