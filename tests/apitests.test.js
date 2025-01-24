const request = require('supertest');
const Test = require('supertest/lib/test');
const baseAddress = process.env.apiurl || "http://localhost:8198/";

jest.setTimeout(20000);
// API PIPELINE TEST tests all of the functions
describe('PipelineTest',() => {

  describe('Following sequence tests all the functionality in the CICD-2024 program', () => {
    // 1. Application should NOT return anything when at the INIT state
    it('1. GET /request: (Without init) Should return 404', async() => {
      const response = await request(baseAddress).get('/request/')
      expect(response.statusCode).toBe(404);
    })

    // 2. Application should be correctly put to init state
    it('2. PUT /state RUNNING: Should put the application state to: RUNNING', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("RUNNING");
      expect(response.statusCode).toBe(200);
    })

    // 3. Application should be running so it should return service information without login
    it('3. GET /request: (200) Should return service1 and service2 information', async() => {
      // get data
      const response = await request(baseAddress).get('/request/')
      expect(response.statusCode).toBe(200);

      // minor test for data configuration
      const data = JSON.parse(response.text);
      expect(data).toHaveProperty('service1');
      expect(data).toHaveProperty('service2');
    })
    // 4. Application should be able to init
    it('4. PUT /state INIT: Should put the application state to: INIT', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("INIT");
      // to force relog
      expect(response.statusCode).toBe(401);
      // try that it is successful
      const response2 = await request(baseAddress).get('/request/')
      expect(response2.statusCode).toBe(404);
    })

    // 5. Application should continue when put to running again
    it('5. PUT /state RUNNING: Should put the application state to: RUNNING', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("RUNNING");
      expect(response.statusCode).toBe(200);
    })

    // 6. Should get the application state as plaintext
    it('6. GET /state: Should be at the RUNNING state', async() => {
      // get data
      const response = await request(baseAddress).get('/state/')
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('RUNNING');
    })

    // 7. Application should be able to be put on pause, then it should not return any requests.
    it('7. PUT /state PAUSED: Should put the application state to: PAUSED', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("PAUSED");
      expect(response.statusCode).toBe(200);

      // test that it does not return ANYTHING
      let error;
      try{
        const response2 = await request(baseAddress)
          .get('/request/')
          .timeout({ response: 4000 })
      } catch(ex){
        // timeout
        error = ex;
      }
      // check that error is not null
      expect(error !== null && error !== undefined).toBe(true);
    })

    // 8. Application should be able to be put back to RUNNING
    it('8. PUT /state RUNNING: Should put the application state to: RUNNING', async() => {
      // set it running
      const response = await request(baseAddress)
        .put('/state/')
        .auth('ataajn','skumnisse')
        .set('Content-Type', 'text/plain')
        .send("RUNNING");
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('RUNNING');
    })

    // 9. Application should return logs for all actions before
    it('9. GET /run-log: Should return logs from all other tests', async() => {
      // get data
      const response = await request(baseAddress).get('/run-log/')
      expect(response.statusCode).toBe(200);
      expect(response.text.includes("PAUSED->RUNNING")).toBe(true);
      expect(response.text.includes("RUNNING->PAUSED")).toBe(true);
      expect(response.text.includes("INIT->RUNNING")).toBe(true);
      expect(response.text.includes("RUNNING->INIT")).toBe(true);
    })

    // 10. Application should shut down all containers.
    it('10. PUT /state SHUTDOWN: Should close the application', async() => {
      //jest.setTimeout(20000)
      // shutdown all the containers
      try{
        const response = await request(baseAddress)
          .put('/state/')
          .auth('ataajn','skumnisse')
          .set('Content-Type', 'text/plain')
          .send("SHUTDOWN")
          .timeout({ response: 4000 });
      } catch(ex){
        // timeout
      }

      // give it time to close everything
      await (async () => {
        return new Promise(resolve => setTimeout(resolve,10000))
      })();
      
      // should be no response since application is closed
      let error;
      try{
        const response2 = await request(baseAddress)
          .get('/request/')
          .timeout({ response: 4000 })
      } catch(ex){
        // timeout
        error = ex;
      }
      // check that error is not null
      expect(error !== null && error !== undefined).toBe(true);
    })
  })
})
