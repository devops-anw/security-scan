package teststeps;

import context.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import pages.DashboardPage;
import pages.*;

public class OrganizationProfileSteps {

    private DashboardPage dashboardPage;
    private ApprovalRequestsPage approvalRequestsPage;
    private OrganizationProfilePage organizationProfilePage;
    private UsersPage usersPage;

    public OrganizationProfileSteps(TestContext context) {
        this.dashboardPage = context.getPageObjectManager().getDashboardPage();
        this.approvalRequestsPage = context.getPageObjectManager().getApprovalRequestPage();
        this.organizationProfilePage = context.getPageObjectManager().getOrganizationProfilePage();
        this.usersPage = context.getPageObjectManager().getUsersPage();
    }

    @And("I click on user icon and select the Profile Option")
    public void clickProfileButton() {
        dashboardPage.clickProfileButton();
    }

    @Then("I verify that the Organization Profile page is not Visible")
    public void verifyOrganizationProfilePageNotAvail() {
        approvalRequestsPage.verifyOrganizationProfilePageNotAvail();
    }

    @Then("I verify the availability of the Edit button")
    public void verifyEditOrgProfileButton() {
        organizationProfilePage.verifyEditOrgProfileButton();
    }

    @And("I click on the Edit Organization Profile button")
    public void clickEditOrgProfileButton() {
        organizationProfilePage.clickEditOrgProfileButton();
    }

    @And("I update the FirstName and LastName with values {string} and {string}")
    public void updateFirstAndLastName(String firstName, String lastName) {
        organizationProfilePage.updateFirstAndLastName(firstName, lastName);
    }

    @And("I verify the First Name validation message as {string}")
    public void verifyFirstNameValidation(String firstNameValidationMessage) {
        organizationProfilePage.verifyFirstNameValidation(firstNameValidationMessage);
    }

    @And("I verify the Last Name validation message as {string}")
    public void verifyLastNameValidation(String lastNameValidationMessage) {
        organizationProfilePage.verifyLastNameValidation(lastNameValidationMessage);
    }

    @And("I verify the First Name with Whitespaces validation message as {string}")
    public void verifyFirstNameWhitespacesValidationMessage(String firstNameValidationMessage) {
        organizationProfilePage.verifyFirstNameWhitespacesValidationMessage(firstNameValidationMessage);
    }

    @And("I verify the Last Name with Whitespaces validation message as {string}")
    public void verifyLastNameWhitespacesValidationMessage(String firstNameValidationMessage) {
        organizationProfilePage.verifyLastNameWhitespacesValidationMessage(firstNameValidationMessage);
    }

    @Then("I verify that the Save Button is Disabled")
    public void verifySaveButtonDisabled() {
        organizationProfilePage.verifySaveButtonDisabled();
    }

    @And("I update the First name and Last Name data with the same existing details of {string}")
    public void updateOrgProfileWithExistingSameData(String userName) {
        organizationProfilePage.updateOrgProfileWithExistingSameData(userName);
    }

    @And("I click on Save button to update the Organization Profile")
    public void clickSaveOrgProfileButton() {
        organizationProfilePage.clickSaveOrgProfileButton();
    }

    @Then("I verify that the updated {string} and {string} values are reflected")
    public void verifyUpdatedOrgData(String firstName, String lastName) {
        organizationProfilePage.verifyUpdatedOrgData(firstName, lastName);
    }

    @Then("I verify that the Organization Name and Email ID fields are disabled")
    public void verifyOrgAndEmailDisabled() {
        organizationProfilePage.verifyOrgAndEmailDisabled();
    }

    @And("I click on the Cancel button on Organization Profile page")
    public void clickCancelOnOrgProfile() {
        organizationProfilePage.clickCancelOnOrgProfile();
    }

    @Then("I verify that the changes are not saved and that the original details are displayed for {string}")
    public void verifyOriginalDetailsUnchanged(String userName) {
        organizationProfilePage.verifyUpdatedOrgUserDetails(userName);
    }

    @And("I store updated the FirstName and LastName with values {string} and {string} for {string}")
    public void updateFirstAndLastNameInAccount(String firstName, String lastName, String user) {
        organizationProfilePage.updateFirstAndLastNameInAccount(firstName, lastName, user);
    }

    @And("I search for user {string}")
    public void searchUser(String userName) {
        usersPage.searchUser(userName);
    }

    @Then("I verify the Updated FirstName and LastName for {string}")
    public void verifyUpdatedOrgUserDetails(String userName) {
        organizationProfilePage.verifyUpdatedOrgUserDetails(userName);
    }

    @Then("I verify the updated First Name and Last Name for {string} as an Platform Admin")
    public void verifyUpdatedOrgUserDetailsAsAdminUser(String userName) {
        usersPage.verifyUpdatedOrgUserDetailsAsAdminUser(userName);
    }
}