Feature: Organization Profile Update Flow

  @RegressionWorking
  Scenario: Verify that the Platform Admin cannot access the Organization Profile page from the menu bar
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify that the Organization Profile page is not Visible

  @RegressionWorking
  Scenario: Verify that the org user can navigate to the Organization Profile page from the user icon
    Given I open Browser
    And   I am logged as 'user2'
    And   I click on user icon and select the Profile Option
    And   I verify whether the user is navigates to Organization Profile page 'Organization Profile'

  @RegressionWorking
  Scenario: Verify that the org user cannot update the first name and last name with a single character
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    And   I click on the Edit Organization Profile button
    And   I update the FirstName and LastName with values 't' and 't'
    Then  I verify the First Name validation message as 'First name must be at least 2 characters.'
    And   I verify the Last Name validation message as 'Last name must be at least 2 characters.'

  @RegressionWorking
  Scenario: Verify that the org user cannot update the first name and last name with only whitespace
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    And   I click on the Edit Organization Profile button
    And   I update the FirstName and LastName with values '    ' and '    '
    Then  I verify the First Name with Whitespaces validation message as 'First name cannot be empty'
    And   I verify the Last Name with Whitespaces validation message as 'Last name cannot be empty'

  @RegressionWorking
  Scenario: Verify that the Save button is disabled if no changes have been made to the Organization Profile
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    And   I click on the Edit Organization Profile button
    Then  I verify that the Save Button is Disabled

  @RegressionWorking
  Scenario: Verify that the Save button is disabled when the organization user attempts to update the Organization Profile without making any changes
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    And   I click on the Edit Organization Profile button
    And   I update the First name and Last Name data with the same existing details of 'user2'
    Then  I verify that the Save Button is Disabled

  @RegressionWorking
  Scenario: Verify the functionality of the Cancel button on the Edit Organization Profile page
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    And   I click on the Edit Organization Profile button
    And   I update the FirstName and LastName with values '123' and '02'
    When  I click on the Cancel button on Organization Profile page
    Then  I verify that the changes are not saved and that the original details are displayed for 'user2'

  @RegressionWorking
  Scenario: Verify that the org user cannot update the Organization Name and email ID fields
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    And   I click on the Edit Organization Profile button
    Then  I verify that the Organization Name and Email ID fields are disabled

  @RegressionWorking
  Scenario: Verify that the org user can update the Organization Profile
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    And   I click on the Edit Organization Profile button
    And   I update the FirstName and LastName with values 'TestUser' and '001'
    And   I click on Save button to update the Organization Profile
    And   I store updated the FirstName and LastName with values 'TestUser' and '001' for 'user2'

  @RegressionWorking
  Scenario: Verify that the org user can view the updated Organization Profile details
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Organization Profile page
    Then  I verify the Updated FirstName and LastName for 'user2'

  @RegressionWorking
  Scenario: Verify that the updated Organization Profile details made by the organization user are reflected to the Platform Admin
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    And   I click on Users page
    Then  I verify user navigates to Users page 'Organization Users'
    And   I search for user 'user2'
    Then  I verify the updated First Name and Last Name for 'user2' as an Platform Admin