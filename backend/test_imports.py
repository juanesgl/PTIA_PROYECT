import sys
import os

try:
    import main
    print("Imports successful! Syntax is OK.")
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
