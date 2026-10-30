#!/data/data/com.termux/files/usr/bin/sh
# mochii phone seat — stop llama-server (Route A)
# (Closing Termux or Ctrl+C in the server session also works; this is the tidy way.)
pkill -f "llama-server" 2>/dev/null && echo "mochii seat stopped." || echo "no llama-server running."
command -v termux-wake-unlock >/dev/null 2>&1 && termux-wake-unlock || true
