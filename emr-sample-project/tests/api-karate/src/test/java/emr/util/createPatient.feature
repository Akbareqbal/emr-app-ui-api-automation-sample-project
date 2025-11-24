Feature: util - create patient
  Scenario:
    * url baseUrl + '/api/patients'
    * request { firstName: 'Jane', lastName: 'Smith' }
    * method post
    * status 201
    * def id = response.id
    * configure afterScenario = function(){}
