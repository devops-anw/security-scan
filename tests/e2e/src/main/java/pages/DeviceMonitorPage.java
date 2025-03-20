package pages;

import com.microsoft.playwright.Locator;
import externalEndPoints.ConsoleEndPoints;
import managers.PlaywrightFactory;

public class DeviceMonitorPage {

    private PlaywrightFactory pf;
    private String env;

    private ConsoleEndPoints consoleApi;

    public DeviceMonitorPage(PlaywrightFactory pf, ConsoleEndPoints consoleApi) {
        this.pf = pf;
        this.consoleApi = consoleApi;
        this.env = pf.getProp().getProperty("env");
    }

    public void clickDeviceMonitorPage() {
        pf.log("User navigates to Device Monitor page");
        pf.click("deviceMonitorPage_xpath", true);
    }

    public void devicePage(String pageText) {
        pf.log("Verifying user is navigated to Device Monitor Page");
        pf.verifyText("deviceMonitorPageText_xpath", pageText, true);
    }

    public void createDevice() {
        consoleApi.CreateDevice();
    }

    public void updateDeviceHeartBeat() {
        consoleApi.updateDeviceHeartBeat();
    }

    public void verifyDeviceHealth(String deviceHealth) {
        pf.log("Verifying the device Health status for serial number: " + ConsoleEndPoints.serialNumber);

        Locator data = pf.getAllUsersWebElementFromTable("devicesTable_xpath", ConsoleEndPoints.serialNumber, 4, 30);
        String actualAction = data.textContent();
        pf.log("Actual Device Health status: " + actualAction);

        if (actualAction.equals(deviceHealth)) {
            pf.reportPass("The Device Health status for serial number '" + ConsoleEndPoints.serialNumber + "' with expected action '" + deviceHealth + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Device Health status for serial number '" + ConsoleEndPoints.serialNumber + "' with expected action '" + deviceHealth + "'. Actual action: '" + actualAction + "'", true);
        }
    }

    public void waitAndVerifyDeviceHealth(String deviceHealth) {
        pf.log("Verifying the device Health status for serial number: " + ConsoleEndPoints.serialNumber);
        try {
            Thread.sleep(60000);
        } catch (InterruptedException e) {
            pf.log("Thread interrupted while waiting: " + e.getMessage());
        }
        pf.refreshPage();
        pf.log("Page refreshed.");
        Locator data = pf.getAllUsersWebElementFromTable("devicesTable_xpath", ConsoleEndPoints.serialNumber, 4, 30);
        String actualAction = data.textContent();
        pf.log("Actual Device Health status: " + actualAction);

        if (actualAction.equals(deviceHealth)) {
            pf.reportPass("The Device Health status for serial number '" + ConsoleEndPoints.serialNumber + "' with expected action '" + deviceHealth + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Device Health status for serial number '" + ConsoleEndPoints.serialNumber + "' with expected action '" + deviceHealth + "'. Actual action: '" + actualAction + "'", true);
        }
    }

    public void clickConfigButton(String serialNumber, String deviceHealth) {
        pf.log("Verifying the device Health status for serial number: " + serialNumber);
        Locator data = pf.getAllUsersWebElementFromTable("devicesTable_xpath", serialNumber, 4, 30);
        String actualAction = data.textContent();
        pf.log("Actual Device Health status: " + actualAction);

        if (actualAction.equals(deviceHealth)) {
            pf.reportPass("The Device Health status for serial number '" + serialNumber + "' with expected action '" + deviceHealth + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Device Health status for serial number '" + serialNumber + "' with expected action '" + deviceHealth + "'. Actual action: '" + actualAction + "'", true);
        }
    }

    public void searchDevice() {
        pf.log("Search the device with serial number");
        pf.type("deviceSearchBar_placeHolder", ConsoleEndPoints.serialNumber, true);
    }

    public void clickOnOption(String actionOption) {
        pf.log("Select the " + actionOption + " option");
        pf.click("ellipseButton_xpath", true);
        pf.getLocators("deviceActionsEllipseButton_xpath", actionOption, true);
    }

    public void verifyDeviceDetailsPopUp(String text) {
        pf.log("Verify Device Details Popup window");
        pf.verifyText("deviceDetailsPopUp_xpath", text, true);
    }

    public void verifyDeviceWithDeviceID() {
        pf.log("Clicking on the 'Copy' button to copy the Device ID");
        pf.click("deviceID_xpath", true);
        String copiedDeviceId = pf.evaluate("navigator.clipboard.readText()");
        pf.log("Copied Device ID: " + copiedDeviceId);
        if (copiedDeviceId.equals(ConsoleEndPoints.deviceID)) {
            pf.log("Device ID verified successfully: " + copiedDeviceId);
        } else {
            pf.log("Device ID verification failed! Expected: " + ConsoleEndPoints.deviceID + ", but found: " + copiedDeviceId);
        }
    }

    public void clickOnConfigOption(String configOption) {
        pf.log("Click on " + configOption + "to update");
        pf.getLocators("configOptionsTable_xpath", configOption, true);
    }

    public void clickOnEditButton() {
        pf.log("Click on Edit Button");
        pf.click("editButton_xpath", true);
    }

    public void updateMemcryptLogConfig(String port) {
        pf.log("Updating the Memcrypt Log Config");
        pf.clearData("portField_xpath", true);
        pf.type("portField_xpath", port, true);
    }

    public void updateAnalysisConfig(String encryptionKey) {
        pf.log("Updating the Analysis  Config");
        pf.clearData("encryptionKey_xpath", true);
        pf.type("encryptionKey_xpath", encryptionKey, true);
    }

    public void updateDecryptionConfig(String directoryCandidateValues) {
        pf.log("Updating the Decryption Config");
        pf.type("directoryCandidateValues_xpath", directoryCandidateValues, true);
    }

    public void updateBrandsConfig(String cPURedThreshold) {
        pf.log("Updating the Brands  Config");
        pf.clearData("redThreshold_xpath", true);
        pf.type("redThreshold_xpath", cPURedThreshold, true);
    }

    public void updateMonitorStatisticsConfig(String refreshInterval) {
        pf.log("Updating the  Monitor Statistics Config");
        pf.clearData("refreshInterval_xpath", true);
        pf.type("refreshInterval_xpath", refreshInterval, true);
    }

    public void updateWhitelistConfig(String inspectFolderPath) {
        pf.log("Updating the  Whitelist Config");
        pf.clearData("inspectFolder_xpath", true);
        pf.type("inspectFolder_xpath", inspectFolderPath, true);
    }

    public void updateExtractorConfig(String logSwitch) {
        pf.log("Updating the  Extractor Config");
        pf.clearData("logSwitch_xpath", true);
        pf.type("logSwitch_xpath", logSwitch, true);
    }

    public void clickSaveButton() {
        pf.log("Click on save button on Device Configuration popup window");
        pf.click("saveButtonDeviceConfig_xpath", true);
    }

    public void verifyDeviceConfigUpdatedMessage(String updatedMessage) {
        pf.log("Verifying Device Config " + updatedMessage + " message");
        pf.verifyText("configUpdateMessageText_xpath", updatedMessage, true);
    }

    public void verifyUpdatedMemcryptLogPort(String expectedPort) {
        pf.log("Verifying the updated Memcrypt Log Port value");
        String actualPort = pf.getAttribute("portField_xpath", "value", true);
        if (actualPort.equals(expectedPort)) {
            pf.reportPass("The Device Memcrypt Log config with expected port '" + expectedPort + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Memcrypt Log config. Expected: " + expectedPort + ", but found: " + actualPort, true);
        }
    }

    public void verifyUpdatedAnalysisEncryptionKey(String expectedEncryptionKey) {
        pf.log("Verifying the updated Memcrypt Log Port value");
        String actualKey = pf.getAttribute("encryptionKey_xpath", "value", true);
        if (actualKey.equals(expectedEncryptionKey)) {
            pf.reportPass("The Device Analysis with expected Encryption Key '" + expectedEncryptionKey + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Analysis. Expected: " + expectedEncryptionKey + ", but found: " + actualKey, true);
        }
    }

    public void verifyUpdatedDecryptionCandidateValue(String expectedCandidateValues) {
        pf.log("Verifying the updated Decryption Candidate Value");
        String actualValue = pf.getAttribute("directoryCandidateValues_xpath", "value", true);
        if (actualValue.equals(expectedCandidateValues)) {
            pf.reportPass("The Device Decryption with expected CandidateValue '" + expectedCandidateValues + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Decryption. Expected: " + expectedCandidateValues + ", but found: " + actualValue, true);
        }
    }

    public void verifyUpdatedBandsCPUThreshold(String expectedCPUThreshold) {
        pf.log("Verifying the updated Bands CPU Threshold Value");
        String actualCPUThreshold = pf.getAttribute("redThreshold_xpath", "value", true);
        if (actualCPUThreshold.equals(expectedCPUThreshold)) {
            pf.reportPass("The Device Decryption with expected CandidateValue '" + expectedCPUThreshold + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Decryption. Expected: " + expectedCPUThreshold + ", but found: " + actualCPUThreshold, true);
        }
    }

    public void verifyUpdatedMonitorStatistics(String expectedRefreshInterval) {
        pf.log("Verifying the updated MonitorStatistics RefreshInterval Value");
        String actualRefreshInterval = pf.getAttribute("refreshInterval_xpath", "value", true);
        if (actualRefreshInterval.equals(expectedRefreshInterval)) {
            pf.reportPass("The Device Monitor Statistics with expected RefreshInterval '" + expectedRefreshInterval + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Monitor Statistics . Expected: " + expectedRefreshInterval + ", but found: " + actualRefreshInterval, true);
        }
    }

    public void verifyUpdatedWhitelistFolderPath(String expectedFolderPath) {
        pf.log("Verifying the updated Whitelist Folder Path Value");
        String actualFolderPath = pf.getAttribute("inspectFolder_xpath", "value", true);
        if (actualFolderPath.equals(expectedFolderPath)) {
            pf.reportPass("The Device Whitelist with expected Folder Path '" + expectedFolderPath + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Whitelist . Expected: " + expectedFolderPath + ", but found: " + actualFolderPath, true);
        }
    }

    public void verifyNoDevicesMessage(String validationMessage) {
        pf.log("Verifying " + validationMessage + "in Devices page");
        pf.verifyText("noDevicesText_xpath", validationMessage, true);
    }

    public void verifyUpdatedExtractorLogSwitch(String expectedLogSwitchValue) {
        pf.log("Verifying the updated Extractor Log Switch Value");
        String actualLogSwitchValue = pf.getAttribute("logSwitch_xpath", "value", true);
        if (actualLogSwitchValue.equals(expectedLogSwitchValue)) {
            pf.reportPass("The Device Monitor Extractor Log Switch with expected RefreshInterval '" + expectedLogSwitchValue + "' is verified successfully.");
        } else {
            pf.reportFailure("Failed to verify the Extractor Log Switch . Expected: " + expectedLogSwitchValue + ", but found: " + actualLogSwitchValue, true);
        }
    }

    public void verifyApproveButtonNotPresent() {
        pf.isElementNotPresent("approveButton_xpath", true);
    }

    public void clickCloseButtonOnPopUpWindow() {
        pf.log("Clicking Close button on Device Config window");
        pf.click("closeButton_xpath", true);
    }

    public void verifyNoLogsMessageOnLogsWindow(String text) {
        pf.log("Verify No Logs Message on Activity Logs window");
        pf.verifyText("noLogsMessage_xpath", text, true);
    }

    public void searchActivityLog() {
        pf.log("Search the activity log with Activity Type");
        pf.type("activityLogSearchBar_xpath", ConsoleEndPoints.activityType, true);
    }

    public void verifyActivityLogRecordInActivityLogsPage() {
        pf.log("Verifying the Activity log record created");
        String actualSeverity = pf.getInnerTextFromTable("activityLogsTable_xpath", ConsoleEndPoints.deviceID, 3, 30);
        String actualActivityType = pf.getInnerTextFromTable("activityLogsTable_xpath", ConsoleEndPoints.deviceID, 2, 30);
        boolean activityTypeVerified = actualActivityType.equals(ConsoleEndPoints.activityType);
        boolean severityVerified = actualSeverity.equalsIgnoreCase(ConsoleEndPoints.severity);
        if (activityTypeVerified && severityVerified) {
            pf.reportPass("The Activity Type and Severity are verified successfully: '" + ConsoleEndPoints.activityType + "' and '" + ConsoleEndPoints.severity + "'.");
        } else {
            if (!activityTypeVerified) {
                pf.reportFailure("Failed to verify the Activity Type. Expected: '" + ConsoleEndPoints.activityType + "', but found: '" + actualActivityType + "'.", true);
            }
            if (!severityVerified) {
                pf.reportFailure("Failed to verify the Severity. Expected: '" + ConsoleEndPoints.severity + "', but found: '" + actualSeverity + "'.", true);
            }
        }
    }

    public void searchRecoveryList() {
        pf.log("Search the Recovery List with File Name");
        pf.type("recoverySearchBar_xpath", ConsoleEndPoints.fileName, true);
    }

    public void verifyActivityLogRecordForDevice() {
        pf.log("Verifying the Activity log record created");
        String actualSeverity = pf.getInnerTextFromTable("activityLogsTable_xpath", ConsoleEndPoints.activityType, 1, 30);
        boolean severityVerified = actualSeverity.equalsIgnoreCase(ConsoleEndPoints.severity);
        if (severityVerified) {
            pf.reportPass("The Activity Type and Severity are verified successfully: '" + ConsoleEndPoints.activityType + "' and '" + ConsoleEndPoints.severity + "'.");
        } else {
            pf.reportFailure("Failed to verify the Severity. Expected: '" + ConsoleEndPoints.severity + "', but found: '" + actualSeverity + "'.", true);
        }
    }

    public void verifyFileRecoveryRecordForDevice() {
        pf.log("Verifying the File Recovery record created for Device");
        String actualStatus = pf.getInnerTextFromTable("activityLogsTable_xpath", ConsoleEndPoints.recoveryMethod, 1, 30);
        boolean actualStatusVerified = actualStatus.equals(ConsoleEndPoints.status);
        if (actualStatusVerified) {
            pf.reportPass("The status is verified successfully: '" + ConsoleEndPoints.status + "'.");
        } else {
            pf.reportFailure("Failed to verify the status. Expected: '" + ConsoleEndPoints.status + "', but found: '" + actualStatus + "'.", true);
        }
    }

    public void clickOnClickHereLink() {
        pf.log("Clicking on Click here link on device monitor page");
        pf.click("clickHereLink_xpath", true);
    }

    public void verifyDeviceMonitorPageNotAccessible() {
        pf.log("Verifying that the Device Monitor page is not accessible when logged in as Platform Admin");
        pf.isElementNotPresent("deviceMonitorPage_xpath", true);
    }
}