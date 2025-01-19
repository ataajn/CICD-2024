const request = require('supertest');
const baseAddress = process.env.apiurl || "http://localhost:8198/";

// PUT requests
describe('StateChangeTests',() => {
  // TODO: add test for PUT /state INIT

  // TODO: add test for PUT /state PAUSED

  // TODO: add test for PUT /state RUNNING

  // TODO: add test for PUT /state SHUTDOWN
})

// GET requests
describe('GetRequestTests',() => {
  // 1 // test for /request
  describe('GET /request', ()=>{
    it('Should return service1 and service2 information', async() => {
      // get data
      const response = await request(baseAddress).get('/request/').auth('ataajn','skumnisse');
      expect(response.statusCode).toBe(200);

      // minor test for data configuration
      const data = JSON.parse(response.text);
      expect(data).toHaveProperty('service1');
      expect(data).toHaveProperty('service2');
    })
  })

  // TODO: add test for /run-log

  // TODO: add test for /state (GET)
})
