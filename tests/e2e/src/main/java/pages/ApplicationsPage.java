package pages;

import Models.AccountModel;
import Models.AccountsRepository;
import com.microsoft.playwright.Locator;
import externalEndPoints.ConsoleEndPoints;
import managers.PlaywrightFactory;

import java.util.List;

public class ApplicationsPage {

    private PlaywrightFactory pf;
    private String env;
    private ConsoleEndPoints consoleEndPoints;

    public ApplicationsPage(PlaywrightFactory pf, ConsoleEndPoints consoleEndPoints) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
        this.consoleEndPoints = consoleEndPoints;
    }

    public void clickApplicationsPage() {
        pf.log("Click on Applications page");
        pf.click("applicationsPage_xpath", true);
    }

    public void verifyApplicationsPage(String pageText) {
        pf.log("Verifying user is navigated to " + pageText);
        pf.verifyText("applicationPageText_xpath", pageText, true);
    }

    public void searchApplication() {
        pf.log("Search the application");
        pf.type("applicationSearchBar_placeHolder", ConsoleEndPoints.appName, true);
    }

    public void verifyApplicationPopupWindow(String popupText) {
        pf.log("Verifying Application Popup window");
        pf.verifyText("applicationPopupText_xpath", popupText, true);
    }

    public void clickRejectApplicationButton() {
        pf.log("Click on Reject button on popup window");
        pf.click("rejectApplicationButton_xpath", true);
    }

    public void verifyApplicationValidationMessage(String validationText) {
        pf.log("Verifying " + validationText + "message");
        pf.verifyText("noApplicationValidationText_xpath", validationText, true);
    }

    public void clickApproveApplicationButton() {
        pf.log("Click on Approve button on the application popup window");
        pf.click("approveApplicationButton_xpath", true);
    }

    public void createApplication(String userPref) {
        pf.log("creating application");
        AccountModel account = AccountsRepository.getAccount(userPref, env);
        consoleEndPoints.createGlobalApplication(account);
    }

    public void verifyApplicationWithStatus(String expectedStatus) {
        pf.log("Verifying the application status for application: " + ConsoleEndPoints.appName);
        pf.waitForTimeout(3000);
        Locator data = pf.getAllUsersWebElementFromTable("applicationTable_xpath", ConsoleEndPoints.appName, 3, 30);
        String actualStatus = data.textContent().trim();
        pf.log("Actual status: " + actualStatus);
        if (actualStatus.equalsIgnoreCase(expectedStatus)) {
            pf.reportPass("The application status for '" + ConsoleEndPoints.appName + "' is verified successfully with status: '" + expectedStatus + "'.");
        } else {
            pf.reportFailure("Failed to verify the application status for '" + ConsoleEndPoints.appName + "'. Expected status: '" + expectedStatus + "', but found: '" + actualStatus + "'.", true);
        }
    }

    public void verifyAllApplicationsWithStatus(String expectedStatus) {
        pf.waitForTimeout(3000);
        List<String> applicationNames = ConsoleEndPoints.applicationNames;
        for (String appName : applicationNames) {
            Locator data = pf.getAllUsersWebElementFromTable("applicationTable_xpath", appName, 3, 30);
            String actualStatus = data.textContent().trim();
            pf.log("Actual status for '" + appName + "': " + actualStatus);
            if (actualStatus.equalsIgnoreCase(expectedStatus)) {
                pf.reportPass("The application status for '" + appName + "' is verified successfully with status: '" + expectedStatus + "'.");
            } else {
                pf.reportFailure("Failed to verify the application status for '" + appName + "'. Expected status: '" + expectedStatus + "', but found: '" + actualStatus + "'.", true);
            }
        }
    }

    public void createDeviceInventory(int numOfApplications) {
        consoleEndPoints.createDeviceInventory(numOfApplications);
    }

    public void clickOnRejectButton() {
        pf.log("clicking on Reject button");
        pf.click("rejectButton_xpath", true);
    }

    public void clickOnApproveButton() {
        pf.log("clicking on Approve button");
        pf.click("approveButton_xpath", true);
    }

    public void clickOnApproveAllButton() {
        pf.log("clicking on ApproveAll button");
        pf.click("approveAllButton_xpath", true);
    }

    public void verifyApplicationsPageNotAccessible() {
        pf.log("Verifying that the Applications page is not accessible when logged in as Platform Admin");
        pf.isElementNotPresent("applicationsPage_xpath", true);
    }
}