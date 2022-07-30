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

  return {result: 1};
  // let result = await main().catch(error => {
  //     console.error('******** FAILED to run the application:', error);
  //     process.exitCode = 1;
  // }); 
  // let blockchain = new Pry20220181Blockchain();
  // blockchain.displayInputParameters();
  // let result = null;
  // // let result = "prueba host to vm"
  // console.log("A retornar: ", result);
  // return { hello: 'world', result: result }
})

fastify.post(PATHS.ADMINISTERED_DOSES, async (request, reply) => {
  var administeredDose =  new AdministeredDose();
  Object.assign(administeredDose, request.body);

  try {
    let blockchainNetwork = new Pry20220181Blockchain();
    await blockchainNetwork.registerDoseAdministration(administeredDose);
    return administeredDose;
  } catch (error) {
   return {'error': error} 
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