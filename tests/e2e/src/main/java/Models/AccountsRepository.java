package Models;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class AccountsRepository {

    private static boolean isLoaded = false;
    private static List<AccountModel> accounts;
    private static Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy HH:mm:ss").create();
    private static String usersDirectory = System.getProperty("user.dir") + "/users";

    private AccountsRepository() {
    }

    public static AccountModel getAccount(String username, String environment) {
        if (!isLoaded) {
            loadUsersFromFiles(environment);
        }
        for (AccountModel account : accounts) {
            if (account.username.equals(username)) {
                return account;
            }
        }
        return null;
    }

    private static void loadUsersFromFiles(String environment) {
        File environmentDir = new File(usersDirectory + "/" + environment);
        if (!environmentDir.exists()) {
            if (!environmentDir.mkdirs()) {
                return;
            }
        }
        File[] files = environmentDir.listFiles();
        if (files == null) {
            return;
        }
        accounts = new ArrayList<>();
        for (File file : files) {
            try {
                accounts.add(gson.fromJson(new FileReader(file.getPath()), AccountModel.class));
            } catch (JsonSyntaxException | JsonIOException | FileNotFoundException e) {
                e.printStackTrace();
            }
        }
        isLoaded = true;
    }

    public static void SaveUser(AccountModel account, String environment) {
        if (!isLoaded) {
            loadUsersFromFiles(environment);
        }
        File environmentDir = new File(usersDirectory + "/" + environment);
        if (!environmentDir.exists()) {
            if (!environmentDir.mkdirs()) {
                return;
            }
        }
        AccountModel existingAccount = accounts.stream()
                .filter(acc -> acc.username.equals(account.username))
                .findAny()
                .orElse(null);
        if (existingAccount != null) {
            accounts.remove(existingAccount);
        }
        accounts.add(account);
        try (FileWriter fw = new FileWriter(new File(environmentDir, account.username))) {
            gson.toJson(account, fw);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static List<AccountModel> getCreatedAccounts(String environment) {
        if (!isLoaded) {
            loadUsersFromFiles(environment);
        }
        List<AccountModel> accountsToReturn = new ArrayList<>();
        for (AccountModel account : accounts) {
            if (!account.username.equals("PlatformAdmin")) {
                accountsToReturn.add(account);
            }
        }
        return accountsToReturn;
    }
}