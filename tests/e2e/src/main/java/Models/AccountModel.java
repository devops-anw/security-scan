package Models;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AccountModel {

    public String username, orgName, firstName, lastName, email, password;
    public String orgId;

    public AccountModel(String username, String orgName, String firstName, String lastName, String email, String password) {
        this.username = username;
        this.orgName = orgName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    public AccountModel(AccountModel accountModel, String orgId) {
        this.username = accountModel.username;
        this.orgName = accountModel.orgName;
        this.firstName = accountModel.firstName;
        this.lastName = accountModel.lastName;
        this.email = accountModel.email;
        this.password = accountModel.password;
        this.orgId = orgId;
    }

    public AccountModel(String username, String orgName, String firstName, String lastName, String email, String password, String orgId) {
        this.username = username;
        this.orgName = orgName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.orgId = orgId;
    }

    public String generateNewPassword(int length) {
        return generateSafePassword(length);
    }

    public static String generateSafePassword(int length) {
        String upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String specialCharacters = "!@#$%^&*";
        String combinedChars = upperCaseLetters + lowerCaseLetters + digits + specialCharacters;
        SecureRandom random = new SecureRandom();
        String password = null;
        boolean isValid = false;
        while (!isValid) {
            List<Character> passwordChars = new ArrayList<>();
            passwordChars.add(upperCaseLetters.charAt(random.nextInt(upperCaseLetters.length())));
            passwordChars.add(lowerCaseLetters.charAt(random.nextInt(lowerCaseLetters.length())));
            passwordChars.add(digits.charAt(random.nextInt(digits.length())));
            passwordChars.add(specialCharacters.charAt(random.nextInt(specialCharacters.length())));
            for (int i = 4; i < length; i++) {
                passwordChars.add(combinedChars.charAt(random.nextInt(combinedChars.length())));
            }
            Collections.shuffle(passwordChars, random);
            StringBuilder generatedPassword = new StringBuilder(length);

            for (Character ch : passwordChars) {
                generatedPassword.append(ch);
            }
            password = generatedPassword.toString();
            isValid = !containsUnicode(password);
        }
        return password;
    }

    private static boolean containsUnicode(String password) {
        for (char c : password.toCharArray()) {
            if (c > 127) {
                return true;
            }
        }
        return false;
    }
}