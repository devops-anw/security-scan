package pages;

import Models.AccountModel;
import Models.AccountsRepository;
import managers.PlaywrightFactory;
import externalEndPoints.ConsoleEndPoints;

import java.util.Arrays;

public class OrganizationProfilePage {

    private PlaywrightFactory pf;
    private ConsoleEndPoints consoleApi;
    public static String orgID;
    public static String actualFirstName, actualLastName, fullName;
    AccountModel account;
    private String env;

    public OrganizationProfilePage(PlaywrightFactory pf, ConsoleEndPoints consoleApi) {
        this.pf = pf;
        this.consoleApi = consoleApi;
        this.env = pf.getProp().getProperty("env");
    }

    public void clickOrganizationProfilePage() {
        pf.log("Click on Organization Profile page");
        pf.click("orgProfilePage_xpath", true);
    }

    public void verifyingOrganizationProfilePage(String pageText) {
        pf.log("Verify user is navigated to Organization Profile Page");
        pf.verifyText("organizationProfilePageText_xpath", pageText, true);
    }

    public void selectOrgID() {
        pf.log("Taking the user Org ID");
        pf.click("orgID_xpath", true);

        String clipboardValue = pf.evaluate("navigator.clipboard.readText()");
        pf.log("Clipboard Value Retrieved: " + clipboardValue);
        if (clipboardValue == null || clipboardValue.isEmpty()) {
            pf.log("No Org ID found in clipboard. Please check the click action.");
            throw new RuntimeException("Failed to retrieve Org ID from clipboard.");
        } else {
            orgID = clipboardValue;
            pf.log("Found User Org ID: " + orgID);
        }
    }

    public void verifyEditOrgProfileButton() {
        pf.log("Verifying the availability of Edit Org profile button");
        pf.isElementPresent("editOrgProfileButton_xpath", true);
    }

    public void clickEditOrgProfileButton() {
        pf.log("Click on the Edit button in Organization Profile Page");
        pf.click("editOrgProfileButton_xpath", true);
    }

    public void updateFirstAndLastName(String firstName, String lastName) {
        pf.log("Updating " + firstName + " " + lastName + " with data");
        pf.clearData("firstName_xpath", true);
        pf.type("firstName_xpath", firstName, true);
        pf.clearData("lastName_xpath", true);
        pf.type("lastName_xpath", lastName, true);
    }

    public void verifyFirstNameValidation(String firstNameValidationMessage) {
        pf.log("verifying " + firstNameValidationMessage + "message");
        pf.verifyText("firstNameOrgValidationText_xpath", firstNameValidationMessage, true);
    }

    public void verifyLastNameValidation(String lastNameValidationMessage) {
        pf.log("verifying " + lastNameValidationMessage + "message");
        pf.verifyText("lastNameOrgValidationText_xpath", lastNameValidationMessage, true);
    }

    public void verifyFirstNameWhitespacesValidationMessage(String firstNameValidationMessage) {
        pf.log("verifying " + firstNameValidationMessage + "message");
        pf.verifyText("firstNameWhiteSpaceValidationText_xpath", firstNameValidationMessage, true);
    }

    public void verifyLastNameWhitespacesValidationMessage(String lastNameValidationMessage) {
        pf.log("verifying " + lastNameValidationMessage + "message");
        pf.verifyText("lastNameWhiteSpaceValidationText_xpath", lastNameValidationMessage, true);
    }

    public void verifySaveButtonDisabled() {
        pf.log("verifying that the Save Button is disabled when no changes are made");
        pf.isElementDisabled("saveProfileButton_xpath", true);
    }

    public void updateOrgProfileWithExistingSameData(String userName) {
        pf.log("Updating the Org profile with existing same data");
        account = AccountsRepository.getAccount(userName, pf.getProp().getProperty("env"));
        pf.clearData("firstName_xpath", true);
        pf.type("firstName_xpath", account.firstName, true);
        pf.clearData("lastName_xpath", true);
        pf.type("lastName_xpath", account.lastName, true);
    }

    public void clickSaveOrgProfileButton() {
        pf.log("Click on Save Profile Button");
        pf.click("saveProfileButton_xpath", true);
    }

    public void verifyUpdatedOrgData(String expectedFirstName, String expectedLastName) {
        pf.log("Verifying the updated First Name and Last Name");
        actualFirstName = pf.getAttribute("firstName_xpath", "value", true);
        actualLastName = pf.getAttribute("lastName_xpath", "value", true);

        if (actualFirstName.equals(expectedFirstName)) {
            pf.reportPass("The First Name is verified successfully: '" + expectedFirstName + "'.");
        } else {
            pf.reportFailure("Failed to verify the First Name. Expected: '" + expectedFirstName + "', but found: '" + actualFirstName + "'.", true);
        }

        if (actualLastName.equals(expectedLastName)) {
            pf.reportPass("The Last Name is verified successfully: '" + expectedLastName + "'.");
        } else {
            pf.reportFailure("Failed to verify the Last Name. Expected: '" + expectedLastName + "', but found: '" + actualLastName + "'.", true);
        }
    }

    public void verifyOrgAndEmailDisabled() {
        pf.log("Verifying that the Organization and Email ID are disabled");
        pf.isElementDisabled("organization_xpath", true);
        pf.isElementPresent("emailID_xpath", true);
    }

    public void clickCancelOnOrgProfile() {
        pf.log("Click on Cancel Button on Organization page");
        pf.click("cancelOrgProfileButton_xpath", true);
    }

    public void updateFirstAndLastNameInAccount(String firstName, String lastName, String user) {
        pf.log("Updating " + firstName + " " + lastName + " in account model");
        account = AccountsRepository.getAccount(user, pf.getProp().getProperty("env"));
        AccountsRepository.SaveUser(new AccountModel(account.username, account.orgName, firstName, lastName, account.email, account.password, account.orgId), pf.getProp().getProperty("env"));
    }

    public void verifyUpdatedOrgUserDetails(String userName) {
        pf.log("Verifying the Updated Organization user details");
        account = AccountsRepository.getAccount(userName, pf.getProp().getProperty("env"));
        fullName = pf.getText("userFullName_xpath", true);
        String[] nameParts = fullName.split(" ");
        String actualFirstName = nameParts[0];
        String actualLastName = String.join(" ", Arrays.copyOfRange(nameParts, 1, nameParts.length));
        if (actualFirstName.equals(account.firstName)) {
            pf.reportPass("The First Name is verified successfully: '" + account.firstName + "'.");
        } else {
            pf.reportFailure("Failed to verify the First Name. Expected: '" + account.firstName + "', but found: '" + actualFirstName + "'.", true);
        }

        if (actualLastName.equals(account.lastName)) {
            pf.reportPass("The Last Name is verified successfully: '" + account.lastName + "'.");
        } else {
            pf.reportFailure("Failed to verify the Last Name. Expected: '" + account.lastName + "', but found: '" + actualLastName + "'.", true);
        }
    }

    public void storeOrgIdInAccount(String user) {
        pf.log("Storing the org id in account model");
        AccountModel existedAccountModel = AccountsRepository.getAccount(user, env);
        AccountModel accountModel = new AccountModel(existedAccountModel, orgID);
        AccountsRepository.SaveUser(accountModel, env);
    }
}