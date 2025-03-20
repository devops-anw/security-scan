package teststeps;

import context.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import pages.*;

public class ActivityLogsSteps {
    private TestContext context;
    private ActivityLogsPage activityLogsPage;
    private DeviceMonitorPage deviceMonitorPage;

    public ActivityLogsSteps(TestContext context) {
        this.context = context;
        this.activityLogsPage = context.getPageObjectManager().getActivityLogsPage();
        this.deviceMonitorPage = context.getPageObjectManager().getDeviceMonitorPage();
    }

    @Then("I verify that the Activity logs page is not Accessible")
    public void verifyActivityLogsPageNotAccessible() {
        activityLogsPage.verifyActivityLogsPageNotAccessible();
    }

    @Then("I verify the availability of Activity logs page")
    public void verifyActivityLogsPageAvail() {
        activityLogsPage.verifyActivityLogsPageAvail();
    }

    @And("I click the Activity Logs page")
    public void clickActivityLogsPage() {
        activityLogsPage.clickOnActivityLogsPage();
    }

    @And("I verify user is navigated to Activity Logs page {string}")
    public void verifyActivityLogsPage(String activityLogsPageText) {
        activityLogsPage.verifyActivityLogsPage(activityLogsPageText);
    }

    @And("I verify the message {string} on Activity Logs page")
    public void verifyMessageWhenLogsNotAvl(String noLogsText) {
        activityLogsPage.verifyMessageWhenLogsNotAvl(noLogsText);
    }

    @Given("I do a post call to Create Activity Log for Org user")
    public void createActivityLog() {
        activityLogsPage.createActivityLog();
    }

    @Then("I verify the message {string} on Activity Logs window")
    public void verifyNoLogsMessageOnLogsWindow(String text) {
        deviceMonitorPage.verifyNoLogsMessageOnLogsWindow(text);
    }

    @And("I search for activity logs with Activity Type")
    public void searchActivityLog() {
        deviceMonitorPage.searchActivityLog();
    }

    @Then("I verify the Activity log record created")
    public void verifyActivityLogRecord() {
        deviceMonitorPage.verifyActivityLogRecordInActivityLogsPage();
    }

    @And("I search for the Activity Logs with Activity Type")
    public void searchActivityLogs() {
        activityLogsPage.searchActivityLogs();
    }

    @Then("I verify that the  Activity log record created for device in Activity Logs window")
    public void verifyActivityLogRecordForDevice() {
        deviceMonitorPage.verifyActivityLogRecordForDevice();
    }

}