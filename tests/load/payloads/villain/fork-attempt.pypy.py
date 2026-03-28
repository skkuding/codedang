import os
import sys

# attempt to fork — should be blocked by sandbox
# falls back to CPU burn if fork is unavailable
try:
    while True:
        os.fork()
except (OSError, AttributeError):
    # sandbox blocked fork, fall back to CPU burn
    x = 0
    while True:
        x += 1
