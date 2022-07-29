/*
 * Adapted Code from Copyright IBM Corp (All Rights Reserved) to the PRY20220181's Project.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
const { randomUUID } = require('crypto')

//28/7: Se creo el archivo base y se ordeno, solo queda completa cada metodo
class DoseAdministration extends Contract {

    async InitLedger(ctx) {
        const AdministeredDoses = [
            //#region CHILD 1
            {
                ID: randomUUID(),
                DoseId: '1',
                ChildId: '1',
                HealthCenterId: '1',
                HealthPersonnelId: '1',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: randomUUID(),
                DoseId: '2',
                ChildId: '1',
                HealthCenterId: '1',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: randomUUID(),
                DoseId: '3',
                ChildId: '1',
                HealthCenterId: '2',
                HealthPersonnelId: '3',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: randomUUID(),
                DoseId: '4',
                ChildId: '1',
                HealthCenterId: '2',
                HealthPersonnelId: '3',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: randomUUID(),
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
                ID: randomUUID(),
                DoseId: '1',
                ChildId: '2',
                HealthCenterId: '1',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: randomUUID(),
                DoseId: '2',
                ChildId: '2',
                HealthCenterId: '1',
                HealthPersonnelId: '1',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: randomUUID(),
                DoseId: '3',
                ChildId: '2',
                HealthCenterId: '2',
                HealthPersonnelId: '2',
                DoseDate: new Date().toISOString(),
                VaccinationCampaignId: '0',
                VaccinationAppointmentId: '0'
            },
            {
                ID: randomUUID(),
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

        for (const Dose of AdministeredDoses) {
            Dose.docType = 'Dose';
            await ctx.stub.putState(Dose.ID, Buffer.from(stringify(sortKeysRecursive(Dose)))); //example of how to write to world state deterministically, more detail in the Fabric-Samples
        }
    }

    //#region MAIN METHODS
    // CreateDose issues a new Dose to the world state with given details.
    /*
    administeredDoseId (GUID)
    doseId (FK)
    childId (FK)
    healthCenterId (FK)
    healthPersonnelId (FK)
    doseDate
    vaccinationCampaignId (FK, NN)
    vaccinationAppointmentId (FK, NN) 
    */
    async CreateDose(ctx, administeredDoseId, doseId, childId, healthCenterId, healthPersonnelId, doseDate, vaccinationCampaignId, vaccinationAppointmentId) {
        const exists = await this.DoseExists(ctx, administeredDoseId);
        if (exists) {
            throw new Error(`The Dose ${administeredDoseId} already exists`);
        }

        const Dose = {
            ID: administeredDoseId,
            DoseId: doseId,
            ChildId: childId,
            HealthCenterId: healthCenterId,
            HealthPersonnelId: healthPersonnelId,
            DoseDate: doseDate,
            VaccinationCampaignId: vaccinationCampaignId,
            VaccinationAppointmentId: vaccinationAppointmentId
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(administeredDoseId, Buffer.from(stringify(sortKeysRecursive(Dose))));
        return JSON.stringify(Dose);
    }

    async ReadDosesByChildId(ctx, childId){
        const query = `{"selector": {"ChildId": {"$eq": "${childId}"}}}`
        const allResults = [];
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
    //#endregion

    //#region SECONDARY METHODS
    // ReadDose returns the Dose stored in the world state with given id.
    async ReadDose(ctx, administeredDoseId) {
        const DoseJSON = await ctx.stub.getState(administeredDoseId); // get the Dose from chaincode state
        if (!DoseJSON || DoseJSON.length === 0) {
            throw new Error(`The Dose ${administeredDoseId} does not exist`);
        }
        return DoseJSON.toString();
    }

    // DoseExists returns true when Dose with given ID exists in world state.
    async DoseExists(ctx, id) {
        const DoseJSON = await ctx.stub.getState(id);
        return DoseJSON && DoseJSON.length > 0;
    }

    //FOR TESTING PURPOSES
    // GetAllDoses returns all Doses found in the world state.
    async GetAllDoses(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all Doses in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
    //#endregion
}

module.exports = DoseAdministration;