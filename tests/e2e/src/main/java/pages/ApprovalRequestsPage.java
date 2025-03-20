package pages;

import Models.AccountModel;
import Models.AccountsRepository;
import com.microsoft.playwright.Locator;
import managers.PlaywrightFactory;

public class ApprovalRequestsPage {

    private PlaywrightFactory pf;
    private String env;

    AccountModel account;

    public ApprovalRequestsPage(PlaywrightFactory pf) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
    }

    public void verifyApprovalPageText(String approvalPageText) {
        pf.log("Verify user navigates to Approval Page");
        pf.verifyText("approvalPageText_xpath", approvalPageText, true);
    }

    public void verifyPendingAccountWithAction(String userName, String action) {
        pf.log("Verify the email with the action");
        account = AccountsRepository.getAccount(userName, pf.getProp().getProperty("env"));
        Locator data = pf.getAllUsersWebElementFromTable("pendingApprovalTable_xpath", account.email.toLowerCase(), 6, 30);
        String actualAction = data.textContent();
        pf.log(actualAction);
        if (actualAction.contains(action)) {
            pf.reportPass("The Pending Approval for email ID '" + account.email + "' with action '" + action + "' is verified successfully.");

        } else {
            pf.reportFailure("Failed to verify the Pending Approval for email ID '" + account.email + "' with action '" + action + "'.", true);
        }
    }

    public void clickActionButton(String userName, String action) {
        pf.log("Click on the " + action + "button");
        account = AccountsRepository.getAccount(userName, pf.getProp().getProperty("env"));
        Locator data = pf.getAllUsersWebElementFromTable("pendingApprovalTable_xpath", account.email.toLowerCase(), 6, 30);
        String actualAction = data.textContent();
        if (actualAction.contains(action)) {
            Locator button = data.locator("button:text('" + action + "')");
            if (button.isVisible()) {
                button.click();
                pf.reportPass("The User Details are verified, and the '" + action + "' action is performed for email: " + account.email);
            } else {
                pf.reportFailure("The specified action button '" + action + "' is not visible for email: " + account.email, true);
            }
        }
    }

    public void verifyRejectUserMessage(String text) {
        pf.log("Verifying " + text + "message");
        pf.verifyText("rejectUserPopUpText_xpath", text, true);
    }

    public void clickRejectButtonOnPopupWindow() {
        pf.log("Click on Reject Button in the popup window");
        pf.click("rejectButtonPopUp_xpath", true);
    }

    public void clickApproveButtonOnPopupWindow() {
        pf.log("Click on Reject Button in the popup window");
        pf.click("approveButtonPopUp_xpath", true);
    }

    public void verifyOrganizationProfilePageNotAvail() {
        pf.log("Verifying that the Organization Profile page is not available when logged in as Super Admin");
        pf.isElementNotPresent("orgProfilePage_xpath", true);
    }

    public void verifyApprovalRequestPageNotAccessible() {
        pf.log("Verifying that the Approval Request page is not accessible when logged in as Org User");
        pf.isElementNotPresent("approvalRequestPage_xpath", true);
    }

    public void searchOrgUser(String user) {
        pf.log("Search the Org user with email ID");
        account = AccountsRepository.getAccount(user, pf.getProp().getProperty("env"));
        pf.type("orgUserSearchBar_placeHolder", account.email, true);
    }
}