package teststeps;

import context.TestContext;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import pages.*;

public class FileRecoverySteps {
    private TestContext context;
    private RecoveryPage recoveryPage;
    private DeviceMonitorPage deviceMonitorPage;

    public FileRecoverySteps(TestContext context) {
        this.context = context;
        this.recoveryPage = context.getPageObjectManager().getRecoveryPage();
        this.deviceMonitorPage = context.getPageObjectManager().getDeviceMonitorPage();
    }

    @Then("I verify that the Recovery page is not Accessible")
    public void verifyRecoveryPageNotAccessible() {
        recoveryPage.verifyRecoveryPageNotAccessible();
    }

    @Then("I verify the availability of Recovery page")
    public void verifyRecoveryPageAvail() {
        recoveryPage.verifyRecoveryPageAvail();
    }

    @And("I click the Recovery page")
    public void clickOnRecoveryPage() {
        recoveryPage.clickOnRecoveryPage();
    }

    @And("I verify user is navigated to Recovery page {string}")
    public void verifyRecoveryPage(String recoveryPageText) {
        recoveryPage.verifyRecoveryPage(recoveryPageText);
    }

    @Given("I do a post call to create a file recovery for the device")
    public void createFileRecovery() {
        recoveryPage.createFileRecovery();
    }

    @And("I search for the Recovery record with file Name")
    public void searchRecoveryRecord() {
        recoveryPage.searchRecoveryRecord();
    }

    @Then("I verify the File Recovery record created")
    public void verifyFileRecoveryRecord() {
        recoveryPage.verifyFileRecoveryRecordInRecoveryPage();
    }

    @And("I search for the recovery list with File Name")
    public void searchRecoveryList() {
        deviceMonitorPage.searchRecoveryList();
    }

    @Then("I verify the File recovery record created for device in Recovery List window")
    public void verifyRecoveryRecordForDevice() {
        deviceMonitorPage.verifyActivityLogRecordForDevice();
    }

    @Then("I verify the File Recovery record created for the device")
    public void verifyFileRecoveryRecordForDevice() {
        deviceMonitorPage.verifyFileRecoveryRecordForDevice();
    }
}