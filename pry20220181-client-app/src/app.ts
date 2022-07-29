/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

const channelName = envOrDefault('CHANNEL_NAME', 'vaccination');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'vaccinationcontrol');
const mspId = envOrDefault('MSP_ID', 'MinsaMSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', 'pry20220181-network', 'crypto-config', 'peerOrganizations', 'minsa.pry20220181.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@minsa.pry20220181.com', 'msp', 'keystore'));

// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'User1@minsa.pry20220181.com', 'msp', 'signcerts', 'User1@minsa.pry20220181.com-cert.pem'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.minsa.pry20220181.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:8051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.minsa.pry20220181.com');

const utf8Decoder = new TextDecoder();
const doseId = `dose${Date.now()}`;

//#region Config Fastify web server
// ESM
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})


fastify.get('/administered-doses', async (request, reply) => {
    let result = await main().catch(error => {
        console.error('******** FAILED to run the application:', error);
        process.exitCode = 1;
    }); 
    // let result = "prueba host to vm"
    console.log("A retornar: ", result);
    return { hello: 'world', result: result }
  })
  
  /**
   * Run the server!
   */
  const start = async () => {
    try {
      await fastify.listen({ port: 3000, host: '0.0.0.0'}) //Si no se pone host, por defecto se pone en 127.0.0.1 y no se podra acceder desde fuera
    } catch (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  }

  start()
//#endregion

async function main(): Promise<any> {

    await displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    let result = null;

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of dose data on the ledger using the chaincode 'InitLedger' function.
        await initLedger(contract);

        // // Return all the current doses on the ledger.
        // await getAllDoses(contract);

        // // Create a new dose on the ledger.
        // await createDose(contract);

        // Return all the doses of the specified child on the ledger.
        // await getAllDosesByChildId(contract,'1');
        result = await getAllDosesByChildId(contract,'2');
        console.log("Call REsult: ", result);
        // // Update an existing dose asynchronously.
        // await transferDoseAsync(contract);

        // // Get the dose details by doseID.
        // await readDoseByID(contract);

        // // Update an dose which does not exist.
        // await updateNonExistentDose(contract)
    } finally {
        gateway.close();
        client.close();
        return result;
    }
}

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of doses on the ledger');

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllDoses(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetAllDoses, function returns all the current doses on the ledger');

    const resultBytes = await contract.evaluateTransaction('GetAllDoses');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Evaluate a transaction to query ledger state filtering by childId.
 */
 async function getAllDosesByChildId(contract: Contract, childId: string): Promise<any> {
    console.log('\n--> Evaluate Transaction: ReadDosesByChildId, function returns all the doses of the specified child on the ledger');

    const resultBytes = await contract.evaluateTransaction('ReadDosesByChildId', childId);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    //console.log(`*** Result (Doses of the Child ${childId}):`, result);
    return result;
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createDose(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: CreateDose, creates new dose with ID, Color, Size, Owner and AppraisedValue arguments');
    await contract.submitTransaction(
        'CreateDose',
        doseId,
        '2',
        '2',
        '2',
        '2',
        '2022-08-21T04:04:37.473Z',
        '0',
        '0'
    );

    console.log('*** Transaction committed successfully');
}

/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferDoseAsync(contract: Contract): Promise<void> {
    console.log('\n--> Async Submit Transaction: TransferDose, updates existing dose owner');

    const commit = await contract.submitAsync('TransferDose', {
        arguments: [doseId, 'Saptha'],
    });
    const oldOwner = utf8Decoder.decode(commit.getResult());

    console.log(`*** Successfully submitted transaction to transfer ownership from ${oldOwner} to Saptha`);
    console.log('*** Waiting for transaction commit');

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
    }

    console.log('*** Transaction committed successfully');
}

async function readDoseByID(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: ReadDose, function returns dose attributes');

    const resultBytes = await contract.evaluateTransaction('ReadDose', doseId);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * submitTransaction() will throw an error containing details of any error responses from the smart contract.
 */
async function updateNonExistentDose(contract: Contract): Promise<void>{
    console.log('\n--> Submit Transaction: UpdateDose dose70, dose70 does not exist and should return an error');

    try {
        await contract.submitTransaction(
            'UpdateDose',
            'dose70',
            'blue',
            '5',
            'Tomoko',
            '300',
        );
        console.log('******** FAILED to return an error');
    } catch (error) {
        console.log('*** Successfully caught the error: \n', error);
    }
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certPath:          ${certPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}