# To Destroy : 

#!/bin/bash

# Stop  and remove all running containers
docker compose -p memcrypt-saas down

# Remove all stopped containers images 
docker rmi $(docker images | grep memcrypt) 

docker rmi  postgres:16 alpine rnwood/smtp4dev:v3

# Remove all volumes
docker volume rm $(docker volume ls -q | grep memcrypt)


echo "All containers, images, and volumes of memcrypt-saas have been removed."
