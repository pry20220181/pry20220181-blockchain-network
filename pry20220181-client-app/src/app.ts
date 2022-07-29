
const doseId = `dose${Date.now()}`;

//#region Config Fastify web server
// ESM
import Fastify from 'fastify'
import { Pry20220181Blockchain } from './blockchain-service'
const fastify = Fastify({
  logger: true
})


fastify.get('/administered-doses', async (request, reply) => {
    // let result = await main().catch(error => {
    //     console.error('******** FAILED to run the application:', error);
    //     process.exitCode = 1;
    // }); 
    let blockchain = new Pry20220181Blockchain();
    blockchain.displayInputParameters();
    let result = null;
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