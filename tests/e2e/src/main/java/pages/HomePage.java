package pages;

import managers.PlaywrightFactory;

public class HomePage {
    private PlaywrightFactory pf;
    private String env;

    public HomePage(PlaywrightFactory pf) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
    }

    public void clickApprovalRequestPage() {
        pf.log("Click on Approval Request Page");
        pf.click("approvalRequestPage_xpath", true);
    }

    public void clickOnUsersPage() {
        pf.log("Click on Users Page");
        pf.click("userPage_xpath", true);
    }

    public void clickLogoutButton() {
        pf.log("Click on Logout Button");
        pf.click("userIcon_xpath", true);
        pf.click("logoutButton_xpath", true);
    }

    public void clickDashboardPage() {
        pf.log("Clicking on the Dashboard Page");
        pf.click("dashboardPage_xpath", true);
    }
}