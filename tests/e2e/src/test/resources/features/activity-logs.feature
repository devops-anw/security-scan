Feature: Activity Logs

  @RegressionWorking
  Scenario: Verify that the Platform Admin cannot access the Activity Logs page
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify that the Activity logs page is not Accessible

  @RegressionWorking
  Scenario: Verify that the 'No activity found' message is displayed when no activity logs are available
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Activity Logs page
    Then  I verify the message 'No activity found' on Activity Logs page
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Logs' option
    Then  I verify 'Activity Logs / Telemetry' popup window
    Then  I verify the message 'No activity found' on Activity Logs window

  @RegressionWorking
  Scenario: Verify that the Org user can add an Activity Log for a device
    Given I do a post call to Create Activity Log for Org user

  @RegressionWorking
  Scenario: Verify that the added activity log for a device is displayed on the Activity Logs page
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Activity Logs page
    And   I search for the Activity Logs with Activity Type
    Then  I verify the Activity log record created

  @RegressionWorking
  Scenario: Verify that the activity log has been successfully added to the device
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Logs' option
    Then  I verify 'Activity Logs / Telemetry' popup window
    Then  I verify that the  Activity log record created for device in Activity Logs window