// Import the framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// Declare a route (RFID readers often send GET with ?Data=... or ?data=...)
fastify.get('/test-rfid', async function handler (request, reply) {
  const q = request.query ?? {}
  const data = q.data ?? q.Data
  console.log('RFID data:', data, '| query:', q)
  return { message: 'RFID service is running', data }
})

// Run the server!
try {
  await fastify.listen({ port: 3000,host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}