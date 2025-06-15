import os
import logging

if "VERBOSE" in os.environ:
    logging_level = logging.DEBUG
elif "LOGGING" in os.environ:
    if os.environ["LOGGING"] == 'debug':
        logging_level = logging.DEBUG
    elif os.environ["LOGGING"] == 'info':
        logging_level = logging.INFO
    elif os.environ["LOGGING"] == 'warning':
        logging_level = logging.WARNING
    else:
        logging_level = logging.ERROR
else:
    logging_level = logging.WARNING

logging.basicConfig(level=logging_level)

def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)

    return logger