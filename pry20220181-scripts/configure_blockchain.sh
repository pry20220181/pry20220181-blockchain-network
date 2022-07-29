#Ruta inicial donde debe ejecutarse: /opt/gopath/src/github.com/hyperledger/fabric/peer
export CHANNEL_NAME=vaccination


######Configuración Solución: Creación de Canal######
echo "Configuración Solución: Creación de Canal"
peer channel create -o orderer.pry20220181.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/pry20220181.com/orderers/orderer.pry20220181.com/msp/tlscacerts/tlsca.pry20220181.com-cert.pem
echo "Canal $CHANNEL_NAME creado"
######################################################

######Configuración Solución: Asignación de Organizaciones al Canal######
echo "Configuración Solución: Asignación de Organizaciones al Canal"
peer channel join -b vaccination.block

CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/users/Admin@minsa.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.minsa.pry20220181.com:7051 CORE_PEER_LOCALMSPID="MinsaMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/peers/peer0.minsa.pry20220181.com/tls/ca.crt peer channel join -b vaccination.block

CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/users/Admin@hospitals.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.hospitals.pry20220181.com:7051 CORE_PEER_LOCALMSPID="HospitalsMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/peers/peer0.hospitals.pry20220181.com/tls/ca.crt peer channel join -b vaccination.block
echo "Organizaciones unidas al canal $CHANNEL_NAME"
######################################################

######Configuración Solución: Asignación de Anchors Peers a Organizaciones####
echo "Configuración Solución: Asignación de Anchors Peers a Organizaciones"
peer channel update -o orderer.pry20220181.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/SuSaludMSP.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/pry20220181.com/orderers/orderer.pry20220181.com/msp/tlscacerts/tlsca.pry20220181.com-cert.pem

CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/users/Admin@minsa.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.minsa.pry20220181.com:7051 CORE_PEER_LOCALMSPID="MinsaMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/peers/peer0.minsa.pry20220181.com/tls/ca.crt peer channel update -o orderer.pry20220181.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/MinsaMSP.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/pry20220181.com/orderers/orderer.pry20220181.com/msp/tlscacerts/tlsca.pry20220181.com-cert.pem

CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/users/Admin@hospitals.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.hospitals.pry20220181.com:7051 CORE_PEER_LOCALMSPID="HospitalsMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/peers/peer0.hospitals.pry20220181.com/tls/ca.crt peer channel update -o orderer.pry20220181.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/HospitalsMSP.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/pry20220181.com/orderers/orderer.pry20220181.com/msp/tlscacerts/tlsca.pry20220181.com-cert.pem
echo "Peers unidos a sus organizacione respectivas"
######################################################

echo "Blockchain lista para desplegar Smart Contracts...."

########Despliegue de Smart Contracts/Chaincode#######
echo "Despliegue de Smart Contracts/Chaincode"
export CHANNEL_NAME=vaccination
export CHAINCODE_NAME=vaccinationcontrol
export CHAINCODE_VERSION=1
export CC_RUNTIME_LANGUAGE=node
export CC_SRC_PATH="../../../chaincode/$CHAINCODE_NAME/"
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/pry20220181.com/orderers/orderer.pry20220181.com/msp/tlscacerts/tlsca.pry20220181.com-cert.pem
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION} >&log.txt
echo "Chaincode empaquetado...."
peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
echo "Chaincode instalado en Org SuSalud"
echo "Antes de instalas en las Org restantes, por favor inserte el chaincode id:"
read chaincode_id
echo "Gracias! Chaincode recibido: $chaincode_id"
export CHAINCODE_ID=$chaincode_id
export CHAINCODE_SEQUENCE=1
echo "Se continua con la instalacion....."

CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/users/Admin@minsa.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.minsa.pry20220181.com:7051 CORE_PEER_LOCALMSPID="MinsaMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/peers/peer0.minsa.pry20220181.com/tls/ca.crt peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
echo "Chaincode instalado en Org Minsa"

CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/users/Admin@hospitals.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.hospitals.pry20220181.com:7051 CORE_PEER_LOCALMSPID="HospitalsMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/peers/peer0.hospitals.pry20220181.com/tls/ca.crt peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
echo "Chaincode instalado en Org Hospitals"
echo "Chaincode $CHAINCODE_NAME desplegado. Se procede a definir las Politicas de Endorsamiento y a iniciar el Chaincode"
######################################################

########Definición de Politicas de Endorsamiento para Smart Contracts/Chaincode#######
echo "Definición de Politicas de Endorsamiento para Smart Contracts/Chaincode"
peer lifecycle chaincode approveformyorg --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --sequence ${CHAINCODE_SEQUENCE} --waitForEvent --signature-policy "OR ('SuSaludMSP.peer','MinsaMSP.peer','HospitalsMSP.peer')" --package-id ${CHAINCODE_ID}
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/users/Admin@minsa.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.minsa.pry20220181.com:7051 CORE_PEER_LOCALMSPID="MinsaMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/peers/peer0.minsa.pry20220181.com/tls/ca.crt peer lifecycle chaincode approveformyorg --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --sequence ${CHAINCODE_SEQUENCE} --waitForEvent --signature-policy "OR ('SuSaludMSP.peer','MinsaMSP.peer','HospitalsMSP.peer')" --package-id ${CHAINCODE_ID}
CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/users/Admin@hospitals.pry20220181.com/msp CORE_PEER_ADDRESS=peer0.hospitals.pry20220181.com:7051 CORE_PEER_LOCALMSPID="HospitalsMSP" CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/peers/peer0.hospitals.pry20220181.com/tls/ca.crt peer lifecycle chaincode approveformyorg --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --sequence ${CHAINCODE_SEQUENCE} --waitForEvent --signature-policy "OR ('SuSaludMSP.peer','MinsaMSP.peer','HospitalsMSP.peer')" --package-id ${CHAINCODE_ID}
echo "Politicas de Endorsamiento definidas, por favor revisar: "
peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --sequence ${CHAINCODE_SEQUENCE} --signature-policy "OR ('SuSaludMSP.peer','MinsaMSP.peer','HospitalsMSP.peer')" --output json
######################################################

#######Puesta en Ejecución de Smart Contracts/Chaincode#######
echo "Puesta en Ejecución de Smart Contracts/Chaincode"
peer lifecycle chaincode commit -o orderer.pry20220181.com:7050 --tls --cafile $ORDERER_CA --peerAddresses peer0.susalud.pry20220181.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/susalud.pry20220181.com/peers/peer0.susalud.pry20220181.com/tls/ca.crt --peerAddresses peer0.minsa.pry20220181.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/minsa.pry20220181.com/peers/peer0.minsa.pry20220181.com/tls/ca.crt --peerAddresses peer0.hospitals.pry20220181.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/hospitals.pry20220181.com/peers/peer0.hospitals.pry20220181.com/tls/ca.crt --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CHAINCODE_VERSION --sequence ${CHAINCODE_SEQUENCE} --signature-policy "OR ('SuSaludMSP.peer','MinsaMSP.peer','HospitalsMSP.peer')"
echo "Chaincode $CHAINCODE_NAME iniciado. Ya puede ejecutar queries para guardar o consultar informacion"
######################################################

#####Insercion de Registros#####PARA UN RELEASE OFICIAL PODRIA QUITARLO
echo "Insercion de Registros"
peer chaincode invoke -o orderer.pry20220181.com:7050 --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["RegisterDoseAdministration","2ef7c3db-fccc-4830-a75f-8fd375c70et6","2","2","2", "2", "2022-08-21T04:04:37.473Z", "0", "0"]}'
peer chaincode invoke -o orderer.pry20220181.com:7050 --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["RegisterDoseAdministration","7e0363db-fccc-4d70-a75f-8fd375c7056d","1","1","1", "1", "2022-08-21T04:04:37.473Z", "0", "0"]}'
peer chaincode invoke -o orderer.pry20220181.com:7050 --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n $CHAINCODE_NAME -c '{"Args":["RegisterDoseAdministration","6e0753db-fccc-4830-a75f-8fd375c7057g","2","1","1", "2", "2022-08-21T04:04:37.473Z", "0", "0"]}'
################################
