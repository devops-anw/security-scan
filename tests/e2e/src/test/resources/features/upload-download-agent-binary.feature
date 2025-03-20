Feature: Upload and Download Agent Binary Versions

  @Sanity @RegressionWorking
  Scenario: Verify that the Platform Admin  can sign in to their accounts
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click the Sign In to Your Account button
    Then  I verify the sign in page - 'Welcome to MemCrypt'
    And   I enter 'PlatformAdmin' credentials in MemCrypt login page
    And   I click on the Sign In button
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I save local storage as 'PlatformAdmin'

  @RegressionWorking
  Scenario: Verify that the Platform Admin can access the Agent Binary page
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    And   I click on Agent Binary page
    Then  I verify user is navigated to 'Agent Binary' page

  @RegressionWorking
  Scenario Outline: Verify that the Platform Admin cannot upload a new binary version file of an unsupported file type
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    And   I click on Agent Binary page
    Then  I verify user is navigated to 'Agent Binary' page
    And   I click on Upload New Version button
    Then  I verify the 'Upload New Agent Binary Version' popup window
    And   I upload the file '<file>'
    And   I click on Upload Agent Binary file button on the popup window
    Then  I verify the File Format not supported validation message 'The selected file type is not supported. Please upload a file with one of the following extensions: .zip, .tar, .exe'

    Examples:
      | file                      |
      | dummy-pdf.pdf             |
      | sample1.json              |
      | sample3.txt               |
      | file_example_XLSX_50.xlsx |

  @Sanity @RegressionWorking
  Scenario Outline: Verify that the Platform Admin can upload a new binary version file of supported file types
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    And   I click on Agent Binary page
    Then  I verify user is navigated to 'Agent Binary' page
    And   I click on Upload New Version button
    Then  I verify the 'Upload New Agent Binary Version' popup window
    And   I upload the file '<file>'
    And   I click on Upload Agent Binary file button on the popup window to upload new binary version
    Then  I store the uploaded file with version name

    Examples:
      | file         |
      | DetectEndpoint.exe |

  @Sanity @RegressionWorking
  Scenario: Verify that the Platform Admin can download a specific Agent Binary version
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    And   I click on Agent Binary page
    Then  I verify user is navigated to 'Agent Binary' page
    And   I search for the file 'DetectEndpoint' in the Agent Binary Search bar
    And   I select the Agent Binary Version
    And   I download the Agent Binary file

  @RegressionWorking
  Scenario: Verify that the Org User does not have access to the Agent Binary page.
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    And   I verify that the Agent Binary page is not Accessible

 @RegressionWorking
  Scenario: Verify that the Org User can view the option to install the MemCrypt Agent
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    And   I verify 'Secure Your Devices: Install the MemCrypt Agent' message on the Agent Download page
    Then  I verify 'Download' Button and 'Download Other Agent Binary Versions' available on the Agent Download page

  @Sanity @RegressionWorking
  Scenario: Verify that the Org User can install the latest MemCrypt Agent
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    Then  I verify user is navigated to Agent Downloads page 'Download Other Agent Binary Versions'
    And   I click on download button to Install the MemCrypt Agent

  @RegressionWorking
  Scenario: Verify that the Org User can view the 'Download Other Agent Binary Versions' option
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    And   I verify 'Download Other Agent Binary Versions' available for Org user
    And   I click on Download Other Agent Binary Versions dropdown

  @Sanity @RegressionWorking
  Scenario: Verify that the Org User can download a specific available Agent Binary version
    Given I open Browser
    And   I am logged as 'user2' before Device Registration
    And   I click on Download Other Agent Binary Versions dropdown
    And   I search for the file 'DetectEndpoint' in the Agent Binary Search bar
    And   I select the Agent Binary Version
    And   I download the Agent Binary file