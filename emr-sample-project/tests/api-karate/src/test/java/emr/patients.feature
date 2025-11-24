Feature: Patients API

  Background:
    * url baseUrl
    * configure headers = { 'Content-Type': 'application/json' }

  Scenario: Create and list patients
    * def payload = { firstName: 'John', lastName: 'Doe', dob: '1990-01-01', insuranceId: 'INS-123' }
    Given url baseUrl + '/api/patients'
    And request payload
    When method post
    Then status 201
    And match response.firstName == 'John'
    And match response.lastName == 'Doe'
    * def id = response.id

    Given url baseUrl + '/api/patients'
    When method get
    Then status 200
    And match response contains { id: '#(id)', firstName: 'John', lastName: 'Doe' }

  Scenario: Add medication
    * def newPatient = call read('classpath:emr/util/createPatient.feature')
    * def pid = newPatient.id

    Given url baseUrl + '/api/patients/' + pid + '/medications'
    And request { name: 'Amoxicillin', dosage: '500mg', frequency:'2x daily', duration:'7 days' }
    When method post
    Then status 201
    And match response.name == 'Amoxicillin'

    Given url baseUrl + '/api/patients/' + pid + '/medications'
    When method get
    Then status 200
    And match response[0].name == 'Amoxicillin'
