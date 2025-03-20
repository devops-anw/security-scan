package teststeps;

import Models.AccountModel;
import Models.AccountsRepository;
import context.TestContext;
import externalEndPoints.AssetAPI;
import externalEndPoints.ConsoleEndPoints;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;

import java.util.List;

public class Teardown {
    AssetAPI assetApi;
    ConsoleEndPoints consoleApi;
    String env;
    String token;

    public Teardown(TestContext context) {
        assetApi = new AssetAPI(context.getPageObjectManager().getPlaywrightFactory());
        consoleApi = new ConsoleEndPoints(context.getPageObjectManager().getPlaywrightFactory());
        env = context.getPageObjectManager().getPlaywrightFactory().getProp().getProperty("env");
    }

    @Given("I delete uploaded agentBinary file during automation")
    public void deleteAgentBinaryFileData() {
        AccountModel account = AccountsRepository.getAccount("PlatformAdmin", env);
        token = consoleApi.getUserAccessToken(account);
        assetApi.deleteAgentBinaryFiles(token);
    }

    @Given("I delete all agent binary files")
    public void deleteAllAgentBinaryFiles() {
        AccountModel account = AccountsRepository.getAccount("PlatformAdmin", env);
        token = consoleApi.getUserAccessToken(account);
        assetApi.deleteAllAgentBinaryFiles(token);
    }

    @Given("I delete inventories in a device - {string}")
    public void deleteInventories(String user) {
        AccountModel account = AccountsRepository.getAccount(user, env);
        token = consoleApi.getUserAccessToken(account);
        assetApi.deleteInventories(token);
    }

    @And("I delete all devices in an org - {string}")
    public void deleteAllDevices(String user) {
        AccountModel account = AccountsRepository.getAccount(user, env);
        token = consoleApi.getUserAccessToken(account);
        assetApi.deleteAllDevicesInOrg(account, token);
    }

    @Given("I delete the users and orgs from presetup")
    public void deletePresetupUsers() {
        token = assetApi.getKeycloakAccessToken();
        List<AccountModel> accounts = AccountsRepository.getCreatedAccounts(env);
        assetApi.deleteUsers(accounts, token);
        assetApi.deleteOrgs(accounts, token);
    }

    @Given("I delete all Random users with in application")
    public void deleteRandomUsers() {
        String nameShouldContain = "Random";
        token = assetApi.getKeycloakAccessToken();
        assetApi.deleteUsers(nameShouldContain, token);
    }

    @Given("I delete all Random orgs with in application")
    public void deleteRandomOrgs() {
        String nameShouldContain = "random-Org";
        token = assetApi.getKeycloakAccessToken();
        assetApi.deleteOrgs(nameShouldContain, token);
    }

    @Given("I delete all Random api users with in application")
    public void deleteAPIUsers() {
        String nameShouldContain = "api-";
        token = assetApi.getKeycloakAccessToken();
        assetApi.deleteUsers(nameShouldContain, token);
    }

    @Given("I delete all Random api Org with in application")
    public void deleteAPIOrgs() {
        String nameShouldContain = "api-";
        token = assetApi.getKeycloakAccessToken();
        assetApi.deleteOrgs(nameShouldContain, token);
    }

    @Given("I delete all users from application")
    public void deleteAllUsers() {
        assetApi.deleteAllUsersExceptPlatformAdmin();
    }

    @And("I delete all orgs with in application")
    public void deleteOrgsInApp() {
        assetApi.deleteOrgs();
    }
}