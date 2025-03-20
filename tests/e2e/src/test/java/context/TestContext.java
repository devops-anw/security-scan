package context;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import managers.PageObjectManager;
import reports.ExtentManager;

public class TestContext {
    private final PageObjectManager pageObjectManager;
    private ExtentReports report;
    private ExtentTest test;

    public TestContext() {
        report = ExtentManager.getReports();
        this.pageObjectManager = new PageObjectManager();
    }

    public PageObjectManager getPageObjectManager() {
        return pageObjectManager;
    }

    public void createScenario(String scenarioName, String[] tags) {
        test = report.createTest(scenarioName);

        for (String tag : tags) {
            if (tag.startsWith("@Category_")) {
                String category = tag.replace("@Category_", "");
                test.assignCategory(category);
                test.log(Status.INFO, "Test case category: " + category);
            }
            this.pageObjectManager.getPlaywrightFactory().init(test);
        }
    }

    public void endScenario() {
        this.pageObjectManager.getPlaywrightFactory().stopTracing();
        this.pageObjectManager.getPlaywrightFactory().quit();
        report.flush();
    }

    public void log(String msg) {
        this.pageObjectManager.getPlaywrightFactory().log(msg);
    }
}