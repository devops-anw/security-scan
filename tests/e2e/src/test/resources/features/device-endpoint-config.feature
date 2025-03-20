Feature: Device Endpoint Configuration

  @RegressionWorking
  Scenario: Verify if the org user can view the device details
    Given I open Browser
    And   I am logged as 'user2'
    Then  I verify that the Org user is navigated to 'Organization Dashboard'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'View' option
    Then  I verify 'Device Details' popup window
    And   I verify the Device Details with the Device ID

  @RegressionWorking
  Scenario: Verify if the org user has access to the configuration section
    Given I open Browser
    And   I am logged as 'user2'
    Then  I verify that the Org user is navigated to 'Organization Dashboard'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Config' option
    Then  I verify 'Device Configuration' popup window

  @Sanity @RegressionWorking
  Scenario: Verify if the org user can update the device endpoint configuration
    Given I open Browser
    And   I am logged as 'user2'
    Then  I verify that the Org user is navigated to 'Organization Dashboard'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Config' option
    Then  I verify 'Device Configuration' popup window
    And   I select the 'Memcrypt Log' option on the Device Configuration popup window
    And   I click on Edit button to update
    And   I update the port as '8080'
    And   I select the 'Analysis' option on the Device Configuration popup window
    And   I update the Encryption Key as 'mySecretKey'
    And   I select the 'Decryption' option on the Device Configuration popup window
    And   I add the Directory Candidate Values as 'C:\Candidates'
    And   I select the 'Bands' option on the Device Configuration popup window
    And   I update the CPU Red Threshold to '80'
    And   I select the 'Monitor Statistics' option on the Device Configuration popup window
    And   I update Refresh Interval to '5'
    And   I select the 'Whitelist' option on the Device Configuration popup window
    And   I update the Inspect Folder path as 'D:\Whitelist\hashwhitelist.csv'
    And   I select the 'Extractor' option on the Device Configuration popup window
    And   I update Log Switch to 'verbose'
    And   I click on Save button on the Device Configuration popup window
    Then  I verify Device configuration updated message 'Device configuration updated successfully.'

  @RegressionWorking
  Scenario: Verify if the org user can verify the updated device endpoint configuration
    Given I open Browser
    And   I am logged as 'user2'
    Then  I verify that the Org user is navigated to 'Organization Dashboard'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Config' option
    Then  I verify 'Device Configuration' popup window
    And   I select the 'Memcrypt Log' option on the Device Configuration popup window
    And   I verify that the updated Memcrypt log port option is set to '8080'
    And   I select the 'Analysis' option on the Device Configuration popup window
    Then  I verify that the updated Analysis Encryption Key value is set to 'mySecretKey'
    And   I select the 'Decryption' option on the Device Configuration popup window
    Then  I verify the updated Decryption Directory Candidate Values is set to 'C:\Candidates'
    And   I select the 'Bands' option on the Device Configuration popup window
    Then  I verify the updated Bands CPU Red Threshold is set to '80'
    And   I select the 'Monitor Statistics' option on the Device Configuration popup window
    Then  I verify that the updated Monitor Statistics Refresh Interval is set to '5'
    And   I select the 'Whitelist' option on the Device Configuration popup window
    Then  I verify that the updated Whitelist Inspect Folder path is set to 'D:\Whitelist\hashwhitelist.csv'
    And   I select the 'Extractor' option on the Device Configuration popup window
    Then  I verify that the updated Extractor Log Switch value is set to 'verbose'