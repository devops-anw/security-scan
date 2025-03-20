Feature: Platform Admin  Approves or Rejects Org User Sign-Up Requests

  @RegressionWorking
  Scenario Outline: Verify that the Platform Admin cannot sign in to their account with incorrect credentials
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click the Sign In to Your Account button
    Then  I verify the sign in page - 'Welcome to MemCrypt'
    And   I enter the '<email>' and '<Password>' Sign in page
    And   I click on the Sign In button
    Then  I verify 'Invalid username or password.' validation message

    Examples:
      | email          | Password         |
      | platformadmin1 | platformadmin123 |
      | platformadmin  | superadmin12345  |

  @Sanity @RegressionWorking
  Scenario: Verify that the Platform Admin can sign in to their account successfully using valid credentials
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
  Scenario: Verify that the Platform Admin has access to all designated pages in the application
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I click on Users page
    Then  I verify user navigates to Users page 'Organization Users'
    And   I click on Agent Binary page
    Then  I verify user is navigated to 'Agent Binary' page

  @RegressionWorking
  Scenario Outline: Verify that the Platform Admin can view pending approvals on the Approval Request page and the Users page
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I search the Org user '<userCredentials>' with email ID
    Then  I verify the Pending Approval '<userCredentials>' having '<Action>'
    And   I click on Users page
    And   I search the Org user '<userCredentials>' with email ID
    Then  I verify user navigates to Users page 'Organization Users'
    Then  I verify the Pending Approval '<userCredentials>' having '<Status>'

    Examples:
      | userCredentials | Action  | Status  |
      | user1           | Approve | Pending |
      | user2           | Reject  | Pending |

  @Sanity @RegressionWorking
  Scenario: Verify that the Platform Admin can reject an Org user sign-up request
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I search the Org user 'user1' with email ID
    Then  I verify the Pending Approval 'user1' having 'Reject'
    And   I click on Reject button for the Pending Approval 'user1' having 'Reject'
    Then  I verify reject popup window 'Are you sure you want to reject this user?'
    And   I click on Reject Button is the popup window
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I click on Users page
    Then  I verify user navigates to Users page 'Organization Users'
    And   I search the Org user 'user1' with email ID
    Then  I verify the Pending Approval 'user1' having 'Rejected'

  @Sanity @RegressionWorking
  Scenario: Verify that the Org user receives a rejection email after the Platform Admin rejects their sign-up request
    Given I open Browser
    And   I go to Mail URL
    And   I select the Mailbox Recipients for Org User
    And   I search for 'user1' related emails in the search box with email id
    Then  I verify and click if the user receives verification pending email 'user1' having 'Your account application status'
    And   I verify 'Your Account Application Status' message for rejected user

  @Sanity @RegressionWorking
  Scenario: Verify that a rejected Org user cannot sign in to their account
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click the Sign In to Your Account button
    Then  I verify the sign in page - 'Welcome to MemCrypt'
    And   I enter 'user1' credentials in MemCrypt login page
    And   I click on the Sign In button
    Then  I verify account in pending state validation message 'Once your account is approved, you will be able to log in. You will receive an email notification once the approval process is complete.'

  @Sanity @RegressionWorking
  Scenario: Verify that the Platform Admin can approve a user's sign-up request
    Given I open Browser
    And   I am logged as 'PlatformAdmin'
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I search the Org user 'user2' with email ID
    Then  I verify the Pending Approval 'user2' having 'Approve'
    And   I click on Approve button for the Pending Approval 'user2' having 'Approve'
    Then  I verify Approve popup window 'Are you sure you want to approve this user?'
    And   I click on Approve Button is the popup window
    Then  I verify user navigates to Approval Requests page 'Organizations Pending Approval'
    And   I click on Users page
    Then  I verify user navigates to Users page 'Organization Users'
    And   I search the Org user 'user2' with email ID
    Then  I verify the Pending Approval 'user2' having 'Approved'

  @Sanity @RegressionWorking
  Scenario: Verify that the Org user receives an email after the Platform Admin approves the sign-up request
    Given I open Browser
    And   I go to Mail URL
    And   I select the Mailbox Recipients for Org User
    And   I search for 'user2' related emails in the search box with email id
    Then  I verify and click if the user receives verification pending email 'user2' having 'Your account has been approved'
    And   I verify 'Your Account is Approved' message for approved user
    And   I click on Sign In button
    Then  I verify the Login Page - 'Sign In to Your Account'