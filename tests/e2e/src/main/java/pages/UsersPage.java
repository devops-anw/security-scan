package pages;

import Models.AccountModel;
import Models.AccountsRepository;
import managers.PlaywrightFactory;

public class UsersPage {
    private PlaywrightFactory pf;
    private String env;
    AccountModel account;
    public static String actualFirstName, actualLastName;

    public UsersPage(PlaywrightFactory pf) {
        this.pf = pf;
        this.env = pf.getProp().getProperty("env");
    }

    public void verifyUsersPage(String usersPageText) {
        pf.log("Verifying user navigates to Users page");
        pf.verifyText("usersPageText_xpath", usersPageText, true);
    }

    public void searchUser(String userName) {
        pf.log("Search for the user");
        account = AccountsRepository.getAccount(userName, pf.getProp().getProperty("env"));
        pf.type("userSearchBar_placeHolder", account.email, true);
    }

    public void verifyUpdatedOrgUserDetailsAsAdminUser(String userName) {
        pf.log("Verifying the Updated Organization user details");
        account = AccountsRepository.getAccount(userName, pf.getProp().getProperty("env"));
        actualFirstName = pf.getText("userFirstName_xpath", true);
        actualLastName = pf.getText("userLastName_xpath", true);
        if (actualFirstName.equals(account.firstName)) {
            pf.reportPass("The First Name is verified successfully: '" + account.firstName + "'.");
        } else {
            pf.reportFailure("Failed to verify the First Name. Expected: '" + account.firstName + "', but found: '" + actualFirstName + "'.", true);
        }

        if (actualLastName.equals(account.lastName)) {
            pf.reportPass("The Last Name is verified successfully: '" + account.lastName + "'.");
        } else {
            pf.reportFailure("Failed to verify the Last Name. Expected: '" + account.lastName + "', but found: '" + actualLastName + "'.", true);
        }
    }

    public void verifyUsersPageNotAccessible() {
        pf.log("Verifying that the Users page is not accessible when logged in as Org user");
        pf.isElementNotPresent("userPage_xpath", true);
    }
}