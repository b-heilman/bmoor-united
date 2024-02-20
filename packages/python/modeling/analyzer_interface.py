import sys

if sys.version_info >= (3, 8):
    from typing import TypedDict
else:
    from typing_extensions import TypedDict

class ModelAnalyzerResult(TypedDict):
    accuracy: float