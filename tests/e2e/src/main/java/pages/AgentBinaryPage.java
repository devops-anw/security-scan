package pages;

import managers.PlaywrightFactory;
public class AgentBinaryPage {

    private PlaywrightFactory pf;
    private String env;

    public AgentBinaryPage(PlaywrightFactory pf) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
    }

    public void verifyAgentBinaryPage(String agentBinaryPageText) {
        pf.log("Verifying Agent Binary page");
        pf.verifyText("agentBinaryPageText_xpath", agentBinaryPageText, true);
    }

    public void clickUploadNewVersionButton() {
        pf.log("Click on Upload New Version Button");
        pf.click("uploadButton_xpath", true);
    }

    public void verifyUploadPopUp(String uploadPopUpText) {
        pf.log("Verifying the Upload new version popup window");
        pf.verifyText("uploadPopUpWindowText_xpath", uploadPopUpText, true);
    }

    public void uploadFile(String fileName) {
        pf.log("Uploading the file: " + fileName);
        pf.uploadFile("fileSelector_xpath", "assets/" + fileName);
    }

    public void clickUploadAgentBinaryButton() {
        pf.log("Click on Upload Agent Binary button Popup window");
        pf.click("uploadBinaryFileButton_xpath", true);
    }

    public void verifyUploadSuccessfulMessage(String uploadedMessage) {
        pf.log("Verify " + uploadedMessage + "message");
        pf.verifyText("uploadedText_xpath", uploadedMessage, true);
        pf.click("uploadWindowClose_xpath", true);
    }

    public void verifyAgentBinaryFileSizeExceeds(String fileSizeExceedsMessage) {
        pf.log("Verify the Agent Binary file size exceeds validation message");
        pf.verifyText("fileSizeText_xpath", fileSizeExceedsMessage, true);
    }

    public void selectAgentBinaryVersion() {
        pf.log("Select the Agent Binary Version To download");
        pf.click("versionText_xpath", true);
        pf.verifyText("downloadButton_xpath", "Download", true);
    }

    public void downloadAgentBinaryFile() {
        pf.log("Download the Agent Binary File");
        pf.download("downloadButton_xpath", true);
        pf.verifyFileDownload("Downloads");
    }

    public void verifyFileTypeValidation(String fileTypeValidationMessage) {
        pf.log("Verify File Type Not supported validation message");
        pf.verifyText("fileTypeValidationText_xpath", fileTypeValidationMessage, true);
    }

    public void searchAgentBinaryFile(String fileName) {
        pf.log("Search for the Agent Binary " + fileName + "to be downloaded");
        pf.type("searchBox_placeHolder", fileName, true);
        String agentBinaryText = pf.getText("versionText_xpath", true);
        pf.log("Found Agent Binary Text: " + agentBinaryText);
    }

    public void clickOnAgentBinaryPage() {
        pf.log("Click on Agent Binary Page");
        pf.click("agentBinaryPage_xpath", true);
    }

    public void verifyAgentBinaryPageNotAccessible() {
        pf.log("Verifying that the Activity Logs page is not accessible when logged in as Org user");
        pf.isElementNotPresent("agentBinaryPage_xpath", true);
    }

    public void clickUploadAgentBinary() {
        pf.log("Click on Upload Agent Binary button Popup window");
        pf.click("uploadBinaryFileButton_xpath", true);
        pf.verifyText("uploadedText_xpath", "uploaded successfully", true);
        pf.click("uploadWindowClose_xpath", true);
    }
}