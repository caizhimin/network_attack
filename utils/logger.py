__author__ = 'cai'
import logging
import os


def get_logger(logger_name):
    logging.basicConfig(level=logging.DEBUG,
                        format='%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s',
                        datefmt='%a, %d %b %Y %H:%M:%S', filename=os.path.join(os.path.dirname(__file__),
                                                                               'network_attack.log'), filemode='a')
    console = logging.StreamHandler()
    console.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(name)-12s: %(levelname)-8s %(message)s')
    console.setFormatter(formatter)
    logger = logging.getLogger(logger_name)
    logger.addHandler(console)
    return logger

log = get_logger('network_attack')