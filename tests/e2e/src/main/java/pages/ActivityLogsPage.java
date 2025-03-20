package pages;

import externalEndPoints.ConsoleEndPoints;
import managers.PlaywrightFactory;

public class ActivityLogsPage {
    private PlaywrightFactory pf;
    private String env;
    private ConsoleEndPoints consoleEndPoints;

    public ActivityLogsPage(PlaywrightFactory pf, ConsoleEndPoints consoleEndPoints) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
        this.consoleEndPoints = consoleEndPoints;
    }

    public void verifyActivityLogsPageNotAccessible() {
        pf.log("Verifying that the Activity Logs page is not accessible when logged in as Platform Admin");
        pf.isElementNotPresent("activityLogsPage_xpath", true);
    }

    public void verifyActivityLogsPageAvail() {
        pf.log("Verifying that the Activity Logs page is available when logged in as Org user");
        pf.isElementPresent("activityLogsPage_xpath", true);
    }

    public void clickOnActivityLogsPage() {
        pf.log("Clicking on the Activity Logs page");
        pf.click("activityLogsPage_xpath", true);
    }

    public void verifyActivityLogsPage(String activityLogsPageText) {
        pf.log("Verifying the Activity Logs Page");
        pf.verifyText("activityLogsPageText_xpath", activityLogsPageText, true);
    }

    public void verifyMessageWhenLogsNotAvl(String noLogsText) {
        pf.log("Verifying the " + noLogsText + "when log activity logs has been added");
        pf.verifyText("noLogsMessage_xpath", noLogsText, true);
    }

    public void createActivityLog() {
        pf.log("creating Activity Logs");
        consoleEndPoints.createActivityLog();
    }

    public void searchActivityLogs() {
        pf.log("Search the Activity Log with Activity Type");
        pf.type("activityLogSearchBar_xpath", ConsoleEndPoints.activityType, true);
    }
}