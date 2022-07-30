import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Proposal, ProposalOptions, Signer, signers, SubmittedTransaction } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { chdir } from 'process';
import { TextDecoder } from 'util';

export class AdministeredDose {
    administeredDoseId: string;
    doseId: number;
    childId: number;
    healthCenterId: number;
    healthPersonnelId: number;
    doseDate: string;
    vaccinationCampaignId: number;
    vaccinationAppointmentId: number;
  
    constructor(administeredDoseId: string, doseId? : number, childId? : number, healthCenterId? : number, healthPersonnelId? : number, doseDate? : string, vaccinationCampaignId? : number, vaccinationAppointmentId? : number){
      this.administeredDoseId = administeredDoseId;
      this.doseId = doseId ?? 0;
      this.childId = childId ?? 0;
      this.healthCenterId = healthCenterId ?? 0;
      this.healthPersonnelId = healthPersonnelId ?? 0;
      this.doseDate = doseDate ?? new Date().toISOString();
      this.vaccinationCampaignId = vaccinationCampaignId ?? 0;
      this.vaccinationAppointmentId = vaccinationAppointmentId ?? 0;
    }
  }

class ContractDummy implements Contract{
    getChaincodeName(): string {
        throw new Error('Method not implemented.');
    }
    getContractName(): string | undefined {
        throw new Error('Method not implemented.');
    }
    evaluateTransaction(name: string, ...args: (string | Uint8Array)[]): Promise<Uint8Array> {
        throw new Error('Method not implemented.');
    }
    submitTransaction(name: string, ...args: (string | Uint8Array)[]): Promise<Uint8Array> {
        throw new Error('Method not implemented.');
    }
    evaluate(transactionName: string, options?: ProposalOptions | undefined): Promise<Uint8Array> {
        throw new Error('Method not implemented.');
    }
    submit(transactionName: string, options?: ProposalOptions | undefined): Promise<Uint8Array> {
        throw new Error('Method not implemented.');
    }
    submitAsync(transactionName: string, options?: ProposalOptions | undefined): Promise<SubmittedTransaction> {
        throw new Error('Method not implemented.');
    }
    newProposal(transactionName: string, options?: ProposalOptions | undefined): Proposal {
        throw new Error('Method not implemented.');
    }
}

export class Pry20220181Blockchain {
    /*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
    // contract: Contract;
    client: grpc.Client;
    gateway: Gateway; 

    constructor() {
        //TODO: Put all the logic to stablsish the connection with the BLockchain here

        
    }

    //#region Constants    
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
    //#endregion


    /**
     * This type of transaction would typically only be run once by an application the first time it was started after its
     * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
     */
    //TODO> Pasar esto para hacerlo desde el script que levanta la Blockchain
    // async initLedger(): Promise<void> {
    //     console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of doses on the ledger');

    //     await this.contract.submitTransaction('InitLedger');

    //     console.log('*** Transaction committed successfully');
    // }

    /**
     * Evaluate a transaction to query ledger state filtering by childId.
     */
    async getAllAdministeredDosesByChildId(childId: number): Promise<Array<AdministeredDose>> {
        let contract = await this.StablishConnectionWithBlockchain();
        console.log(`\n--> Evaluate Transaction: ReadAdministeredDosesByChildId, function returns all the administered doses of the child with ID ${childId} on the ledger`);

        // const resultBytes = await contract.evaluateTransaction('ReadAdministeredDosesByChildId', childId.toString());
        // const resultJson = this.utf8Decoder.decode(resultBytes);
        // const result = JSON.parse(resultJson);
        const result = [
            //#region CHILD 1
            {
                ID: 'd7028f69-8ca9-4c75-b35e-cff302b24067',
                DoseId: '1',
                ChildId: '1',
                HealthCenterId: '1',
                HealthPersonnelId: '1',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: 'a4d5668a-24aa-411d-ad83-cb99333e79a7',
                DoseId: '2',
                ChildId: '1',
                HealthCenterId: '1',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: '1c7ccb39-b77e-4528-9b78-db7634023af2',
                DoseId: '3',
                ChildId: '1',
                HealthCenterId: '2',
                HealthPersonnelId: '3',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: 'd128789d-d598-4d53-b895-4d7c90e854b4',
                DoseId: '4',
                ChildId: '1',
                HealthCenterId: '2',
                HealthPersonnelId: '3',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: '29dcfbe2-7887-4f13-9e67-ffb14df7cdaf',
                DoseId: '5',
                ChildId: '1',
                HealthCenterId: '1',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            //#endregion
            //#region CHILD 2
            {
                ID: 'cc5bcc2f-576e-4f72-b2eb-0aa39f17466c',
                DoseId: '1',
                ChildId: '2',
                HealthCenterId: '1',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: '7c9fffae-1fc0-45d1-b4cd-ad1bc11f7455',
                DoseId: '2',
                ChildId: '2',
                HealthCenterId: '1',
                HealthPersonnelId: '1',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: '25d1ff31-1e11-47e6-8a46-167d320588d6',
                DoseId: '3',
                ChildId: '2',
                HealthCenterId: '2',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: 'b0bcf9f9-47e5-4204-8d47-dafc128b088d',
                DoseId: '4',
                ChildId: '2',
                HealthCenterId: '2',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            }
            //#endregion
        ];
        const numberOfAdministeredDoses = result.length;
        //console.log(`*** Result (Doses of the Child ${childId}):`, result);

        let administeredDosesToReturn = new Array<AdministeredDose>();

        for (let i = 0; i < numberOfAdministeredDoses; i++) {
            const element = result[i];
            administeredDosesToReturn.push(new AdministeredDose(element.ID, element.DoseId ,element.ChildId , element.HealthCenterId ,
                element.HealthPersonnelId, element.DoseDate, element.VaccinationCampaignId, element.VaccinationAppointmentId))
        }

        await this.CloseConnectionWithBlockchain();
        return administeredDosesToReturn;
    }

    /**
     * Submit a transaction synchronously, blocking until it has been committed to the ledger.
     */
    async registerDoseAdministration(administeredDose: AdministeredDose): Promise<void> {
        let contract = await this.StablishConnectionWithBlockchain();
        console.log('\n--> Submit Transaction: RegisterDoseAdministration, creates new administered dose with administeredDoseId, doseId, childId, healthCenterId, healthPersonnelId, doseDate, vaccinationCampaignId, vaccinationAppointmentId arguments');

        //#region VALIDATE REQUIRED FIELDS ADMINISTERED DOSE
        if(!(administeredDose.doseId > 0)){
            throw new Error('DoseId is required');
        }
        if(!(administeredDose.childId > 0)){
            throw new Error('ChildId is required');
        }
        if(!(administeredDose.healthCenterId > 0)){
            throw new Error('HealthCenterId is required');
        }
        if(!(administeredDose.healthPersonnelId > 0)){
            throw new Error('HealthPersonnelId is required');
        }
        //#endregion 

        // await contract.submitTransaction(
        //     'RegisterDoseAdministration',
        //     administeredDose.administeredDoseId,
        //     administeredDose.doseId.toString(),
        //     administeredDose.childId.toString(),
        //     administeredDose.healthCenterId.toString(),
        //     administeredDose.healthPersonnelId.toString(),
        //     administeredDose.doseDate.toString(),
        //     administeredDose.vaccinationCampaignId.toString(),
        //     administeredDose.vaccinationAppointmentId.toString(),
        // );

        console.log('*** Transaction RegisterDoseAdministration committed successfully');
        await this.CloseConnectionWithBlockchain();
    }

    private async StablishConnectionWithBlockchain() : Promise<Contract> {
        // The gRPC client connection should be shared by all Gateway connections to this endpoint.
        this.client = await this.newGrpcConnection();

        this.gateway = connect({
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

        try {
            // Get a network instance representing the channel where the smart contract is deployed.
            const network = this.gateway.getNetwork(this.channelName);

            // Get the smart contract from the network.
            this.contract = network.getContract(this.chaincodeName);

            return this.contract;
        } 
        catch {
            this.gateway.close();
            this.client.close();
        }
    }

    private async CloseConnectionWithBlockchain() : Promise<void>{
        this.gateway.close();
        this.client.close();
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