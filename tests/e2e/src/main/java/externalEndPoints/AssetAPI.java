package externalEndPoints;

import Models.AccountModel;
import Models.AccountsRepository;
import Models.UserModel;
import io.cucumber.core.internal.com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import managers.PlaywrightFactory;

import java.io.File;
import java.io.IOException;
import java.util.*;

import static io.restassured.RestAssured.given;

public class AssetAPI {
    String platformAdmin;
    Properties prop;
    String env;
    PlaywrightFactory pf;
    private String keycloakAccessToken;
    private List<UserModel> userlist = new ArrayList<>();
    private static List<String> fileNames = new ArrayList<>();
    public List<String> deviceInventoryIDs, deviceIDs, userIDs;
    ConsoleEndPoints consoleApi;

    public AssetAPI(PlaywrightFactory pf) {
        this.pf = pf;
        prop = pf.getEnvProp();
        env = pf.getProp().getProperty("env");
        this.consoleApi = new ConsoleEndPoints(new PlaywrightFactory());
    }

    public String getKeycloakAccessToken() {
        String tokenEndpoint = prop.getProperty("accessTokenUrl");
        RestAssured.baseURI = tokenEndpoint;
        Map<String, String> formParams = new HashMap<>();
        formParams.put("client_id", prop.getProperty("keycloakClientId"));
        formParams.put("client_secret", prop.getProperty("keycloakClientSecret"));
        formParams.put("grant_type", prop.getProperty("grant_type"));
        formParams.put("scope", "openid");
        Response response = RestAssured.given()
                .contentType("application/x-www-form-urlencoded")
                .formParams(formParams)
                .post();
        if (response.statusCode() == 200) {
            Map<String, Object> jsonResponse = response.jsonPath().getMap("");
            keycloakAccessToken = (String) jsonResponse.get("access_token");
        }
        return keycloakAccessToken;
    }

    public List<String> getAgentBinaryFileNames(String adminAccessToken) {
        String getAgentBinaryUrl = prop.getProperty("getAgentBinaryCall");
        Response response = RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + adminAccessToken)
                .when()
                .get(getAgentBinaryUrl);
        int statusCode = response.statusCode();
        switch (statusCode) {
            case 200:
                Map<String, List<Map<String, String>>> versionsMap = response.jsonPath().getMap("versions");
                fileNames = new ArrayList<>();
                for (List<Map<String, String>> versionList : versionsMap.values()) {
                    for (Map<String, String> versionData : versionList) {
                        fileNames.add(versionData.get("filename"));
                    }
                }
                return fileNames;
            case 404:
                String errorMessage = response.jsonPath().getString("detail");
                if (errorMessage.contains("No versions available")) {
                    pf.log("No versions available");
                    fileNames = null;
                    return fileNames;
                } else {
                    throw new RuntimeException("Failed to get user data. Status code: " + response.getStatusCode());
                }
            default:
                throw new RuntimeException("Failed to get user data. Status code: " + response.getStatusCode());
        }
    }

    public String getLatestUploadedAgentBinary() {
        AccountModel accountModel = AccountsRepository.getAccount("PlatformAdmin", env);
        String token = consoleApi.getUserAccessToken(accountModel);
        String latestAgentBinaryUrl = prop.getProperty("getAgentBinaryCall") + "latest";
        Response response = RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + token)
                .when()
                .get(latestAgentBinaryUrl);
        String fileName = response.jsonPath().getString("file_details.filename");
        return fileName;
    }

    public void storeFileName(String fileName) {
        fileNames.add(fileName);
    }

    public List<String> getFileNames() {
        return fileNames;
    }

    public List<String> storeFileNameWithVersion() {
        String fileName = getLatestUploadedAgentBinary();
        storeFileName(fileName);
        List<String> fileNames = getFileNames();
        saveFileNames(fileNames, "./fileNames/agentBinaryFileNames");
        return getFileNames();
    }

    public List<String> readFileNames(String filePath) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<String> fileNames = null;
        try {
            fileNames = objectMapper.readValue(new File(filePath), List.class);
        } catch (IOException e) {
            e.printStackTrace();
            pf.log("Failed to read filenames from JSON file.");
        }
        return fileNames;
    }

    public void saveFileNames(List<String> fileNames, String filePath) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            objectMapper.writeValue(new File(filePath), fileNames);
        } catch (IOException e) {
            e.printStackTrace();
            pf.log("Failed to write filenames to JSON file.");
        }
    }

    public void deleteAgentBinaryFile(String token, String fileName) {
        pf.log("Deleting " + fileName + " agentBinary file");
        String deleteAgentBinaryUrl = prop.getProperty("getAgentBinaryCall") + fileName;
        pf.log(deleteAgentBinaryUrl);
        RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + token)
                .when()
                .delete(deleteAgentBinaryUrl);
    }

    public void deleteAgentBinaryFiles(String token) {
        pf.log("Deleting agentBinary files in an application during automation");
        List<String> fileNames = readFileNames(prop.getProperty("filePath"));
        if (fileNames != null) {
            for (String file : fileNames) {
                deleteAgentBinaryFile(token, file);
            }
        } else {
            pf.log("There are No agentBinary filenames ");
        }
    }

    public void deleteAllAgentBinaryFiles(String token) {
        pf.log("Deleting all agentBinary files in an application");
        List<String> files = getAgentBinaryFileNames(token);
        if (files != null) {
            for (String file : files) {
                deleteAgentBinaryFile(token, file);
            }
        } else {
            pf.log("No agent binary files are available");
        }
    }

    public List<String> getInventoryID(String usersAccessToken, String deviceID) {
        String getDeviceInventoryCall = prop.getProperty("consoleDeviceUrl") + deviceID + "/inventory";
        Response response = RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + usersAccessToken)
                .when()
                .get(getDeviceInventoryCall);
        int statusCode = response.statusCode();
        switch (statusCode) {
            case 200:
                deviceInventoryIDs = response.jsonPath().getList("id");
                return deviceInventoryIDs;
            case 404:
                String errorMessage = response.jsonPath().getString("error");
                if (errorMessage.contains("No inventory found for device")) {
                    pf.log("No inventory found for device");
                    deviceInventoryIDs = null;
                    return deviceInventoryIDs;
                } else {
                    throw new RuntimeException("Failed to get user data. Status code: " + response.getStatusCode());
                }
            default:
                throw new RuntimeException("Failed to get user data. Status code: " + response.getStatusCode());
        }
    }

    public void deleteInventory(String token, String id) {
        String deleteInventoryUrl = prop.getProperty("deleteInventoryUrl") + id;
        pf.log(deleteInventoryUrl);
        RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + token)
                .when()
                .delete(deleteInventoryUrl);
    }

    public List<String> getDevicesInOrg(String usersAccessToken) {
        pf.log("Getting device ids in an org");
        Response response = RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + usersAccessToken)
                .when()
                .get(prop.getProperty("devicesCall"));
        int statusCode = response.statusCode();
        switch (statusCode) {
            case 200:
                deviceIDs = response.jsonPath().getList("devices.id");
                return deviceIDs;
            case 404:
                deviceIDs = null;
                return deviceIDs;
            default:
                throw new RuntimeException("Failed to get user data. Status code: " + response.getStatusCode());
        }
    }

    public void deleteDevice(AccountModel accountModel, String id) {
        String deleteDeviceUrl = prop.getProperty("consoleDeviceUrl") + id;
        pf.log(deleteDeviceUrl);
        System.out.println("Should delete the device id:" + id);
        RestAssured.given()
                .contentType("application/json")
                .header("X-Org-Key", accountModel.orgId)
                .when()
                .delete(deleteDeviceUrl);
    }

    public void deleteInventories(String token) {
        pf.log("Deleting inventories in an org");
        List<String> deviceIDs = getDevicesInOrg(token);
        if (deviceIDs != null) {
            for (String deviceID : deviceIDs) {
                List<String> deviceInventoryIds = getInventoryID(token, deviceID);
                if (deviceInventoryIds != null) {
                    for (String deviceInventoryId : deviceInventoryIds) {
                        pf.log("Deleting the inventory having ID as " + deviceInventoryId + "in a device having ID as " + deviceID);
                        deleteInventory(token, deviceInventoryId);
                    }
                } else {
                    pf.log("There is no inventory in a device");
                }
            }
        } else {
            pf.log("There are No devices in an org");
        }
    }

    public void deleteAllDevicesInOrg(AccountModel accountModel, String token) {
        pf.log("Deleting all devices in an org");
        List<String> deviceIDs = getDevicesInOrg(token);
        if (deviceIDs != null) {
            for (String deviceID : deviceIDs) {
                pf.log("Deleting device having ID as " + deviceID + " in an org");
                deleteDevice(accountModel, deviceID);
            }
        } else {
            pf.log("There are No devices in an org");
        }
    }

    public List<String> getUsersId(String token) {
        Response response = RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + token)
                .when()
                .get(prop.getProperty("usersCall"));
        int statusCode = response.statusCode();
        switch (statusCode) {
            case 200:
                userIDs = response.jsonPath().getList("devices.id");
                return userIDs;
            case 404:
                userIDs = null;
                return userIDs;
            default:
                throw new RuntimeException("Failed to get user data. Status code: " + response.getStatusCode());
        }
    }

    public void deleteOrgnization(String token, String id) {
        String deleteUserUrl = prop.getProperty("deleteOrgUrl") + id;
        RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + token)
                .when()
                .delete(deleteUserUrl);
    }

    public void deleteUser(String token, String id) {
        String deleteUserUrl = prop.getProperty("deleteUserUrl") + id;
        pf.log(deleteUserUrl);
        RestAssured.given()
                .contentType("application/json")
                .header("Authorization", "Bearer " + token)
                .when()
                .delete(deleteUserUrl);
    }

    public void deleteAllUsersExceptPlatformAdmin() {
        AccountModel account = AccountsRepository.getAccount("PlatformAdmin", env);
        String admintoken = consoleApi.getUserAccessToken(account);
        List<String> userIds = getUsersId(admintoken);
        platformAdmin = prop.getProperty("platformAdminId");
        userIds.remove(platformAdmin);
        for (String userId : userIds) {
            try {
                System.out.println("Should delete : " + userId);
                String token = getKeycloakAccessTokenWithCaching();
                deleteUser(token, userId);
                Thread.sleep(2000); // Delay between user deletions
            } catch (Exception e) {
                pf.log("Error deleting organization: " + userId + " - " + e.getMessage());
            }
        }
    }

    private String getKeycloakAccessTokenWithCaching() {
        long currentTime = System.currentTimeMillis();
        String cachedToken = null;
        long lastTokenRetrievalTime=0;
        if (cachedToken == null || (currentTime - lastTokenRetrievalTime) > 50000) {
            cachedToken = getKeycloakAccessToken(); // Call the method to get a new token
            lastTokenRetrievalTime = currentTime;
        }
        return cachedToken;
    }
    public void listUsers() {
        if (this.keycloakAccessToken == null) {
            getKeycloakAccessToken();
        }
        this.userlist = new ArrayList<>();
        int total = 1;
        int pagesize = 400;
        for (int offset = 0; offset < total; offset += pagesize) {
            String url = prop.getProperty("userListUrl") + "&first=" + offset + "&max=" + pagesize + "&q=";
            Response response = RestAssured.given()
                    .header("Authorization", "Bearer " + keycloakAccessToken)
                    .contentType(ContentType.JSON).get(url);
            JsonPath responseJson = response.body().jsonPath();
            List<Map<String, Object>> users = response.jsonPath().getList("");
            if (users != null) {
                for (Map user : users) {
                    if (user != null) {
                        UserModel userModel = new UserModel();
                        userModel.id = user.get("id").toString();
                        userModel.username = user.get("username").toString();
                        userlist.add(userModel);
                    }
                }
            }
        }
    }

    public void listOrgs() {
        if (this.keycloakAccessToken == null) {
            getKeycloakAccessToken();
        }
        this.userlist = new ArrayList<>();
        int total = 1;
        int pagesize = 400;
        for (int offset = 0; offset < total; offset += pagesize) {
            String url = prop.getProperty("orgListUrl") + "?first=" + offset + "&max=" + pagesize;
            Response response = given().
                    header("Authorization", "Bearer " + this.keycloakAccessToken).
                    contentType(ContentType.JSON).get(url);
            JsonPath responseJson = response.body().jsonPath();
            List<Map<String, Object>> users = responseJson.getList("");
            if (users != null) {
                for (Map user : users) {
                    UserModel userModel = new UserModel();
                    userModel.orgName = user.get("name").toString();
                    userModel.orgId = user.get("id").toString();
                    userlist.add(userModel);
                }
            }
        }
    }

    public void deleteUsers(List<AccountModel> usersToBeDeleted, String token) {
        if (userlist == null || userlist.size() == 0) {
            listUsers();
        }
        usersToBeDeleted.forEach(user ->
                deleteUsers(user.lastName, token));
    }

    public void deleteOrgs(List<AccountModel> usersToBeDeleted, String token) {
        if (userlist == null || userlist.size() == 0) {
            listUsers();
        }
        usersToBeDeleted.forEach(user -> deleteOrgs(user.orgName, token));
    }

    public void deleteUsers(String name, String token) {
        if (name == null || name.isEmpty()) {
            return;
        }
        if (userlist == null || userlist.size() == 0) {
            listUsers();
        }
        for (UserModel user : userlist) {
            if (user.username.toLowerCase().contains(name.toLowerCase())) {
                pf.log("Should delete" + user.username);
                deleteUser(token, user.id);
            }
        }
    }

    public void deleteOrgs(String name, String token) {
        if (name == null || name.isEmpty()) {
            return;
        }
        listOrgs();
        for (UserModel user : userlist) {
            if (user.orgName.toLowerCase().contains(name.toLowerCase())) {
                pf.log("Should delete" + user.orgId);
                deleteOrgnization(token, user.orgId);
            }
        }
    }

    public void deleteOrgs() {
        if (userlist == null || userlist.size() == 0) {
            listOrgs();
        }
        for (UserModel user : userlist) {
            try {
                pf.log("Should delete" + user.orgId);
                System.out.println("Should delete" + user.orgId);
                String token = getKeycloakAccessTokenWithCaching();
                deleteOrgnization(token, user.orgId);
                Thread.sleep(2000);
            } catch (Exception e) {
                pf.log("Error deleting organization: " +  user.orgId + " - " + e.getMessage());
            }
        }
    }
}