package pages;

import externalEndPoints.ConsoleEndPoints;
import managers.PlaywrightFactory;

public class RecoveryPage {
    private PlaywrightFactory pf;
    private String env;
    private ConsoleEndPoints consoleEndPoints;

    public RecoveryPage(PlaywrightFactory pf, ConsoleEndPoints consoleEndPoints) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
        this.consoleEndPoints = consoleEndPoints;
    }

    public void verifyRecoveryPageNotAccessible() {
        pf.log("Verifying that the Recovery page is not available when logged in as Platform Admin");
        pf.isElementNotPresent("recoveryPage_xpath", true);
    }

    public void verifyRecoveryPageAvail() {
        pf.log("Verifying that the Recovery page is available when logged in as Org user");
        pf.isElementPresent("recoveryPage_xpath", true);
    }

    public void clickOnRecoveryPage() {
        pf.log("Clicking on the Activity Logs page");
        pf.click("recoveryPage_xpath", true);
    }

    public void verifyRecoveryPage(String recoveryPageText) {
        pf.log("Verifying that the user is navigated to Recovery Page");
        pf.verifyText("recoveryPageText_xpath", recoveryPageText, true);
    }

    public void createFileRecovery() {
        pf.log("creating File Recovery");
        consoleEndPoints.createFileRecovery();
    }

    public void searchRecoveryRecord() {
        pf.log("Search the Recovery Record with fileName");
        pf.type("recoverySearchBar_xpath", ConsoleEndPoints.fileName, true);
    }

    public void verifyFileRecoveryRecordInRecoveryPage() {
        pf.log("Verifying the Recovery record created");
        String actualStatus = pf.getInnerTextFromTable("activityLogsTable_xpath", ConsoleEndPoints.deviceID, 3, 30);
        String actualRecoveryMethod = pf.getInnerTextFromTable("activityLogsTable_xpath", ConsoleEndPoints.deviceID, 4, 30);
        boolean actualStatusVerified = actualStatus.equals(ConsoleEndPoints.status);
        boolean actualRecoveryMethodVerified = actualRecoveryMethod.equalsIgnoreCase(ConsoleEndPoints.recoveryMethod);
        if (actualStatusVerified && actualRecoveryMethodVerified) {
            pf.reportPass("The status and Recovery Method are verified successfully: '" + ConsoleEndPoints.status + "' and '" + ConsoleEndPoints.recoveryMethod + "'.");
        } else {
            if (!actualStatusVerified) {
                pf.reportFailure("Failed to verify the status . Expected: '" + ConsoleEndPoints.status + "', but found: '" + actualStatus + "'.", true);
            }
            if (!actualRecoveryMethodVerified) {
                pf.reportFailure("Failed to verify the Recovery Method. Expected: '" + ConsoleEndPoints.recoveryMethod + "', but found: '" + actualRecoveryMethod + "'.", true);
            }
        }
    }
}