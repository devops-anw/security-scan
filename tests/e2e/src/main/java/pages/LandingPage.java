package pages;

import managers.PlaywrightFactory;

public class LandingPage {
    private PlaywrightFactory pf;

    public LandingPage(PlaywrightFactory pf) {
        this.pf = pf;
    }

    public void load() {
        pf.log("Opening the Browser");
        pf.openBrowser();
    }

    public void url() {
        pf.log("Navigating to url");
        pf.navigateURL("appURl");
    }

    public void emailUrl() {
        pf.log("Navigating to Email url");
        pf.navigateURL("emailURl");
    }
}