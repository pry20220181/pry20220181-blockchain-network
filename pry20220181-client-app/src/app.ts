//#region Config Fastify web server
// ESM
import Fastify from 'fastify'
import { Pry20220181Blockchain, AdministeredDose } from './blockchain-service'
import { randomUUID } from 'crypto'

const fastify = Fastify({
  logger: true
})

const PATHS = {
  ADMINISTERED_DOSES: '/administered-doses'
}


fastify.get(PATHS.ADMINISTERED_DOSES, async (request, reply) => {
  console.log(request.query);
  const { childId } = request.query;

  try {
    let blockchainNetwork = new Pry20220181Blockchain();

    let administeredDoses = await blockchainNetwork.getAllAdministeredDosesByChildId(childId);

    return administeredDoses;
  } 
  catch (error: any) {
    console.log(error.message);
    return {'error': error.message} 
  }
})

fastify.post(PATHS.ADMINISTERED_DOSES, async (request, reply) => {
  var administeredDose =  new AdministeredDose(randomUUID());
  Object.assign(administeredDose, request.body);

  try {
    let blockchainNetwork = new Pry20220181Blockchain();

    await blockchainNetwork.registerDoseAdministration(administeredDose);

    return administeredDose;
  } 
  catch (error: any) {
    console.log(error.message);
    return {'error': error.message} 
  }
})

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' }) //Si no se pone host, por defecto se pone en 127.0.0.1 y no se podra acceder desde fuera
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
//TO EXECUTE
//npm install
//npm start
//TO UPDATE
//npm run prepare
//npm start
//#endregion