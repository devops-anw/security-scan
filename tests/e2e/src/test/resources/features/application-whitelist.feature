Feature:Application and Device Inventory creation for Org users

  @RegressionWorking
  Scenario: Verify that the Platform Admin cannot access the Applications page
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify that the Applications page is not Accessible

  @RegressionWorking
  Scenario: Verify if the org user is able to add an application at global level
    Given  I do a post call to Create an Application for 'user2'

  @RegressionWorking
  Scenario: Verify if the application added at global level is displayed on the Applications page
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Applications page
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Pending'

  @RegressionWorking
  Scenario: Verify whether the Org user is able to reject the application added at the global level
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Applications page
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Pending'
    And   I click on Reject button corresponding to the application
    Then  I verify the Application Popup window 'Are you sure you want to reject this application?'
    And   I click on Reject button on the popup window
    Then  I verify the application having the status as 'Rejected'

  @RegressionWorking
  Scenario: Verify that the rejected application is not reflected for the device if the application is not in its inventory
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Application Inventory' option
    Then  I verify 'Application Inventory' popup window
    And   I verify 'No applications found' validation message on Application Inventory section

  @RegressionWorking
  Scenario: Verify if the organization user can add an application to the device inventory
    And  I do a post call to Create Device Inventory with 1 application for user2

  @RegressionWorking
  Scenario: Verify if the added applications are available in the device's application inventory
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Application Inventory' option
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Pending'

  @RegressionWorking
  Scenario: Verify that the devices do not have approve/reject buttons available in the Device Inventory section
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Application Inventory' option
    Then  I verify approve button is not available in the device inventory section

  @RegressionWorking
  Scenario: Verify if the org user can approve the application at the global level
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Applications page
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Pending'
    And   I click on Approve button corresponding to the application
    Then  I verify the Application Popup window 'Are you sure you want to approve this application?'
    And   I click on Approve button on the popup window
    Then  I verify the application having the status as 'Approved'

  @RegressionWorking
  Scenario: Verify if the approved application is reflected in the device's application inventory
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Application Inventory' option
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Approved'

  @RegressionWorking
  Scenario: Verify if the organization user can add a device inventory with multiple applications
    And  I do a post call to Create Device Inventory with 3 application for user2

  @RegressionWorking
  Scenario: Verify if the organization user can approve all applications available at the global level
    Given I open Browser
    And   I am logged as 'user2'
    And   I click the Applications page
    And   I click on approveAll button
    Then  I verify the Application Popup window 'Are you sure you want to approve all pending applications?'
    And   I click on Approve button on the popup window
    Then  I verify the all application having the status as 'Approved'