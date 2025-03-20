package managers;

import Models.AccountModel;
import Models.AccountsRepository;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.markuputils.ExtentColor;
import com.aventstack.extentreports.markuputils.MarkupHelper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.*;
import org.testng.Reporter;
import org.testng.asserts.SoftAssert;
import reports.ExtentManager;

import java.awt.*;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.*;

public class PlaywrightFactory {
    private Properties prop;
    private Properties envProp;
    private SoftAssert softAssert;
    private static ExtentTest test;
    private static ThreadLocal<Browser> tlBrowser = new ThreadLocal<>();
    private static ThreadLocal<BrowserContext> tlBrowserContext = new ThreadLocal<>();
    private static ThreadLocal<Page> tlPage = new ThreadLocal<>();
    private static ThreadLocal<Playwright> tlPlaywright = new ThreadLocal<>();

    public static Playwright getPlaywright() {
        return tlPlaywright.get();
    }

    public static Browser getBrowser() {
        return tlBrowser.get();
    }

    public static BrowserContext getBrowserContext() {
        return tlBrowserContext.get();
    }

    public static Page getPage() {
        return tlPage.get();
    }

    public PlaywrightFactory() {
        if (prop == null) {
            prop = new Properties();
            envProp = new Properties();
            try {
                File directoryPath = new File(System.getProperty("user.dir") + "/src/test/resources/properties");
                File filesList[] = directoryPath.listFiles();
                for (File file : filesList) {
                    FileInputStream propertyFiles = new FileInputStream(
                            System.getProperty("user.dir") + "/src/test/resources/properties/" + file.getName());
                    prop.load(propertyFiles);
                }
                prop.setProperty("env",System.getProperty("env"));
                String env = prop.getProperty("env") + ".properties";
                FileInputStream envPropertyFile = new FileInputStream(
                        System.getProperty("user.dir") + "/src/test/resources/properties/" + env);
                envProp.load(envPropertyFile);
            } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            softAssert = new SoftAssert();
        }
    }

    public Properties getEnvProp() {
        return envProp;
    }

    public Properties getProp() {
        return prop;
    }

    public Page openBrowser() {
        Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
        int width = (int) screenSize.getWidth();
        int height = (int) screenSize.getHeight() - 100;
        tlPlaywright.set(Playwright.create());
        boolean headless = Boolean.parseBoolean(System.getProperty("playwright.headless", "true"));
        String browserName = prop.getProperty("browserName");
        switch (browserName.toLowerCase()) {
            case "chromium":
                tlBrowser.set(getPlaywright().chromium().launch(new BrowserType.LaunchOptions().setHeadless(headless).setSlowMo(Double.parseDouble(prop.getProperty("speed")))));
                break;
            case "firefox":
                tlBrowser.set(getPlaywright().firefox().launch(new BrowserType.LaunchOptions().setHeadless(headless).setSlowMo(Double.parseDouble(prop.getProperty("speed")))));
                break;
            case "webkit":
                tlBrowser.set(getPlaywright().webkit().launch(new BrowserType.LaunchOptions().setHeadless(headless).setSlowMo(Double.parseDouble(prop.getProperty("speed")))));
                break;
            case "chrome":
                tlBrowser.set(getPlaywright().chromium().launch(new BrowserType.LaunchOptions().setChannel("chrome").setHeadless(headless).setSlowMo(Double.parseDouble(prop.getProperty("speed")))));
                break;
            default:
                log("Please provide proper browser ");
                break;
        }
        tlBrowserContext.set(getBrowser().newContext(new Browser.NewContextOptions().setViewportSize(width, height).setRecordVideoDir(Paths.get("videos/")).setRecordVideoSize(900, 600).setPermissions(Arrays.asList("clipboard-read", "clipboard-write"))));
        getBrowserContext().tracing().start(new Tracing.StartOptions()
                .setScreenshots(true)
                .setSnapshots(true)
                .setSources(true));
        tlPage.set(getBrowserContext().newPage());
        return getPage();
    }

    public void init(ExtentTest test) {
        this.test = test;
    }

    public void navigateURL(String UrlKey) {
        getPage().navigate(envProp.getProperty(UrlKey));
    }

    public void stopTracing() {
        getBrowserContext().tracing().stop(new Tracing.StopOptions()
                .setPath(Paths.get("trace.zip")));
    }

    public static String takeScreenShot() {
        Date d = new Date();
        String screenshotFile = d.toString().replace(":", "_").replace(" ", "_") + ".png";
        String screenshotFilePath = ExtentManager.screenshotFolderPath + "/" + screenshotFile;
        byte[] screenshotBytes = getPage().screenshot(new Page.ScreenshotOptions().setPath(Paths.get(screenshotFilePath)).setFullPage(true));
        String base64Screenshot = null;
        base64Screenshot = Base64.getEncoder().encodeToString(screenshotBytes);
        test.log(Status.INFO, "Screenshot-> "
                + test.addScreenCaptureFromPath("screenshots" + "/" + screenshotFile));
        return base64Screenshot;
    }

    public Locator getLocator(String locatorKey, boolean assertType) {
        Locator l = null;
        if (locatorKey.endsWith("_xpath")) {
            l = getPage().locator(prop.getProperty(locatorKey));
        } else if (locatorKey.endsWith("_id")) {
            l = getPage().getByTestId(prop.getProperty(locatorKey));
        } else if (locatorKey.endsWith("_label")) {
            l = getPage().getByLabel(prop.getProperty(locatorKey));
        } else if (locatorKey.endsWith("_placeHolder")) {
            l = getPage().getByPlaceholder(prop.getProperty(locatorKey));
        } else if (locatorKey.endsWith("_text")) {
            l = getPage().getByText(prop.getProperty(locatorKey));
        } else if (locatorKey.endsWith("_altText")) {
            l = getPage().getByAltText(prop.getProperty(locatorKey));
        } else if (locatorKey.endsWith("_title")) {
            l = getPage().getByTitle(prop.getProperty(locatorKey));
        } else if (locatorKey.endsWith("_link")) {
            l = getPage().getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName(prop.getProperty(locatorKey)));
        } else if (locatorKey.endsWith("_img")) {
            l = getPage().getByRole(AriaRole.IMG, new Page.GetByRoleOptions().setName(prop.getProperty(locatorKey)));
        } else {
            log("LocatorKey is not correct " + locatorKey);
            reportFailure("Locatorykey is not correct" + " " + locatorKey, assertType);

        }
        return l;
    }

    public void click(String locatorKey, boolean assertType) {
        getLocator(locatorKey, assertType).click();
    }

    public String getText(String locatorKey, boolean assertType) {
        return getLocator(locatorKey, assertType).innerText();
    }

    public void type(String locatorKey, String value, boolean assertType) {
        getLocator(locatorKey, assertType).fill(value);
    }

    public boolean isBrowserInitialized() {
        return getBrowser() != null || getBrowserContext() != null;
    }

    public void quit() {
        if (getPage() != null) {
            getPage().close();
        }
    }

    public void waitForSpecificTime(int milliseconds) {
        getPage().waitForTimeout(milliseconds);
    }

    public void reportPass(String msg) {
        test.log(Status.PASS, MarkupHelper.createLabel(msg, ExtentColor.GREEN));
        takeScreenShot();
    }

    public void reportFailure(String failureMsg, boolean stopOnFailure) {
        test.log(Status.FAIL, MarkupHelper.createLabel(failureMsg, ExtentColor.RED));
        takeScreenShot();

        softAssert.fail(failureMsg);
        if (stopOnFailure == true) {
            Reporter.getCurrentTestResult().getTestContext().setAttribute("CriticalFailure", "Y");
            AssertAll();
        }
    }

    public void AssertAll() {
        softAssert.assertAll();
    }

    public void log(String msg) {
        test.log(Status.INFO, msg);
    }

    public void getLocators(String locatorKey, String option, boolean assertType) {
        Locator buttons = getLocator(locatorKey, assertType);
        for (int i = 0; i <= buttons.count(); i++) {
            String text = buttons.nth(i).textContent();
            if (text.contains(option)) {
                buttons.nth(i).click();
                break;
            }
        }
    }

    public boolean verifyText(String locatorkey, String text, boolean assertType) {
        String ActualText = getLocator(locatorkey, assertType).textContent().trim().replaceAll("[\\t\\n\\r]+", " ");
        if (ActualText.equals(text)) {
            reportPass(text + " is present in the webpage based on the locatorkey");
            return true;
        } else {
            reportFailure(text + " is not present in the webpage based on the locatorkey", assertType);
            return false;
        }
    }

    public void saveCookies(AccountModel account) {
        List<Cookie> cookies = getBrowserContext().cookies();
        File cookiesFolder = new File("Cookies");
        if (!cookiesFolder.exists()) {
            cookiesFolder.mkdir();
        }
        String fileName = account.username + "_cookies.json";
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(new File(cookiesFolder, fileName)))) {
            Gson gson = new GsonBuilder().setPrettyPrinting().create();
            gson.toJson(cookies, writer);
        } catch (IOException e) {
            e.printStackTrace();
        }
        log("Cookies saved for user: " + account.username);
    }

    public void restoreCookies(String userRole) {
        File cookiesFolder = new File("Cookies");
        String fileName = userRole + "_cookies.json";
        File cookieFile = new File(cookiesFolder, fileName);
        boolean sessionExpired = false;
        if (cookieFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(cookieFile))) {
                Gson gson = new Gson();
                List<Cookie> cookies = gson.fromJson(reader, new TypeToken<List<Cookie>>() {
                }.getType());
                getBrowserContext().addCookies(cookies);
                String homePageUrl = fileName.contains("PlatformAdmin") ?
                        envProp.getProperty("platformAdminHomePage_xpath") :
                        envProp.getProperty("orgUserAgentDownloadPage_xpath");
                getPage().navigate(homePageUrl);
                sessionExpired = isSessionExpired();
                if (!sessionExpired) {
                    log("Navigated to homepage with saved cookies");
                    return;
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            log("No cookies found for user: " + userRole);
            sessionExpired = true;
        }
        if (sessionExpired) {
            log("Session expired or no valid cookies found. Re-logging in...");
            if (getLocator("returnToHomePage_xpath", true).isVisible()) {
                click("goToLogin_xpath", true);
                loginAndSaveCookies(userRole);
            } else {
                click("signInAccountButton_xpath", true);
                loginAndSaveCookies(userRole);
            }

        }
    }

    public void restoreCookiesAfterDeviceRegistration(String userRole) {
        File cookiesFolder = new File("Cookies");
        String fileName = userRole + "_cookies.json";
        File cookieFile = new File(cookiesFolder, fileName);
        boolean sessionExpired = false;
        if (cookieFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(cookieFile))) {
                Gson gson = new Gson();
                List<Cookie> cookies = gson.fromJson(reader, new TypeToken<List<Cookie>>() {
                }.getType());
                getBrowserContext().addCookies(cookies);
                String homePageUrl = fileName.contains("PlatformAdmin") ?
                        envProp.getProperty("platformAdminHomePage_xpath") :
                        envProp.getProperty("orgUserHomePage_xpath");
                getPage().navigate(homePageUrl);
                sessionExpired = isSessionExpired();
                if (!sessionExpired) {
                    log("Navigated to homepage with saved cookies");
                    return;
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            log("No cookies found for user: " + userRole);
            sessionExpired = true;
        }
        if (sessionExpired) {
            log("Session expired or no valid cookies found. Re-logging in...");
            if (getLocator("returnToHomePage_xpath", true).isVisible()) {
                click("goToLogin_xpath", true);
                loginAndSaveCookies(userRole);
            } else {
                click("signInAccountButton_xpath", true);
                loginAndSaveCookies(userRole);
            }

        }
    }

    public void loginAndSaveCookies(String username) {
        AccountModel account = AccountsRepository.getAccount(username, getProp().getProperty("env"));
        type("email_xpath", account.email, true);
        type("passwordCredentials_xpath", account.password, true);
        click("signInButton_xpath", true);
        saveCookies(account);
        log("Cookies saved after re-login for user: " + username);
    }

    private boolean isSessionExpired() {
        try {
            return getPage().isVisible("//a[text()='Go to Login']") ||
                    !getPage().isVisible("//button[@role='menuitem']");
        } catch (Exception e) {
            log("Error while checking session status: " + e.getMessage());
            return false;
        }
    }

    public void download(String locatorKey, boolean assertType) {
        Download download = getPage().waitForDownload(() -> {
            getLocator(locatorKey, assertType).click();
        });
        download.saveAs(Paths.get("Downloads", download.suggestedFilename()));
        getPage().onDownload(downloads -> System.out.println(downloads.path()));
    }

    public void selectTextFromDropDown(String locatorKey, String option, boolean assertType) {
        Locator dropdown = getLocator(locatorKey, assertType);
        dropdown.locator("//li/span[text()='" + option + "']").click();
    }

    public void refreshPage() {
        getPage().reload();
    }

    public void clearData(String locatorKey, boolean assertType) {
        getLocator(locatorKey, assertType).clear();
    }

    public void switchToTab(int tabIndex) {
        List<Page> pages = getBrowserContext().pages();
        if (pages.size() > tabIndex) {
            tlPage.set(pages.get(tabIndex));
            test.log(Status.PASS, "Switched to tab: " + tabIndex);
        } else {
            test.log(Status.FAIL, "Tab index out of bounds: " + tabIndex);
        }
    }

    public Locator getTable(String locatorKey) {
        Locator table = getLocator(locatorKey, true);
        return table;
    }

    public Locator getAllUsersWebElementFromTable(String locatorKey, String data, int expectedColumnNumber, int timeoutInSeconds) {
        Locator rows = getTable(locatorKey).locator("tr");

        long startTime = System.currentTimeMillis();
        long timeoutMillis = timeoutInSeconds * 1000;

        while (System.currentTimeMillis() - startTime < timeoutMillis) {
            Locator[] rowElements = rows.all().toArray(new Locator[0]);
            for (Locator row : rowElements) {
                Locator cells = row.locator("td");
                Locator[] cellElements = cells.all().toArray(new Locator[0]);
                for (int cNum = 0; cNum < cellElements.length; cNum++) {
                    String receivedData = cellElements[cNum].textContent();
                    if (data.equals(receivedData)) {
                        return cells.nth(expectedColumnNumber);
                    }
                }
            }

            getPage().waitForTimeout(500);
        }

        return null;
    }

    public void uploadFile(String locatorKey, String filePath) {
        try {
            Path path = Paths.get(filePath).toAbsolutePath();
            log("Uploading file from path: " + path);
            getPage().setInputFiles(prop.getProperty(locatorKey), path);

        } catch (Exception e) {
            log("File upload failed: " + e.getMessage());
        }
    }

    public void verifyFileDownload(String downloadDirectory) {
        File directory = new File(downloadDirectory);
        File[] files = directory.listFiles();
        if (files != null && files.length > 0) {
            log("File downloaded successfully in directory: " + directory.getAbsolutePath());
        } else {
            throw new RuntimeException("No files found in directory: " + directory.getAbsolutePath());
        }
    }

    public Locator getAllUsersWebElementFromTableInEmail(String locatorKey, String data, int expectedColumnNumber, int timeoutInSeconds) {
        Locator rows = getTable(locatorKey).locator("tr");
        long startTime = System.currentTimeMillis();
        long timeoutMillis = timeoutInSeconds * 1000;

        while (System.currentTimeMillis() - startTime < timeoutMillis) {
            Locator[] rowElements = rows.all().toArray(new Locator[0]);
            for (Locator row : rowElements) {
                Locator cells = row.locator("td");
                Locator[] cellElements = cells.all().toArray(new Locator[0]);
                for (int cNum = 0; cNum < cellElements.length; cNum++) {
                    String receivedData = cellElements[cNum].textContent();
                    if (data.contains(receivedData)) {
                        return cells.nth(expectedColumnNumber);
                    }
                }
            }
            getPage().waitForTimeout(500);
        }
        return null;
    }

    public void verifyWithInIframe(String iframeLocator, String elementLocator, String expectedText) {
        FrameLocator frame = getPage().frameLocator(getProp().getProperty(iframeLocator));
        String actualText = frame.locator(getProp().getProperty(elementLocator)).innerText();
        String cleanActualText = actualText.replaceAll("[^a-zA-Z0-9\\s-]", "").trim();
        softAssert.assertEquals(cleanActualText, expectedText, "The text in the iframe doesn't match the expected value.");
        softAssert.assertAll();
    }

    public Page clickElementInIframeAndWaitForPopup(String iframeLocator, String elementLocator) {
        FrameLocator frame = getPage().frameLocator(getProp().getProperty(iframeLocator));
        Page newTab = getPage().waitForPopup(() -> {
            frame.locator(getProp().getProperty(elementLocator)).click();
        });
        return newTab;
    }

    public void clickElementInNewTab(Page newTab, String elementLocator) {
        newTab.waitForLoadState();
        newTab.locator(getProp().getProperty(elementLocator)).click();
    }

    public String getTitle() {
        return getPage().title().trim();
    }

    public String evaluate(String script) {
        Object result = getPage().evaluate(script);
        return result != null ? result.toString() : null;
    }

    public String getAttribute(String locatorKey, String attribute, boolean assertType) {
        Locator element = getLocator(locatorKey, assertType);
        return element.getAttribute(attribute);
    }

    public void waitForTimeout(long milliseconds) {
        getPage().waitForTimeout(milliseconds);
    }

    public void isElementNotPresent(String locatorKey, boolean stopOnFailure) {
        boolean elementNotPresent = !getLocator(locatorKey, true).isVisible();
        if (!elementNotPresent) {
            reportFailure("Element with locator '" + locatorKey + "' is visible.", stopOnFailure);
        } else {
            reportPass("Element with locator '" + locatorKey + "' is not visible.");
        }
    }

    public void isElementPresent(String locatorKey, boolean stopOnFailure) {
        boolean elementPresent = getLocator(locatorKey, true).isVisible();
        if (elementPresent) {
            reportPass("Element with locator '" + locatorKey + "' is visible.");
        } else {
            reportFailure("Element with locator '" + locatorKey + "' is not visible.", stopOnFailure);
        }
    }

    public void isElementDisabled(String locatorKey, boolean assertType) {
        Locator locator = getLocator(locatorKey, assertType);
        if (locator == null) {
            reportFailure("Locator for '" + locatorKey + "' could not be retrieved.", assertType);
            return;
        }
        try {
            locator.waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.VISIBLE));

            boolean isDisabled = locator.isDisabled();

            if (!isDisabled) {
                reportFailure("Element with locator '" + locatorKey + "' is enabled, but it should be disabled.", assertType);
            } else {
                reportPass("Element with locator '" + locatorKey + "' is disabled.");
            }
        } catch (Exception e) {
            reportFailure("An error occurred while checking the disabled state: " + e.getMessage(), assertType);
        }
    }

    public String getInnerTextFromTable(String locatorKey, String data, int expectedColumnNumber, int timeoutInSeconds) {
        Locator rows = getTable(locatorKey).locator("tr");

        long startTime = System.currentTimeMillis();
        long timeoutMillis = timeoutInSeconds * 1000;

        while (System.currentTimeMillis() - startTime < timeoutMillis) {
            Locator[] rowElements = rows.all().toArray(new Locator[0]);
            for (Locator row : rowElements) {
                Locator cells = row.locator("td");
                Locator[] cellElements = cells.all().toArray(new Locator[0]);
                for (int cNum = 0; cNum < cellElements.length; cNum++) {
                    String receivedData = cellElements[cNum].textContent();
                    if (data.equals(receivedData)) {
                        return cells.nth(expectedColumnNumber).innerText();
                    }
                }
            }

            getPage().waitForTimeout(500);
        }

        return null;
    }
}