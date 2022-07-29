import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

export class Pry20220181Blockchain {
    /*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

    readonly channelName = this.envOrDefault('CHANNEL_NAME', 'vaccination');
    readonly chaincodeName = this.envOrDefault('CHAINCODE_NAME', 'vaccinationcontrol');
    readonly mspId = this.envOrDefault('MSP_ID', 'MinsaMSP');

    // Path to crypto materials.
    readonly cryptoPath = this.envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', 'pry20220181-network', 'crypto-config', 'peerOrganizations', 'minsa.pry20220181.com'));

    // Path to user private key directory.
    readonly keyDirectoryPath = this.envOrDefault('KEY_DIRECTORY_PATH', path.resolve(this.cryptoPath, 'users', 'User1@minsa.pry20220181.com', 'msp', 'keystore'));

    // Path to user certificate.
    readonly certPath = this.envOrDefault('CERT_PATH', path.resolve(this.cryptoPath, 'users', 'User1@minsa.pry20220181.com', 'msp', 'signcerts', 'User1@minsa.pry20220181.com-cert.pem'));

    // Path to peer tls certificate.
    readonly tlsCertPath = this.envOrDefault('TLS_CERT_PATH', path.resolve(this.cryptoPath, 'peers', 'peer0.minsa.pry20220181.com', 'tls', 'ca.crt'));

    // Gateway peer endpoint.
    readonly peerEndpoint = this.envOrDefault('PEER_ENDPOINT', 'localhost:8051');

    // Gateway peer SSL host name override.
    readonly peerHostAlias = this.envOrDefault('PEER_HOST_ALIAS', 'peer0.minsa.pry20220181.com');

    readonly utf8Decoder = new TextDecoder();

    /**
     * This type of transaction would typically only be run once by an application the first time it was started after its
     * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
     */
    async initLedger(contract: Contract): Promise<void> {
        console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of doses on the ledger');

        await contract.submitTransaction('InitLedger');

        console.log('*** Transaction committed successfully');
    }
    /**
     * Evaluate a transaction to query ledger state filtering by childId.
     */
    async getAllAdministeredDosesByChildId(contract: Contract, childId: string): Promise<any> {
        console.log('\n--> Evaluate Transaction: ReadDosesByChildId, function returns all the doses of the specified child on the ledger');

        const resultBytes = await contract.evaluateTransaction('ReadAdministeredDosesByChildId', childId);

        const resultJson = this.utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        //console.log(`*** Result (Doses of the Child ${childId}):`, result);
        return result;
    }

    /**
     * Submit a transaction synchronously, blocking until it has been committed to the ledger.
     */
    async registerDoseAdministration(contract: Contract, administeredDoseId: string): Promise<void> {
        console.log('\n--> Submit Transaction: CreateDose, creates new dose with ID, Color, Size, Owner and AppraisedValue arguments');
        await contract.submitTransaction(
            'RegisterDoseAdministration',
            administeredDoseId,
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



    //#region Utils Functions
    async main(): Promise<any> {

        await this.displayInputParameters();

        // The gRPC client connection should be shared by all Gateway connections to this endpoint.
        const client = await this.newGrpcConnection();

        const gateway = connect({
            client,
            identity: await this.newIdentity(),
            signer: await this.newSigner(),
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
            const network = gateway.getNetwork(this.channelName);

            // Get the smart contract from the network.
            const contract = network.getContract(this.chaincodeName);

            // Initialize a set of dose data on the ledger using the chaincode 'InitLedger' function.
            await this.initLedger(contract);

            // // Return all the current doses on the ledger.
            // await getAllDoses(contract);

            // // Create a new dose on the ledger.
            // await createDose(contract);

            // Return all the doses of the specified child on the ledger.
            // await getAllDosesByChildId(contract,'1');
            result = await this.getAllAdministeredDosesByChildId(contract, '2');
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

    private async newGrpcConnection(): Promise<grpc.Client> {
        const tlsRootCert = await fs.readFile(this.tlsCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
        return new grpc.Client(this.peerEndpoint, tlsCredentials, {
            'grpc.ssl_target_name_override': this.peerHostAlias,
        });
    }

    private async newIdentity(): Promise<Identity> {
        const credentials = await fs.readFile(this.certPath);
        let mspId = this.mspId;
        return { mspId, credentials };
    }

    private async newSigner(): Promise<Signer> {
        const files = await fs.readdir(this.keyDirectoryPath);
        const keyPath = path.resolve(this.keyDirectoryPath, files[0]);
        const privateKeyPem = await fs.readFile(keyPath);
        const privateKey = crypto.createPrivateKey(privateKeyPem);
        return signers.newPrivateKeySigner(privateKey);
    }

    /**
    * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
    */
    private envOrDefault(key: string, defaultValue: string): string {
        return process.env[key] || defaultValue;
    }
    /**
     * displayInputParameters() will print the global scope parameters used by the main driver routine.
     */
    async displayInputParameters(): Promise<void> {
        console.log(`channelName:       ${this.channelName}`);
        console.log(`chaincodeName:     ${this.chaincodeName}`);
        console.log(`mspId:             ${this.mspId}`);
        console.log(`cryptoPath:        ${this.cryptoPath}`);
        console.log(`keyDirectoryPath:  ${this.keyDirectoryPath}`);
        console.log(`certPath:          ${this.certPath}`);
        console.log(`tlsCertPath:       ${this.tlsCertPath}`);
        console.log(`peerEndpoint:      ${this.peerEndpoint}`);
        console.log(`peerHostAlias:     ${this.peerHostAlias}`);
    }
    //#endregion
}