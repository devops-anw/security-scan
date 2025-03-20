package teststeps;

import context.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Then;
import pages.*;

public class AdminApproveRejectUserSignupSteps {
    private TestContext context;
    private HomePage homepage;
    private ApprovalRequestsPage approvalRequestsPage;
    private UsersPage usersPage;
    private AgentBinaryPage agentBinaryPage;


    public AdminApproveRejectUserSignupSteps(TestContext context) {
        this.context = context;
        this.homepage = context.getPageObjectManager().getHomePage();
        this.approvalRequestsPage = context.getPageObjectManager().getApprovalRequestPage();
        this.usersPage = context.getPageObjectManager().getUsersPage();
        this.agentBinaryPage = context.getPageObjectManager().getAgentBinaryPage();
    }

    @Then("I verify user navigates to Approval Requests page {string}")
    public void verifyApprovalPageText(String approvalPageText) {
        approvalRequestsPage.verifyApprovalPageText(approvalPageText);
    }

    @And("I click on Users page")
    public void clickOnUsersPage() {
        homepage.clickOnUsersPage();
    }

    @Then("I verify user navigates to Users page {string}")
    public void verifyUsersPage(String usersPageText) {
        usersPage.verifyUsersPage(usersPageText);
    }

    @Then("I verify the Pending Approval {string} having {string}")
    public void verifyPendingAccountWithAction(String email, String action) {
        approvalRequestsPage.verifyPendingAccountWithAction(email, action);
    }

    @And("I click on Reject button for the Pending Approval {string} having {string}")
    public void clickRejectButton(String email, String action) {
        approvalRequestsPage.clickActionButton(email, action);
    }

    @And("I click on Approve button for the Pending Approval {string} having {string}")
    public void clickApproveButton(String email, String action) {
        approvalRequestsPage.clickActionButton(email, action);
    }

    @Then("I verify reject popup window {string}")
    public void verifyRejectUserMessage(String text) {
        approvalRequestsPage.verifyRejectUserMessage(text);
    }

    @Then("I verify Approve popup window {string}")
    public void verifyApproveUserMessage(String text) {
        approvalRequestsPage.verifyRejectUserMessage(text);
    }

    @And("I click on Reject Button is the popup window")
    public void clickRejectButtonOnPopupWindow() {
        approvalRequestsPage.clickRejectButtonOnPopupWindow();
    }

    @And("I click on Approve Button is the popup window")
    public void clickApproveButtonOnPopupWindow() {
        approvalRequestsPage.clickApproveButtonOnPopupWindow();
    }

    @Then("I verify that the Approval Request page is not Accessible")
    public void verifyApprovalRequestPageNotAccessible() {
        approvalRequestsPage.verifyApprovalRequestPageNotAccessible();
    }

    @Then("I verify that the User page is not Accessible")
    public void verifyUsersPageNotAccessible() {
        usersPage.verifyUsersPageNotAccessible();
    }

    @Then("I verify that the Agent Binary page is not Accessible")
    public void verifyAgentBinaryPageNotAccessible() {
        agentBinaryPage.verifyAgentBinaryPageNotAccessible();
    }

    @And("I search the Org user {string} with email ID")
    public void searchOrgUser(String user) {
        approvalRequestsPage.searchOrgUser(user);
    }
}