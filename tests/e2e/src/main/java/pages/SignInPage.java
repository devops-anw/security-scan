package pages;

import Models.AccountModel;
import Models.AccountsRepository;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import managers.PlaywrightFactory;

import java.util.Properties;

public class SignInPage {
    private PlaywrightFactory pf;
    private String env;
    Page newTab;
    AccountModel account;
    private Properties prop;

    public SignInPage(PlaywrightFactory pf) {
        this.pf = pf;
        this.prop = pf.getEnvProp();
        this.env = pf.getProp().getProperty("env");
    }

    public void clickingOnCreateAccountButton() {
        pf.log("clicking on Create Account button");
        pf.click("createAccountButton_xpath", true);
    }

    public void saveLocalStorage(String userPref) {
        AccountModel account = AccountsRepository.getAccount(userPref, env);
        pf.saveCookies(account);
    }

    public void iAmVerifyingWhetherUserIsNavigatedToLoginPage(String actualText) {
        pf.log("Verifying whether user has been navigated to login page or not");
        pf.verifyText("loginPageVerification_xpath", actualText, true);
    }

    public void iAmEmailEnteringCredentialsInLoginPage(String emailAddress) {
        pf.log("Entering" + emailAddress + "credentials");
        pf.type("emailAddressTextBox_xpath", emailAddress, true);
    }

    public void iAmPasswordEnteringCredentialsInLoginPage(String password) {
        pf.log("Entering" + password + "credentials");
        pf.type("passwordTextBox_xpath", password, true);
    }

    public void clickingContinueWithGoogleButton() {
        pf.log("Clicking on Continue with Google button");
        pf.click("continueWithGoogleButton_xpath", true);
    }

    public void iVerifySignInPage(String actualText) {
        pf.log("Verifying whether Sign in is  displaying or not");
        pf.verifyText("signInPageVerification_xpath", actualText, true);
    }

    public void iEnterEmailCredentialsInSignInPage(String emailAddress) {
        pf.log("Entering" + emailAddress + "credentials");
        pf.type("emailAddress_xpath", emailAddress, true);
    }

    public void clickNextButton() {
        pf.log("clicking on next button");
        pf.click("nextButton_xpath", true);
    }

    public void iEnterPasswordCredentialsSignInPage(String password) {
        pf.log("Entering" + password + "credentials");
        pf.type("passwordText_xpath", password, true);
    }

    public void clickSignUpButton() {
        pf.log("Clicking on SignUp button");
        pf.click("signUpButton_xpath", true);
    }

    public void verifyHomePageText(String text) {
        pf.log("Verifying the Home page");
        pf.verifyText("homePageText_xpath", text, true);
    }

    public void verifyIncorrectAccountValidation(String text) {
        pf.log("verifying the email address is not found");
        pf.verifyText("emailAddressVerification_xpath", text, false);
    }

    public void verifyIncorrectGoogleAccountValidation(String text) {
        pf.log("verifying the google account is not found");
        pf.verifyText("invalidGoogleAccount_xpath", text, true);
    }

    public void verifyWrongPasswordValidation(String text) {
        pf.log("verifying the password");
        pf.verifyText("emailAddressVerification_xpath", text, true);
    }

    public void verifyWrongPasswordValidationForGoogleAccount(String text) {
        pf.log("verifying the password");
        pf.verifyText("wrongPassword_xpath", text, true);
    }

    public void clickSignInAccountButton() {
        pf.log("Click on the Sign In to Your Account button");
        pf.click("signInAccountButton_xpath", true);
        pf.waitForTimeout(3000);
    }

    public void verifyingSignInPage(String text) {
        pf.log("Verifying the Sign In page");
        pf.verifyText("welcomeText_xpath", text, true);
    }

    public void enteringSignInCredentials(String email, String password) {
        pf.log("Entering the Sign In details");
        pf.type("email_xpath", email, true);
        pf.type("passwordCredentials_xpath", password, true);
    }

    public void clickSignInButton() {
        pf.log("Click on the Sign In Button");
        pf.click("signInButton_xpath", true);
        pf.waitForTimeout(3000);
    }

    public void verifyIncorrectUserNamePasswordValidation(String validationMessage) {
        pf.log("Verifying Incorrect UserName or Password Validation Message");
        pf.verifyText("incorrectUserNamePasswordValidationText_xpath", validationMessage, true);
    }

    public void verifyAccountPendingValidationMessage(String accountPendingValidationMessage) {
        pf.log("Verifying Account Approval Pending Validation Message");
        pf.verifyText("accountApprovalPendingText_xpath", accountPendingValidationMessage, true);
    }

    public void enterUserCredentials(String username) {
        pf.log("Enter the User Credentials in Sign in page");
        pf.waitForTimeout(3000);
        account = AccountsRepository.getAccount(username, pf.getProp().getProperty("env"));
        pf.type("email_xpath", account.email, true);
        pf.type("passwordCredentials_xpath", account.password, true);
    }

    public void selectAdminUserMailBox() {
        pf.log("Select the Admin User Mail box");
        String recipient = this.prop.getProperty("adminMailbox.recipient");
        pf.click("userMailBoxDropDown_xpath", true);
        pf.selectTextFromDropDown("dropdown_xpath", recipient, true);
    }

    public void selectOrgUserMailBox() {
        pf.log("Select the Org User Mail box");
        String recipient = this.prop.getProperty("orgUserMailbox.recipient");
        pf.click("userMailBoxDropDown_xpath", true);
        pf.selectTextFromDropDown("dropdown_xpath", recipient, true);
    }

    public void searchUserEmails(String userOrgName) {
        pf.log("Search for user sign up request email sent to Admin");
        account = AccountsRepository.getAccount(userOrgName, pf.getProp().getProperty("env"));
        pf.type("searchBox_xpath", account.orgName, true);
        pf.click("refreshIcon_xpath", true);
    }

    public void verifyAndClickEmail(String userOrgName, String expectedSubject) {
        pf.log("Verifying the  email for user: " + account.orgName);
        account = AccountsRepository.getAccount(userOrgName, pf.getProp().getProperty("env"));
        Locator emailData = pf.getAllUsersWebElementFromTableInEmail("usersTable_xpath", account.email, 4, 30);
        String actualEmailContent = emailData.textContent().trim();
        pf.log("Email content: " + actualEmailContent);
        String expectedData = expectedSubject + " for " + account.orgName;
        if (actualEmailContent.equals(expectedSubject) || actualEmailContent.equals(expectedSubject + " for " + account.orgName)) {
            pf.reportPass("The  email ID '" + account.orgName + "' with subject '" + expectedSubject + "' is verified successfully.");
            emailData.click();
        } else {
            pf.reportFailure("Failed to verify the Pending Approval for email ID '" + account.orgName + "' with subject '" + expectedSubject + "'.", true);
        }
    }

    public void verifyEmailMessage(String newUserRegisteredMessage) {
        pf.log("Verifying the Email content received by Super Admin User");
        pf.waitForSpecificTime(3000);
        pf.verifyWithInIframe("iframe_xpath",
                "newUserRegisteredHeader_xpath", newUserRegisteredMessage);
    }

    public void clickApproveOrRejectButton() {
        Page newTab = pf.clickElementInIframeAndWaitForPopup("iframe_xpath", "approveOrReject_xpath");
        if (newTab != null) {
            pf.log("New tab opened with the link.");
            pf.clickElementInNewTab(newTab, "signInAccountButton_xpath");
        } else {
            pf.log("Failed to open the new tab.");
        }
        pf.switchToTab(1);
    }

    public void verifyMessageInUserEmail(String Message) {
        pf.log("verifying the " + Message + " message received by User");
        pf.waitForSpecificTime(3000);
        String welcomeMessage = Message + " " + account.orgName;
        pf.verifyWithInIframe("iframe_xpath", "welcomeHeader_xpath", welcomeMessage);
    }

    public void clickOnVerifyEmailButton() {
        newTab = pf.clickElementInIframeAndWaitForPopup("iframe_xpath", "verifyEmail_xpath");
        if (newTab != null) {
            pf.log("New tab opened with the link.");
            pf.switchToTab(1);
        } else {
            pf.log("Failed to open the new tab.");
        }
    }

    public void verifyingMessage(String verificationMessage) {
        if (newTab != null) {
            pf.log("verifying the message has " + verificationMessage);
            pf.verifyText("emailVerification_xpath", verificationMessage, true);
            pf.switchToTab(0);
            pf.refreshPage();
            newTab.close();
        }
    }

    public void verifyApprovedMessageInUserEmail(String Message) {
        pf.log("verifying the " + Message + " message received by User");
        pf.waitForSpecificTime(3000);
        pf.verifyWithInIframe("iframe_xpath", "ApprovedHeader_xpath", Message);
    }

    public void clickOnSignInButton() {
        pf.log("clicking on sign in button in email");
        newTab = pf.clickElementInIframeAndWaitForPopup("iframe_xpath", "signInButtonInEmail_xpath");
        if (newTab != null) {
            pf.log("New tab opened with the link.");
        } else {
            pf.log("Failed to open the new tab.");
        }

        pf.switchToTab(1);
    }

    public void verifyMessageForRejectedUser(String Message) {
        pf.log("verifying the " + Message + " message received by User");
        pf.waitForSpecificTime(3000);
        pf.verifyWithInIframe("iframe_xpath", "RejectedHeader_xpath", Message);
    }

    public void searchUserWithEmailID(String userEmail) {
        pf.log("Search for user sign up request email sent to Admin");
        account = AccountsRepository.getAccount(userEmail, pf.getProp().getProperty("env"));
        pf.type("searchBox_xpath", account.email, true);
        pf.click("refreshIcon_xpath", true);
    }
}