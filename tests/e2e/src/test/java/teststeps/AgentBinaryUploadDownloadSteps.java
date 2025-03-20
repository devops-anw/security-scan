package teststeps;

import context.TestContext;
import externalEndPoints.AssetAPI;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import pages.*;

public class AgentBinaryUploadDownloadSteps {
    private TestContext context;
    private AgentBinaryPage agentBinaryPage;
    private DashboardPage dashboardPage;
    private AgentDownloadPage agentDownloadPage;
    private AssetAPI assetAPI;

    public AgentBinaryUploadDownloadSteps(TestContext context) {
        this.context = context;
        this.agentBinaryPage = context.getPageObjectManager().getAgentBinaryPage();
        this.dashboardPage = context.getPageObjectManager().getDashboardPage();
        this.agentDownloadPage = context.getPageObjectManager().getAgentDownloadPage();
        assetAPI = new AssetAPI(context.getPageObjectManager().getPlaywrightFactory());
    }

    @Then("I verify user is navigated to {string} page")
    public void verifyAgentBinaryPage(String agentBinaryPageText) {
        agentBinaryPage.verifyAgentBinaryPage(agentBinaryPageText);
    }

    @And("I click on Upload New Version button")
    public void clickUploadNewVersionButton() {
        agentBinaryPage.clickUploadNewVersionButton();
    }

    @Then("I verify the {string} popup window")
    public void verifyUploadPopUp(String uploadPopUpText) {
        agentBinaryPage.verifyUploadPopUp(uploadPopUpText);
    }

    @And("I upload the file {string}")
    public void uploadFile(String fileName) {
        agentBinaryPage.uploadFile(fileName);
    }

    @And("I click on Upload Agent Binary file button on the popup window")
    public void clickUploadAgentBinaryButton() {
        agentBinaryPage.clickUploadAgentBinaryButton();
    }

    @Then("I verify {string} message")
    public void verifyUploadSuccessfulMessage(String uploadedMessage) {
        agentBinaryPage.verifyUploadSuccessfulMessage(uploadedMessage);
    }

    @Then("I verify {string} validation message in Agent Binary file upload popup window")
    public void verifyAgentBinaryFileSizeExceeds(String fileSizeExceedsMessage) {
        agentBinaryPage.verifyAgentBinaryFileSizeExceeds(fileSizeExceedsMessage);
    }

    @And("I select the Agent Binary Version")
    public void selectAgentBinaryVersion() {
        agentBinaryPage.selectAgentBinaryVersion();
    }

    @And("I download the Agent Binary file")
    public void downloadAgentBinaryFile() {
        agentBinaryPage.downloadAgentBinaryFile();
    }

    @And("I click on download button to Install the MemCrypt Agent")
    public void clickDownloadButton() {
        agentDownloadPage.clickDownloadButton();
    }

    @And("I verify {string} available for Org user")
    public void verifyDownloadAgentBinaryText(String text) {
        agentDownloadPage.verifyDownloadAgentBinaryText(text);
    }

    @And("I click on Download Other Agent Binary Versions dropdown")
    public void clickAgentBinaryVersionsDropDown() {
        agentDownloadPage.clickAgentBinaryVersionsDropDown();
    }

    @And("I click on Agent Binary page")
    public void clickOnAgentBinaryPage() {
        agentBinaryPage.clickOnAgentBinaryPage();
    }

    @And("I verify {string} message on the Agent Download page")
    public void verifyInstallAgent(String installAgentMessage) {
        agentDownloadPage.verifyInstallAgent(installAgentMessage);
    }

    @Then("I verify the File Format not supported validation message {string}")
    public void verifyFileTypeValidation(String fileTypeValidationMessage) {
        agentBinaryPage.verifyFileTypeValidation(fileTypeValidationMessage);
    }

    @And("I search for the file {string} in the Agent Binary Search bar")
    public void searchAgentBinaryFile(String fileName) {
        agentBinaryPage.searchAgentBinaryFile(fileName);
    }

    @Then("I verify {string} Button and {string} available on the Agent Download page")
    public void verifyDownloadButtonAndText(String downloadButtonText, String text) {
        agentDownloadPage.verifyDownloadButtonAndText(downloadButtonText, text);
    }

    @And("I click on Agent Download page")
    public void clickAgentDownloadPage() {
        agentDownloadPage.clickAgentDownloadPage();
    }

    @Then("I verify user is navigated to Agent Downloads page {string}")
    public void verifyAgentDownloadPage(String pageText) {
        agentDownloadPage.verifyingAgentDownloadPage(pageText);
    }

    @Then("I store the uploaded file with version name")
    public void storeUploadedFileNameWithVersion() {
        assetAPI.storeFileNameWithVersion();
    }

    @And("I click on Upload Agent Binary file button on the popup window to upload new binary version")
    public void clickUploadAgentBinary() {
        agentBinaryPage.clickUploadAgentBinary();
    }
}