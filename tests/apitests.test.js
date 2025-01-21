const request = require('supertest');
const baseAddress = process.env.apiurl || "http://localhost:8198/";

// API PIPELINE TEST tests all of the functions
describe('PipelineTest',() => {
  // 1. Application should NOT return anything when at the INIT state
  describe('GET /request (Without init)', ()=>{
    it('Should return 404', async() => {
      // get data
      const response = await request(baseAddress).get('/request/')
      expect(response.statusCode).toBe(404);
    })
  })

  // 2. Application should be correctly put to init state
  describe('PUT /state RUNNING', ()=>{
    it('Should put the application state to: RUNNING', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("RUNNING");
      expect(response.statusCode).toBe(200);
    })
  })

  // 3. Application should be running so it should return service information without login
  describe('GET /request (200)', ()=>{
    it('Should return service1 and service2 information', async() => {
      // get data
      const response = await request(baseAddress).get('/request/')//.auth('ataajn','skumnisse');
      expect(response.statusCode).toBe(200);

      // minor test for data configuration
      const data = JSON.parse(response.text);
      expect(data).toHaveProperty('service1');
      expect(data).toHaveProperty('service2');
    })
  })

  // 4. Application should be able to init
  // TODO: add test for PUT /state INIT
  describe('PUT /state INIT', ()=>{
    it('Should put the application state to: INIT', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("INIT");
      // to force relog
      expect(response.statusCode).toBe(401);
      // try that it is successful
      const response2 = await request(baseAddress).get('/request/')//.auth('ataajn','skumnisse');
      expect(response2.statusCode).toBe(404);
    })
  })

  // 5. Application should continue when put to running again
  describe('PUT /state RUNNING', ()=>{
    it('Should put the application state to: RUNNING', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("RUNNING");
      expect(response.statusCode).toBe(200);
    })
  })

  // 6. Should get the application state as plaintext
  describe('GET /state', ()=>{
    it('Should be at the RUNNING state', async() => {
      // get data
      const response = await request(baseAddress).get('/state/')
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('RUNNING');
    })
  })

  // 7. Application should be able to be put on pause, then it should not return any requests.
  // TODO: add test for PUT /state PAUSED
  // TODO: test that it actually is paused

  // 8. Application should be able to be put back to RUNNING
  // TODO: second running test

  // 9. Application should return logs for all actions before
  // TODO: add test for /run-log

  // 10. Application should shut down all containers.
  // TODO: add test for PUT /state SHUTDOWN
})
