Feature: Positive Flow

  @End2End
  Scenario Outline: End to End flow
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click on the Create an Account button
    Then  I verify the Signup Page- 'Sign Up'
    And   I generate random user details for the sign-up
    And   I enter Organization, First Name, Last Name, Email, Password, Confirm Password in Signup Form
    And   I click on the Sign-Up button
    Then  I verify the success message : 'We’ve received your sign-up request and it’s currently under review. We’ll make sure to keep you updated via email. Thank you for your patience.'
    When  I store randomly generated credentials as 'user2'
    And   I go to Mail URL
    And   I select the Mailbox Recipients for Org User
    And   I search for 'user2' related emails in the search box with email id
    Then  I verify and click if the user receives verification pending email 'user2' having 'Verify Your Email'
    And   I verify 'Welcome' message in user email
    And   I click on Verify Email button
    Then  I verify the message as 'Email Verified Successfully!'
    And   I select the Mailbox Recipients for Platform Admin
    And   I search for 'user2' related emails in the search box
    Then  I verify and click if the Platform Admin receives Pending Approval email 'user2' having 'New User Registration'
    And   I verify 'New User Registered' message for Platform Admin
    Then  I click on Approve or reject button under email and click on signIn account button
    Then  I verify the sign in page - 'Welcome to MemCrypt'
    And   I enter 'PlatformAdmin' credentials in MemCrypt login page
    And   I click on the Sign In button
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    Then  I verify the Pending Approval 'user2' having '<Action>'
    And   I click on Approve button for the Pending Approval 'user2' having '<Action>'
    Then  I verify Approve popup window 'Are you sure you want to approve this user?'
    And   I click on Approve Button is the popup window
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I click on Users page
    Then  I verify user navigates to Users page 'Organization Users'
    Then  I verify the Pending Approval 'user2' having '<Status>'
    And   I click on Logout button
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I go to Mail URL
    And   I select the Mailbox Recipients for Org User
    And   I search for 'user2' related emails in the search box with email id
    Then  I verify and click if the user receives verification pending email 'user2' having 'Your account has been approved'
    And   I verify 'Your Account is Approved' message for approved user
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click the Sign In to Your Account button
    And   I enter 'user2' credentials in MemCrypt login page
    And   I click on the Sign In button
    Then  I verify that the Org user is navigated to 'Organization Dashboard'
    And   I save local storage as 'user2'
    And   I click on Logout button
    And   I click the Sign In to Your Account button
    And   I enter 'PlatformAdmin' credentials in MemCrypt login page
    And   I click on the Sign In button
    And   I click on Agent Binary page
    Then  I verify user is navigated to 'Agent Binary' page
    And   I click on Upload New Version button
    And   I upload the file '<file>'
    And   I click on Upload Agent Binary file button on the popup window
    Then  I verify 'uploaded successfully' message
    And   I search for the file '4mb' in the Agent Binary Search bar
    And   I select the Agent Binary Version
    And   I download the Agent Binary file
    And   I click on Logout button
    And   I click the Sign In to Your Account button
    And   I enter 'user2' credentials in MemCrypt login page
    And   I click on the Sign In button
    And   I click on Agent Download page
    And   I verify 'Secure Your Devices: Install the MemCrypt Agent' message on the Agent Download page
    And   I click on download button to Install the MemCrypt Agent
    And   I click the Organization Profile page
    And   I verify whether the user is navigates to Organization Profile page 'Organization Profile'
    And   I select the Org ID of the 'user2'
    Given I Do Post call to create a device
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I verify that the device with the serial number has a Health status of 'NEVER SEEN'
    Given I Do Post call to update the Device Heartbeat
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
    And   I click on close button on Actions Popup window
    Given I do a post call to Create an Application for 'user2'
    And   I click the Applications page
    Then  I verify user is navigated to Applications page 'Applications'
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Pending'
    And   I click on Reject button corresponding to the application
    Then  I verify the Application Popup window 'Are you sure you want to reject this application?'
    And   I click on Reject button on the popup window
    Then  I verify the application having the status as 'denied'
    And   I do a post call to Create Device Inventory with 1 application for user2
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Application Inventory' option
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Pending'
    And   I click on close button on Actions Popup window
    And   I click the Applications page
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Pending'
    And   I click on Approve button corresponding to the application
    Then  I verify the Application Popup window 'Are you sure you want to approve this application?'
    And   I click on Approve button on the popup window
    Then  I verify the application having the status as 'Approved'
    And   I click the Device Monitor page
    Then  I verify user is navigated to Devices page 'Devices'
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Application Inventory' option
    And   I search for the application with the application name
    Then  I verify the application having the status as 'Approved'
    And   I click on close button on Actions Popup window
    Given I do a post call to Create Activity Log for Org user
    And   I click the Activity Logs page
    Then  I verify user is navigated to Activity Logs page 'Activity Logs / Telemetry'
    And   I search for the Activity Logs with Activity Type
    Then  I verify the Activity log record created
    And   I click the Device Monitor page
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Logs' option
    Then  I verify 'Activity Logs / Telemetry' popup window
    Then  I verify that the  Activity log record created for device in Activity Logs window
    And   I click on close button on Actions Popup window
    Given I do a post call to create a file recovery for the device
    And   I click the Recovery page
    Then  I verify user is navigated to Recovery page 'Recovery List'
    And   I search for the Recovery record with file Name
    Then  I verify the File Recovery record created
    And   I click the Device Monitor page
    And   I search the device with serial number
    And   I click on ellipsis button and select the 'Recovery List' option
    Then  I verify 'Recovery List' popup window
    And   I search for the recovery list with File Name
    Then  I verify the File Recovery record created for the device
    And   I click on close button on Actions Popup window

    Examples:
      | Action  | Status   | file    |
      | Approve | Approved | 4mb.zip |