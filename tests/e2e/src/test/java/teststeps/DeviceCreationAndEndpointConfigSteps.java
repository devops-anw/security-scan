package teststeps;

import context.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import pages.*;

public class DeviceCreationAndEndpointConfigSteps {
    private TestContext context;
    private DeviceMonitorPage deviceMonitorPage;
    private OrganizationProfilePage organizationProfilePage;
    private DashboardPage dashboardPage;

    public DeviceCreationAndEndpointConfigSteps(TestContext context) {
        this.context = context;
        this.deviceMonitorPage = context.getPageObjectManager().getDeviceMonitorPage();
        this.organizationProfilePage = context.getPageObjectManager().getOrganizationProfilePage();
        this.dashboardPage = context.getPageObjectManager().getDashboardPage();
    }

    @And("I click the Organization Profile page")
    public void clickOrganizationProfilePage() {
        organizationProfilePage.clickOrganizationProfilePage();
    }

    @Then("I verify whether the user is navigates to Organization Profile page {string}")
    public void verifyOrganizationProfilePage(String pageText) {
        organizationProfilePage.verifyingOrganizationProfilePage(pageText);
    }

    @And("I select the Org ID of the {string}")
    public void selectOrgID(String user) {
        organizationProfilePage.selectOrgID();
        organizationProfilePage.storeOrgIdInAccount(user);
    }

    @And("I Do Post call to create a device")
    public void createDevice() {
        deviceMonitorPage.createDevice();
    }

    @And("I click the Device Monitor page")
    public void clickDeviceMonitorPage() {
        deviceMonitorPage.clickDeviceMonitorPage();
    }

    @Then("I verify user is navigated to Devices page {string}")
    public void devicePage(String pageText) {
        deviceMonitorPage.devicePage(pageText);
    }

    @And("I Do Post call to update the Device Heartbeat")
    public void updateDeviceHeartBeat() {
        deviceMonitorPage.updateDeviceHeartBeat();
    }

    @And("I verify that the device with the serial number has a Health status of {string}")
    public void verifyDeviceHealth(String deviceHealth) {
        deviceMonitorPage.verifyDeviceHealth(deviceHealth);
    }

    @And("I wait and verify that the device with the serial number has a Health status of {string}")
    public void waitAndVerifyDeviceHealth(String deviceHealth) {
        deviceMonitorPage.waitAndVerifyDeviceHealth(deviceHealth);
    }

    @And("I click on config button if the device with the {string} has a Health status of {string}")
    public void clickConfigButton(String serialNumber, String deviceHealth) {
        deviceMonitorPage.clickConfigButton(serialNumber, deviceHealth);
    }

    @And("I search the device with serial number")
    public void searchDevice() {
        deviceMonitorPage.searchDevice();
    }

    @And("I click on ellipsis button and select the {string} option")
    public void clickOnOption(String actionOption) {
        deviceMonitorPage.clickOnOption(actionOption);
    }

    @Then("I verify {string} popup window")
    public void verifyDeviceDetailsPopUp(String text) {
        deviceMonitorPage.verifyDeviceDetailsPopUp(text);
    }

    @Then("I verify the Device Details with the Device ID")
    public void verifyDeviceWithDeviceID() {
        deviceMonitorPage.verifyDeviceWithDeviceID();
    }

    @And("I select the {string} option on the Device Configuration popup window")
    public void clickOnConfigOption(String configOption) {
        deviceMonitorPage.clickOnConfigOption(configOption);
    }

    @And("I click on Edit button to update")
    public void clickOnEditButton() {
        deviceMonitorPage.clickOnEditButton();
    }

    @And("I update the port as {string}")
    public void updateMemcryptLogConfig(String port) {
        deviceMonitorPage.updateMemcryptLogConfig(port);
    }

    @And("I update the Encryption Key as {string}")
    public void updateAnalysisConfig(String encryptionKey) {
        deviceMonitorPage.updateAnalysisConfig(encryptionKey);
    }

    @And("I add the Directory Candidate Values as {string}")
    public void updateDecryptionConfig(String directoryCandidateValues) {
        deviceMonitorPage.updateDecryptionConfig(directoryCandidateValues);
    }

    @And("I update the CPU Red Threshold to {string}")
    public void updateBrandsConfig(String cPURedThreshold) {
        deviceMonitorPage.updateBrandsConfig(cPURedThreshold);
    }

    @And("I update Refresh Interval to {string}")
    public void updateMonitorStatisticsConfig(String refreshInterval) {
        deviceMonitorPage.updateMonitorStatisticsConfig(refreshInterval);
    }

    @And("I update the Inspect Folder path as {string}")
    public void updateWhitelistConfig(String inspectFolderPath) {
        deviceMonitorPage.updateWhitelistConfig(inspectFolderPath);
    }

    @And("I update Log Switch to {string}")
    public void updateExtractorConfig(String logSwitch) {
        deviceMonitorPage.updateExtractorConfig(logSwitch);
    }

    @And("I click on Save button on the Device Configuration popup window")
    public void clickSaveButton() {
        deviceMonitorPage.clickSaveButton();
    }

    @Then("I verify Device configuration updated message {string}")
    public void verifyDeviceConfigUpdatedMessage(String updatedMessage) {
        deviceMonitorPage.verifyDeviceConfigUpdatedMessage(updatedMessage);
    }

    @Then("I verify that the updated Memcrypt log port option is set to {string}")
    public void verifyUpdatedMemcryptLogPort(String expectedPort) {
        deviceMonitorPage.verifyUpdatedMemcryptLogPort(expectedPort);
    }

    @Then("I verify that the updated Analysis Encryption Key value is set to {string}")
    public void verifyUpdatedAnalysisEncryptionKey(String expectedEncryptionKey) {
        deviceMonitorPage.verifyUpdatedAnalysisEncryptionKey(expectedEncryptionKey);
    }

    @Then("I verify the updated Decryption Directory Candidate Values is set to {string}")
    public void verifyUpdatedDecryptionCandidateValue(String expectedCandidateValues) {
        deviceMonitorPage.verifyUpdatedDecryptionCandidateValue(expectedCandidateValues);
    }

    @Then("I verify the updated Bands CPU Red Threshold is set to {string}")
    public void verifyUpdatedBandsCPUThreshold(String expectedCPUThreshold) {
        deviceMonitorPage.verifyUpdatedBandsCPUThreshold(expectedCPUThreshold);
    }

    @Then("I verify that the updated Monitor Statistics Refresh Interval is set to {string}")
    public void verifyUpdatedMonitorStatistics(String expectedRefreshInterval) {
        deviceMonitorPage.verifyUpdatedMonitorStatistics(expectedRefreshInterval);
    }

    @Then("I verify that the updated Whitelist Inspect Folder path is set to {string}")
    public void verifyUpdatedWhitelistFolderPath(String expectedFolderPath) {
        deviceMonitorPage.verifyUpdatedWhitelistFolderPath(expectedFolderPath);
    }

    @Then("I verify that the updated Extractor Log Switch value is set to {string}")
    public void verifyUpdatedExtractorLogSwitch(String expectedLogSwitchValue) {
        deviceMonitorPage.verifyUpdatedExtractorLogSwitch(expectedLogSwitchValue);
    }

    @And("I verify {string} validation message in the Devices page")
    public void verifyNoDevicesMessage(String validationMessage) {
        deviceMonitorPage.verifyNoDevicesMessage(validationMessage);
    }

    @And("I verify approve button is not available in the device inventory section")
    public void verifyApproveButtonNotPresent() {
        deviceMonitorPage.verifyApproveButtonNotPresent();
    }

    @And("I click on close button on Actions Popup window")
    public void clickCloseButtonOnPopUpWindow() {
        deviceMonitorPage.clickCloseButtonOnPopUpWindow();
    }

    @And("I click on Click here link on Device Monitor Page")
    public void clickOnClickHereLink() {
        deviceMonitorPage.clickOnClickHereLink();
    }

    @Then("I verify that the Device Monitor page is not Accessible")
    public void verifyDeviceMonitorPageNotAccessible() {
        deviceMonitorPage.verifyDeviceMonitorPageNotAccessible();
    }
}