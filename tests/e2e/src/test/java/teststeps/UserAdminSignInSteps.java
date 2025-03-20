package teststeps;

import com.microsoft.playwright.PlaywrightException;
import context.TestContext;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import io.cucumber.java.Status;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import managers.PlaywrightFactory;
import pages.*;

public class UserAdminSignInSteps {
    private TestContext context;
    private HomePage homepage;
    private SignInPage signInPage;
    private LandingPage landingPage;
    private DashboardPage dashboardPage;
    private PlaywrightFactory pf;

    public UserAdminSignInSteps(TestContext context, PlaywrightFactory pf) {
        this.context = context;
        this.homepage = context.getPageObjectManager().getHomePage();
        this.signInPage = context.getPageObjectManager().getSignInPage();
        this.landingPage = context.getPageObjectManager().getLandingPage();
        this.dashboardPage = context.getPageObjectManager().getDashboardPage();
        this.pf = pf;
    }

    @Before
    public void before(Scenario scenario) {
        String[] tags = scenario.getSourceTagNames().toArray(new String[0]);
        context.createScenario(scenario.getName(), tags);
        context.log("Starting scenario " + scenario.getName());
    }

    @After
    public void after(Scenario scenario) {
        context.log("Ending scenario " + scenario.getName());
        try {
            if (context.getPageObjectManager().getPlaywrightFactory().isBrowserInitialized()) {

                if (scenario.getStatus() == Status.FAILED) {
                    context.getPageObjectManager().getPlaywrightFactory().reportFailure("Scenario has not been finished correctly", true);
                } else if (scenario.getStatus() == Status.PASSED) {
                    context.getPageObjectManager().getPlaywrightFactory().reportPass("Scenario has  been finished correctly");
                }

                context.getPageObjectManager().getPlaywrightFactory().quit();
            }
            context.endScenario();
        } catch (PlaywrightException e) {
            context.log("Playwright browser or context was already closed: " + e.getMessage());
        } catch (Exception e) {
            context.log("Unexpected error in the after method: " + e.getMessage());
        }
    }

    @Given("I open Browser")
    public void launchBrowser() {
        landingPage.load();
    }

    @Given("I go to URL")
    public void navigateURl() {
        landingPage.url();
    }

    @Given("I save local storage as {string}")
    public void saveLocalStorage(String user) {
        signInPage.saveLocalStorage(user);
    }

    @Then("I verify the Login Page - {string}")
    public void iVerifyTheLoginPageSignInToDashBold(String actualText) {
        signInPage.iAmVerifyingWhetherUserIsNavigatedToLoginPage(actualText);
    }

    @And("I click on the Create an Account button")
    public void clickOnCreateAccountButton() {
        signInPage.clickingOnCreateAccountButton();
    }

    @When("I enter {string} email address credentials in Login Page")
    public void iEnterEmailCredentialsInLoginPage(String emailAddress) {
        signInPage.iAmEmailEnteringCredentialsInLoginPage(emailAddress);
    }

    @When("I enter {string} password credentials in Login Page")
    public void iEnterPasswordCredentialsInLoginPage(String password) {
        signInPage.iAmPasswordEnteringCredentialsInLoginPage(password);
    }

    @And("I click on Continue with Google button")
    public void clickContinueWithGoogleButton() {
        signInPage.clickingContinueWithGoogleButton();
    }

    @Then("I verify the Sign in Page - {string}")
    public void iVerifySignInPage(String actualText) {
        signInPage.iVerifySignInPage(actualText);
    }

    @When("I enter {string} email address credentials in Sign in with Google page")
    public void iEnterEmailCredentialsInSignInPage(String emailAddress) {
        signInPage.iEnterEmailCredentialsInSignInPage(emailAddress);
    }

    @And("I click on Next Button in Sign in page")
    public void clickNextButton() {
        signInPage.clickNextButton();
    }

    @When("I enter {string} password credentials in Sign in with Google Page")
    public void iEnterPasswordCredentialsSignInPage(String password) {
        signInPage.iEnterPasswordCredentialsSignInPage(password);
    }

    @And("I click on Sign Up Button")
    public void clickSignUpButton() {
        signInPage.clickSignUpButton();
    }

    @Then("I verify user is navigated to {string} page in the Dashbold")
    public void verifyHomePageText(String text) {
        signInPage.verifyHomePageText(text);
    }

    @Then("I verify incorrect  account validation message as : {string}")
    public void verifyIncorrectAccountValidation(String text) {
        signInPage.verifyIncorrectAccountValidation(text);
    }

    @Then("I verify incorrect google account validation message as : {string}")
    public void verifyIncorrectGoogleAccountValidation(String text) {
        signInPage.verifyIncorrectGoogleAccountValidation(text);
    }

    @Then("I verify Wrong password validation message: {string}")
    public void verifyWrongPasswordValidation(String text) {
        signInPage.verifyWrongPasswordValidation(text);
    }

    @Then("I verify Wrong password validation message for a google account: {string}")
    public void verifyWrongPasswordValidationForGoogleAccount(String text) {
        signInPage.verifyWrongPasswordValidationForGoogleAccount(text);
    }

    @And("I click the Sign In to Your Account button")
    public void clickSignInAccountButton() {
        signInPage.clickSignInAccountButton();
    }

    @Then("I verify the sign in page - {string}")
    public void verifySignInPage(String text) {
        signInPage.verifyingSignInPage(text);
    }

    @And("I enter the {string} and {string} Sign in page")
    public void enterSignInCredentials(String email, String password) {
        signInPage.enteringSignInCredentials(email, password);
    }

    @And("I click on the Sign In button")
    public void clickSignInButton() {
        signInPage.clickSignInButton();
    }

    @Then("I verify {string} validation message")
    public void verifyIncorrectUserNamePasswordValidation(String validationMessage) {
        signInPage.verifyIncorrectUserNamePasswordValidation(validationMessage);
    }

    @Then("I verify account in pending state validation message {string}")
    public void verifyAccountPendingValidationMessage(String accountPendingValidationMessage) {
        signInPage.verifyAccountPendingValidationMessage(accountPendingValidationMessage);
    }

    @Then("I verify that the Org user is navigated to {string}")
    public void verifyDashboardPage(String text) {
        dashboardPage.verifyingDashboardPage(text);
    }

    @And("I click on Approval Requests page")
    public void clickOnApprovalRequestPage() {
        homepage.clickApprovalRequestPage();
    }

    @And("I click on Logout button")
    public void clickLogoutButton() {
        homepage.clickLogoutButton();
    }

    @And("I enter {string} credentials in MemCrypt login page")
    public void enterUserCredentials(String userName) {
        signInPage.enterUserCredentials(userName);
    }

    @Given("I am logged as {string} before Device Registration")
    public void restoreCookies(String userPref) {
        pf.restoreCookies(userPref);
    }

    @And("I select the Mailbox Recipients for Platform Admin")
    public void selectAdminUserMailBox() {
        signInPage.selectAdminUserMailBox();
    }

    @And("I select the Mailbox Recipients for Org User")
    public void selectOrgUserMailBox() {
        signInPage.selectOrgUserMailBox();
    }

    @And("I search for {string} related emails in the search box")
    public void searchUserEmails(String userOrgName) {
        signInPage.searchUserEmails(userOrgName);
    }

    @And("I search for {string} related emails in the search box with email id")
    public void searchUserWithEmailID(String userEmail) {
        signInPage.searchUserWithEmailID(userEmail);
    }

    @Then("I verify and click if the Platform Admin receives Pending Approval email {string} having {string}")
    public void verifyPendingApprovalEmail(String userName, String subject) {
        signInPage.verifyAndClickEmail(userName, subject);
    }

    @Then("I verify {string} message for Platform Admin")
    public void verifyMessageInEmail(String text) {
        signInPage.verifyEmailMessage(text);
    }

    @Then("I click on Approve or reject button under email and click on signIn account button")
    public void clickApproveOrRejectButton() {
        signInPage.clickApproveOrRejectButton();
    }

    @Then("I verify and click if the user receives verification pending email {string} having {string}")
    public void verifyVerificationPendingEmail(String userName, String subject) {
        signInPage.verifyAndClickEmail(userName, subject);
    }

    @Then("I verify {string} message in user email")
    public void verifyMessageInUserEmail(String text) {
        signInPage.verifyMessageInUserEmail(text);
    }

    @Then("I click on Verify Email button")
    public void clickOnVerifyEmailButton() {
        signInPage.clickOnVerifyEmailButton();
    }

    @Then("I verify the message as {string}")
    public void verifyMessage(String text) {
        signInPage.verifyingMessage(text);
    }

    @Then("I verify {string} message for approved user")
    public void verifyMessageForApprovedUser(String approvedMessage) {
        signInPage.verifyApprovedMessageInUserEmail(approvedMessage);
    }

    @Then("I click on Sign In button")
    public void clickOnSignInButton() {
        signInPage.clickOnSignInButton();
    }

    @Then("I verify {string} message for rejected user")
    public void verifyMessageForRejectedUser(String rejectedMessage) {
        signInPage.verifyMessageForRejectedUser(rejectedMessage);
    }

    @And("I click the Dashboard page")
    public void clickDashboardPage() {
        homepage.clickDashboardPage();
    }

    @Given("I am logged as {string}")
    public void restoreCookiesAfterDeviceRegistration(String userPref) {
        pf.restoreCookiesAfterDeviceRegistration(userPref);
    }
}