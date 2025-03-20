package teststeps;

import context.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import pages.*;

public class UserSignUpSteps {

    private SignUpPage signUpPage;
    private LandingPage landingPage;

    public UserSignUpSteps(TestContext context) {
        this.signUpPage = context.getPageObjectManager().getSignUpPage();
        this.landingPage = context.getPageObjectManager().getLandingPage();
    }

    @Then("I verify the Signup Page- {string}")
    public void iVerifyTheSignupPage(String actualText) {
        signUpPage.iAmVerifyingTheSignupPage(actualText);
    }

    @And("I click on the Sign-Up button")
    public void clickSignUpButton() {
        signUpPage.clickSignUpButton();
    }

    @And("I click on the Sign-Up button without providing any details in the sign-up request form")
    public void clickSignUpButtonWithoutEnteringDetails() {
        signUpPage.clickSignUpButton();
    }

    @And("I generate random user details for the sign-up")
    public void generateRandomUserDetails() {
        signUpPage.generateRandomUserDetails();
    }

    @And("I enter Organization, First Name, Last Name, Email, Password, Confirm Password in Signup Form")
    public void enterUserDetailsInSignUpForm() {
        signUpPage.enterUserDetailsInSignUpForm();
    }

    @Then("I verify the success message : {string}")
    public void successMessage(String message) {
        signUpPage.successMessage(message);
    }

    @And("I store randomly generated credentials as {string}")
    public void saveUserCredentials(String userName) {
        signUpPage.storeUserCredentials(userName);
    }

    @Then("I verify Organization validation message {string}")
    public void verifyOrganizationValidationMessage(String OrganizationValidationMessage) {
        signUpPage.verifyOrganizationValidationMessage(OrganizationValidationMessage);
    }

    @Then("I verify First Name validation message {string}")
    public void verifyFirstNameValidationMessage(String firstNameValidationMessage) {
        signUpPage.verifyFirstNameValidationMessage(firstNameValidationMessage);
    }

    @Then("I verify Last Name validation message {string}")
    public void verifyLastNameValidationMessage(String lastNameValidationMessage) {
        signUpPage.verifyLastNameValidationMessage(lastNameValidationMessage);
    }

    @Then("I verify SignUp validation message {string}")
    public void verifyEmailValidationMessage(String emailValidationMessage) {
        signUpPage.verifyEmailValidationMessage(emailValidationMessage);
    }

    @Then("I verify Password validation message {string}")
    public void verifyPasswordValidationMessage(String passwordValidationMessage) {
        signUpPage.verifyPasswordValidationMessage(passwordValidationMessage);
    }

    @And("I enter Organization, First Name, Last Name, Password, Confirm Password in Signup Form")
    public void enterUserCredentialsWithoutEmail() {
        signUpPage.enterUserCredentialsWithoutEmail();
    }

    @And("I enter First Name, Last Name, Email, Password, Confirm Password in Signup Form")
    public void enterUserCredentialsWithoutOrg() {
        signUpPage.enterUserCredentialsWithoutOrg();
    }

    @And("I enter {string} used email for new user sign up request")
    public void enterEmail(String email) {
        signUpPage.enterEmail(email);
    }

    @And("I enter {string} used OrgName for new user SignUp request")
    public void enterOrgName(String orgName) {
        signUpPage.enterOrgName(orgName);
    }

    @And("I enter the Organization, First Name, Last Name, Email, and Password in the Sign-Up Form")
    public void enterUserCredentialsWithoutConfirmPassword() {
        signUpPage.enterUserCredentialsWithoutConfirmPassword();
    }

    @And("I enter {string} in the Confirm Password field")
    public void enterConfirmPassword(String confirmPassword) {
        signUpPage.enterConfirmPassword(confirmPassword);
    }

    @Then("I verify Confirm Password validation message {string}")
    public void verifyConfirmPasswordValidationMessage(String confirmPasswordValidationMessage) {
        signUpPage.verifyConfirmPasswordValidationMessage(confirmPasswordValidationMessage);
    }

    @And("I enter Organization, First Name, Last Name, Email details in User Sign Up form")
    public void enterUserCredentialsWithoutPassword() {
        signUpPage.enterUserCredentialsWithoutPassword();
    }

    @And("I enter {string} and {string}")
    public void enterPasswordDetails(String password, String confirmPassword) {
        signUpPage.enterPasswordDetails(password, confirmPassword);
    }

    @And("I click on the Sign In button in Sign Up page")
    public void clickOnSignInButtonInSignUp() {
        signUpPage.clickOnSignInButtonInSignUp();
    }

    @Given("I go to Mail URL")
    public void navigateEmailURl() {
        landingPage.emailUrl();
    }

    @And("I enter the existing {string} details in Signup page")
    public void enterExistingUserDetails(String userName) {
        signUpPage.enterExistingUserDetails(userName);
    }

    @Then("I verify validation message {string} is displayed")
    public void verifyOrgAndEmailValidationMessage(String OrganizationValidationMessage) {
        signUpPage.verifyOrgAndEmailValidationMessage(OrganizationValidationMessage);
    }
}