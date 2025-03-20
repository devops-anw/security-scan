Feature: User Sign-Up Process

  @RegressionWorking
  Scenario: Verify that a new user cannot submit a sign-up request without providing the required details
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click on the Create an Account button
    Then  I verify the Signup Page- 'Sign Up'
    And   I click on the Sign-Up button without providing any details in the sign-up request form
    Then  I verify Organization validation message 'Organization name must be at least 3 characters.'
    Then  I verify First Name validation message 'First name must be at least 2 characters.'
    Then  I verify Last Name validation message 'Last name must be at least 2 characters.'
    Then  I verify SignUp validation message 'Please enter a valid email address.'
    Then  I verify Password validation message 'Password must be at least 8 characters.'

  @RegressionWorking
  Scenario: Verify that a new user cannot submit a sign-up request with mismatched passwords in the 'Password' and 'Confirm Password' fields
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click on the Create an Account button
    Then  I verify the Signup Page- 'Sign Up'
    And   I generate random user details for the sign-up
    And   I enter the Organization, First Name, Last Name, Email, and Password in the Sign-Up Form
    And   I enter 'Test2123' in the Confirm Password field
    And   I click on the Sign-Up button
    Then  I verify Confirm Password validation message "Passwords don't match."

  @RegressionWorking
  Scenario Outline: Verify that a new user cannot submit a sign-up request without satisfying the password policy
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click on the Create an Account button
    Then  I verify the Signup Page- 'Sign Up'
    And   I generate random user details for the sign-up
    And   I enter Organization, First Name, Last Name, Email details in User Sign Up form
    And   I enter '<Password>' and '<ConfirmPassword>'
    And   I click on the Sign-Up button
    Then  I verify Password validation message '<PasswordValidationMessage>'

    Examples:
      | Password | ConfirmPassword | PasswordValidationMessage                             |
      | test     | test            | Password must be at least 8 characters.               |
      | test1234 | test1234        | Password must contain at least one special character. |
      | testtttt | testtttt        | Password must contain at least one number.            |
      | 12345678 | 12345678        | Password must contain at least one letter.            |

  @Sanity @RegressionWorking
  Scenario Outline: Verify that a new user can submit a sign-up request with valid information
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click on the Create an Account button
    Then  I verify the Signup Page- 'Sign Up'
    And   I generate random user details for the sign-up
    And   I enter Organization, First Name, Last Name, Email, Password, Confirm Password in Signup Form
    And   I click on the Sign-Up button
    Then  I verify the success message : 'We’ve received your sign-up request and it’s currently under review. We’ll make sure to keep you updated via email. Thank you for your patience.'
    When  I store randomly generated credentials as '<userCredentials>'

    Examples:
      | userCredentials |
      | user1           |
      | user2           |

  @Sanity @RegressionWorking
  Scenario Outline: Verify whether the Platform Admin receives an email when a new user sign-up request is submitted
    Given I open Browser
    And   I go to Mail URL
    And   I select the Mailbox Recipients for Platform Admin
    And   I search for '<userCredentials>' related emails in the search box
    Then  I verify and click if the Platform Admin receives Pending Approval email '<userCredentials>' having 'New User Registration'
    And   I verify 'New User Registered' message for Platform Admin
    Then  I click on Approve or reject button under email and click on signIn account button
    Then  I verify the sign in page - 'Welcome to MemCrypt'
    Examples:
      | userCredentials |
      | user1           |
      | user2           |

  @Sanity @RegressionWorking
  Scenario Outline: Verify whether the user receives an email after their sign-up request is submitted
    Given I open Browser
    And   I go to Mail URL
    And   I select the Mailbox Recipients for Org User
    And   I search for '<userCredentials>' related emails in the search box with email id
    Then  I verify and click if the user receives verification pending email '<userCredentials>' having 'Verify Your Email'
    And   I verify 'Welcome' message in user email
    And   I click on Verify Email button
    Then  I verify the message as 'Email Verified Successfully!'

    Examples:
      | userCredentials |
      | user1           |
      | user2           |

  @RegressionWorking
  Scenario: Verify if the user can re-verify the email after successful email verification
    Given I open Browser
    And   I go to Mail URL
    And   I select the Mailbox Recipients for Org User
    And   I search for 'user1' related emails in the search box with email id
    Then  I verify and click if the user receives verification pending email 'user1' having 'Verify Your Email'
    And   I verify 'Welcome' message in user email
    And   I click on Verify Email button
    Then  I verify the message as 'Verification Failed'

  @RegressionWorking
  Scenario: Verify that the user cannot submit a sign-up request with an already taken Org Name
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click on the Create an Account button
    Then  I verify the Signup Page- 'Sign Up'
    And   I generate random user details for the sign-up
    And   I enter First Name, Last Name, Email, Password, Confirm Password in Signup Form
    And   I enter 'user1' used OrgName for new user SignUp request
    And   I click on the Sign-Up button
    Then  I verify Organization validation message 'This organization name is already taken. Please choose a different name.'

  @RegressionWorking
  Scenario: Verify that the user cannot submit a sign-up request with an already registered email address
    Given I open Browser
    And   I go to URL
    Then  I verify the Login Page - 'Sign In to Your Account'
    And   I click on the Create an Account button
    Then  I verify the Signup Page- 'Sign Up'
    And   I generate random user details for the sign-up
    And   I enter Organization, First Name, Last Name, Password, Confirm Password in Signup Form
    And   I enter 'user1' used email for new user sign up request
    And   I click on the Sign-Up button
    Then  I verify SignUp validation message 'An account with this email already exists. Please use a different email or sign in.'