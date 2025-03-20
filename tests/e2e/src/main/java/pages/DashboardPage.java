package pages;

import managers.PlaywrightFactory;

public class DashboardPage {

    private PlaywrightFactory pf;
    private String env;

    public DashboardPage(PlaywrightFactory pf) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
    }

    public void verifyingDashboardPage(String text) {
        pf.log("Verifying user navigates to Dashboard page");
        pf.verifyText("dashboardText_xpath", text, true);
    }

    public void clickProfileButton() {
        pf.log("Click on profile Button");
        pf.click("userIcon_xpath", true);
        pf.click("profile_xpath", true);
    }
}