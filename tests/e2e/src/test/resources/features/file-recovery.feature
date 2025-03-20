Feature: File Recovery flow

  @RegressionWorking
  Scenario: Verify that the Platform Admin cannot access the Recovery page
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify that the Recovery page is not Accessible

  @RegressionWorking
  Scenario: Verify that the org user can add file recovery for a device
    Given  I do a post call to create a file recovery for the device

  @RegressionWorking
  Scenario: Verify that the added file recovery record is available on the Recovery page
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Recovery page
    And   I search for the Recovery record with file Name
    Then  I verify the File Recovery record created

  @RegressionWorking
  Scenario: Verify that the added file recovery record has been associated with the device
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Recovery List' option
    Then  I verify 'Recovery List' popup window
    And   I search for the recovery list with File Name
    Then  I verify the File Recovery record created for the device