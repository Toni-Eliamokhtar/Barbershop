Feature: Auth flows

  Scenario: Signup réussi
    Given I open the signup page
    When I submit valid credentials
    Then I should see a success message

  Scenario: Login réussi
    Given I have an existing account
    When I login with valid credentials
    Then I should land on the dashboard
