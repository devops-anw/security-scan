package pages;

import managers.PlaywrightFactory;

public class AgentDownloadPage {

    private PlaywrightFactory pf;
    private String env;

    public AgentDownloadPage(PlaywrightFactory pf) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
    }

    public void clickAgentDownloadPage() {
        pf.log("User navigates to Agent Download page");
        pf.click("agentDownloadPage_xpath", true);
    }

    public void verifyingAgentDownloadPage(String pageText) {
        pf.log("Verify user is navigated to Agent Download Page");
        pf.verifyText("agentDownloadPageText_xpath", pageText, true);
    }

    public void verifyInstallAgent(String installAgentMessage) {
        pf.log("Verifying Install Agent Text");
        pf.verifyText("installAgentMessageText_xpath", installAgentMessage, true);
    }

    public void verifyDownloadButtonAndText(String downloadButtonText, String text) {
        pf.log("Verify Download button and " + text);
        pf.verifyText("downloadButtonMemCryptAgent_xpath", downloadButtonText, true);
        pf.verifyText("agentDownloadPageText_xpath", text, true);
    }

    public void clickDownloadButton() {
        pf.log("Click on Download button to Install the MemCrypt Agent");
        pf.download("downloadButtonMemCryptAgent_xpath", true);
        pf.verifyFileDownload("Downloads");
    }

    public void clickAgentBinaryVersionsDropDown() {
        pf.log("Click on Download Other Agent Binary Versions dropdown");
        pf.click("agentDownloadPageText_xpath", true);
    }

    public void verifyDownloadAgentBinaryText(String text) {
        pf.log("Verifying " + text);
        pf.verifyText("agentDownloadPageText_xpath", text, true);
    }
}