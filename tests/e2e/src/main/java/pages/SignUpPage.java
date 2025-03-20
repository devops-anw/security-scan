package pages;

import Models.AccountModel;
import Models.AccountsRepository;
import managers.PlaywrightFactory;

import java.util.Random;

public class SignUpPage {
    private PlaywrightFactory pf;
    private String env;
    AccountModel account;
    public String firstName, lastName, email, orgName, password;

    public SignUpPage(PlaywrightFactory pf) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
    }

    public void iAmVerifyingTheSignupPage(String actualText) {
        pf.log("Verifying whether user has been navigated to SignUp page or not");
        pf.verifyText("signUpPageVerification_xpath", actualText, true);
    }

    public void clickSignUpButton() {
        pf.log("Click on Sign Up button");
        pf.click("signUpButton_xpath", true);
    }

    public void generateRandomUserDetails() {
        firstName = "user";
        lastName = "Random" + generateRandomStringWithLength(5);
        email = firstName + lastName + "@abc.com";
        orgName = "random-Org" + " " + generateRandomStringWithLength(5);
        AccountModel accountModel = new AccountModel(firstName, orgName, firstName, lastName, email, null);
        password = accountModel.generateNewPassword(12);
    }

    private String generateRandomStringWithLength(int length) {
        int leftLimit = 97;
        int rightLimit = 122;
        Random random = new Random();
        return random.ints(leftLimit, rightLimit + 1)
                .limit(length)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }

    public void enterUserDetailsInSignUpForm() {
        pf.log("Enter the User Details in User Sign Up page");
        pf.type("orgName_placeHolder", orgName, true);
        pf.type("firstName_placeHolder", firstName, true);
        pf.type("lastName_placeHolder", lastName, true);
        pf.type("userEmail_placeHolder", email, true);
        pf.type("password_xpath", password, true);
        pf.type("confirmPassword_xpath", password, true);
    }

    public void successMessage(String message) {
        pf.log("Verify the User Signup Request Successful Message");
        pf.verifyText("successMessage_xpath", message, true);
    }

    public void storeUserCredentials(String userName) {
        pf.log("Store User Details");
        AccountsRepository.SaveUser(new AccountModel(userName, orgName, firstName, lastName, email, password), pf.getProp().getProperty("env"));
    }

    public void verifyOrganizationValidationMessage(String OrganizationValidationMessage) {
        pf.log("Verifying Organization field required validation message");
        pf.verifyText("OrganizationValidationText_xpath", OrganizationValidationMessage, true);
    }

    public void verifyFirstNameValidationMessage(String firstNameValidationMessage) {
        pf.log("Verifying First Name field required validation message");
        pf.verifyText("firstNameValidationText_xpath", firstNameValidationMessage, true);
    }

    public void verifyLastNameValidationMessage(String lastNameValidationMessage) {
        pf.log("Verifying Last Name field required validation message");
        pf.verifyText("lastNameValidationText_xpath", lastNameValidationMessage, true);
    }

    public void verifyEmailValidationMessage(String emailNameValidationMessage) {
        pf.log("Verifying Email field required validation message");
        pf.verifyText("emailValidationText_xpath", emailNameValidationMessage, true);
    }

    public void verifyPasswordValidationMessage(String passwordNameValidationMessage) {
        pf.log("Verifying Password field required validation message");
        pf.verifyText("passwordValidationText_xpath", passwordNameValidationMessage, true);
    }

    public void enterUserCredentialsWithoutEmail() {
        pf.log("Enter the User Details in User Sign Up page");
        pf.type("orgName_placeHolder", orgName, true);
        pf.type("firstName_placeHolder", firstName, true);
        pf.type("lastName_placeHolder", lastName, true);
        pf.type("password_xpath", password, true);
        pf.type("confirmPassword_xpath", password, true);
    }

    public void enterUserCredentialsWithoutOrg() {
        pf.log("Enter the User Details in User Sign Up page");
        pf.type("firstName_placeHolder", firstName, true);
        pf.type("lastName_placeHolder", lastName, true);
        pf.type("userEmail_placeHolder",email,true);
        pf.type("password_xpath", password, true);
        pf.type("confirmPassword_xpath", password, true);
    }

    public void enterEmail(String email) {
        pf.log("Enter the Email in the Sign Up page");
        account = AccountsRepository.getAccount(email, pf.getProp().getProperty("env"));
        pf.type("userEmail_placeHolder", account.email, true);
    }

    public void enterOrgName(String orgName) {
        pf.log("Enter the Email in the Sign Up page");
        account = AccountsRepository.getAccount(orgName, pf.getProp().getProperty("env"));
        pf.type("orgName_placeHolder", account.orgName, true);
    }

    public void enterUserCredentialsWithoutConfirmPassword() {
        pf.log("Enter the User Details in User Sign Up page");
        pf.type("orgName_placeHolder", orgName, true);
        pf.type("firstName_placeHolder", firstName, true);
        pf.type("lastName_placeHolder", lastName, true);
        pf.type("password_xpath", password, true);
    }

    public void enterConfirmPassword(String confirmPassword) {
        pf.log("Enter the Confirm Password details in the Sign Up page");
        pf.type("confirmPassword_xpath", confirmPassword, true);
    }

    public void verifyConfirmPasswordValidationMessage(String confirmPasswordValidationMessage) {
        pf.log("Verifying Confirm Password validation message");
        pf.verifyText("confirmPasswordValidationText_xpath", confirmPasswordValidationMessage, true);
    }

    public void enterUserCredentialsWithoutPassword() {
        pf.log("Enter the User Details in User Sign Up page");
        pf.type("orgName_placeHolder", orgName, true);
        pf.type("firstName_placeHolder", firstName, true);
        pf.type("lastName_placeHolder", lastName, true);
        pf.type("userEmail_placeHolder", email, true);
    }

    public void enterPasswordDetails(String password, String confirmPassword) {
        pf.log("Enter the Password and Confirm Password details in the Sign Up page");
        pf.type("password_xpath", password, true);
        pf.type("confirmPassword_xpath", confirmPassword, true);
    }

    public void clickOnSignInButtonInSignUp() {
        pf.log("Click on Sign In button in Sign Up page");
        pf.click("signInButtonInSignInPage_xpath", true);
    }

    public void enterExistingUserDetails(String userName) {
        pf.log("Enter the existing user details");
        account = AccountsRepository.getAccount(userName, pf.getProp().getProperty("env"));
        pf.type("orgName_placeHolder", account.orgName, true);
        pf.type("firstName_placeHolder", account.firstName, true);
        pf.type("lastName_placeHolder", account.lastName, true);
        pf.type("userEmail_placeHolder", account.email, true);
        pf.type("password_xpath", account.password, true);
        pf.type("confirmPassword_xpath", account.password, true);
    }

    public void verifyOrgAndEmailValidationMessage(String validationMessage) {
        pf.log("Verifying Validation message when providing already used Org Name and email address");
        pf.verifyText("validationMessage_xpath", validationMessage, true);
    }
}