Feature: User and Platform Admin Sign-In Functionality

  @RegressionWorking
  Scenario: Verify that an approved Org user can sign into the application
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click the Sign In to Your Account button
    Then  I verify the sign in page - 'Welcome to MemCrypt'
    And   I enter 'user2' credentials in MemCrypt login page
    And   I click on the Sign In button
    And   I save local storage as 'user2'

  @RegressionWorking
  Scenario: Verify that an approved Org user cannot access the pages available to the Platform Admin
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    Then  I verify that the Approval Request page is not Accessible
    And   I verify that the User page is not Accessible
    And   I verify that the Agent Binary page is not Accessible

  @RegressionWorking
  Scenario: Verify that the Org user has access to all designated pages in the application
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    Then  I verify user is navigated to Agent Downloads page 'Download Other Agent Binary Versions'
    And   I click the Dashboard page
    Then  I verify that the Org user is navigated to 'Organization Dashboard'
    And   I click the Organization Profile page
    And   I verify whether the user is navigates to Organization Profile page 'Organization Profile'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I click the Applications page
    Then  I verify user is navigated to Applications page 'Applications'
    And   I click the Activity Logs page
    Then  I verify user is navigated to Activity Logs page 'Activity Logs / Telemetry'
    And   I click the Recovery page
    Then  I verify user is navigated to Recovery page 'Recovery List'