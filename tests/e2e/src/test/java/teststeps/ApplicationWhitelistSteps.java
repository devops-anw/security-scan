package teststeps;

import context.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import pages.*;

public class ApplicationWhitelistSteps {
    private TestContext context;
    private ApplicationsPage applicationsPage;
    private DeviceMonitorPage deviceMonitorPage;

    public ApplicationWhitelistSteps(TestContext context) {
        this.context = context;
        this.applicationsPage = context.getPageObjectManager().getApplicationsPage();
        this.deviceMonitorPage = context.getPageObjectManager().getDeviceMonitorPage();
    }

    @And("I click the Applications page")
    public void clickApplicationsPage() {
        applicationsPage.clickApplicationsPage();
    }

    @Then("I verify user is navigated to Applications page {string}")
    public void verifyApplicationsPage(String pageText) {
        applicationsPage.verifyApplicationsPage(pageText);
    }

    @And("I search for the application with the application name")
    public void searchApplication() {
        applicationsPage.searchApplication();
    }

    @Then("I verify the Application Popup window {string}")
    public void verifyApplicationPopupWindow(String popupText) {
        applicationsPage.verifyApplicationPopupWindow(popupText);
    }

    @And("I click on Reject button on the popup window")
    public void clickRejectApplicationButton() {
        applicationsPage.clickRejectApplicationButton();
    }

    @Then("I verify {string} validation message on Application Inventory section")
    public void verifyApplicationValidationMessage(String validationText) {
        applicationsPage.verifyApplicationValidationMessage(validationText);
    }

    @And("I click on Approve button on the popup window")
    public void clickApproveApplicationButton() {
        applicationsPage.clickApproveApplicationButton();
    }

    @And("I do a post call to Create an Application for {string}")
    public void createApplication(String user) {
        applicationsPage.createApplication(user);
    }

    @And("I verify the application having the status as {string}")
    public void verifyApplicationWithStatus(String status) {
        applicationsPage.verifyApplicationWithStatus(status);
    }

    @And("I verify the all application having the status as {string}")
    public void verifyAllApplicationsWithStatus(String status) {
        applicationsPage.verifyAllApplicationsWithStatus(status);
    }

    @And("I do a post call to Create Device Inventory with {int} application for user2")
    public void createDeviceInventory(int numOfApplications) {
        applicationsPage.createDeviceInventory(numOfApplications);
    }

    @And("I click on Reject button corresponding to the application")
    public void clickOnRejectButton() {
        applicationsPage.clickOnRejectButton();
    }

    @And("I click on Approve button corresponding to the application")
    public void clickOnApproveButton() {
        applicationsPage.clickOnApproveButton();
    }

    @And("I click on approveAll button")
    public void clickOnApproveAllButton() {
        applicationsPage.clickOnApproveAllButton();
    }

    @Then("I verify that the Applications page is not Accessible")
    public void verifyApplicationsPageNotAccessible() {
        applicationsPage.verifyApplicationsPageNotAccessible();
    }
}
