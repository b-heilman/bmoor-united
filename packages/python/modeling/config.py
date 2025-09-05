
"""
This is used to manage state variables and resource information.
This is the interface to the environment
"""
class Config:
    source_dir: str
    
    def __init__(self, source_dir: str):
        self.source_dir = source_dir