import configparser
from typing import Any, Dict


def ini_to_json(ini_content: str) -> Dict[str, Dict[str, Any]]:
    config = configparser.ConfigParser()
    config.read_string(ini_content)

    json_config = {}
    for section in config.sections():
        json_config[section] = {k: v for k, v in config[section].items()}

    return json_config


DEFAULT_INI_CONTENT = r"""
[MemcryptLog]
POST_IP=localhost
PORT=8888
LOCAL_LOG_LOCATION=C:\Windows\Detect\Temp\
DEBUG=false
[Analysis]
dir_to_analyse=
key=
nonce=
ipaddress=localhost
port=8888
infected_file=
dir_candidate_values=
recovery_file=C:\Windows\Detect\Temp\
remote=true
parallel=false
bulk=false
[Decryptor]
dir_candidate_values=
infected_file=
dir_candidates_folder=
dir_ransomware_folder=
dir_extracts_folder=
decrypts_folder=
recovery_file=C:\Windows\Detect\Temp\
safeext_filename=C:\Windows\Detect\SafeExt.csv
extensionvalidationfile=C:\Windows\Detect\fileidentifier.json
ransomwareparameterfile=C:\Windows\Detect\ransomware.json
time_limit=1800
remote=true
parallel=auto
algorithms=CHACHA20#256#NA,CHACHA8#256#NA,SALSA20#256#NA,AES#256#CBC,AES#256#CTR,AES#256#CFB
bulk=false
[Bands]
cpured=90
cpuamber=70
memred=90
memamber=70
diskred=90
diskamber=70
ioreadsred=100
ioreadsamber=20
iowritesred=100
iowritesamber=20
updatedeltared=30
updatedeltaamber=10
[MonitorStatistics]
ipaddress=localhost
port=8888
refreshinterval=10
[Whitelist]
inspect_folder=c:\
whitelist_path=C:\Windows\Detect\hashwhitelist.csv
hashes_number=
hash_size=
buffer_size=
remote=true
append=true
centralised=true
ipaddress=localhost
port=8888
[Extractor]
logswitch=silent
security_switch=off
extract_folder=C:\Windows\Detect\Temp
hash_filename=C:\Windows\Detect\hashwhitelist.csv
folder_filename=C:\Windows\Detect\folderwhitelist.enc
suspectext_filename=C:\Windows\Detect\SuspectExt.enc
safeext_filename=C:\Windows\Detect\SafeExt.enc
suspectext_killswitch=on
"""

DEFAULT_CONFIG = ini_to_json(DEFAULT_INI_CONTENT)
