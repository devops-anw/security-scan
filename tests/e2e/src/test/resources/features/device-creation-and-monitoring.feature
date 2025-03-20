Feature: Device Creation and Monitoring

  @RegressionWorking
  Scenario: Verify that the Platform Admin cannot access the Device Monitor page
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify that the Device Monitor page is not Accessible

  @RegressionWorking
  Scenario: Verify if the 'No devices detected' message is displayed when the organization user has not added any devices
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I verify 'No devices detected' validation message in the Devices page

  @Sanity @RegressionWorking
  Scenario: Verify that the org user can register a device
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    And   I click the Organization Profile page
    And   I verify whether the user is navigates to Organization Profile page 'Organization Profile'
    And   I select the Org ID of the 'user2'
    Given I Do Post call to create a device
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I verify that the device with the serial number has a Health status of 'NEVER SEEN'

  @Sanity @RegressionWorking
  Scenario: Verify whether the Org user is able to update the device heartbeat
    Given I Do Post call to update the Device Heartbeat
    And   I open Browser
    Given I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I verify that the device with the serial number has a Health status of 'HEALTHY'

  @Sanity @RegressionWorking
  Scenario: Verify that the org user can sign in to their accounts
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click the Sign In to Your Account button
    Then  I verify the sign in page - 'Welcome to MemCrypt'
    And   I enter 'user2' credentials in MemCrypt login page
    And   I click on the Sign In button
    And   I save local storage as 'user2'

  @Sanity @RegressionWorking
  Scenario: Verify the device heartbeat 1 minute after it has been updated.
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    Then  I wait and verify that the device with the serial number has a Health status of 'NEEDS ATTENTION'