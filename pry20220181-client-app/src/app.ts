//#region Config Fastify web server
// ESM
import Fastify from 'fastify'
import { Pry20220181Blockchain } from './blockchain-service'
import { randomUUID } from 'crypto'

const fastify = Fastify({
  logger: true
})

const PATHS = {
  ADMINISTERED_DOSES: '/administered-doses'
}

class AdministeredDose {
  administeredDoseId: string;
  doseId: number;
  childId: number;
  healthCenterId: number;
  healthPersonnelId: number;
  doseDate: string;
  vaccinationCampaignId: number;
  vaccinationAppointmentId: number;

  constructor(doseId? : number, childId? : number, healthCenterId? : number){
    this.administeredDoseId = randomUUID();
    this.doseId = doseId ?? ;
    this.childId = childId ?? 0;
    this.healthCenterId = healthCenterId ?? 
}
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
  var animalObj =  new Animal();
  console.log(animalObj.getEyes());
  Object.assign(animalObj, JSON.parse(jsonString));
  console.log('ID', randomUUID())
  let administeredDose = request.body; 
  console.log(administeredDose.ChildId);
  return {result: 1};
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