sudo docker volume create portainer_data

sudo docker run -d -p 8000:8000 -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer

echo "Create the account in Portainer with user: admin and password: portaineradmin, select Docker mode and connect it"
xdg-open http://localhost:9000/

sleep 10

export CHANNEL_NAME=vaccination
export VERBOSE=false
export FABRIC_CFG_PATH=$PWD

sudo CHANNEL_NAME=$CHANNEL_NAME docker-compose -f docker-compose-cli-couchdb.yaml up -d