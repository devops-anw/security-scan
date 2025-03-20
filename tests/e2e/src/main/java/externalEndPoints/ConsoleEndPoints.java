package externalEndPoints;

import com.github.javafaker.Faker;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import managers.PlaywrightFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import pages.*;
import java.util.*;
import Models.AccountModel;

import static io.restassured.RestAssured.given;
import static io.restassured.http.ContentType.JSON;

public class ConsoleEndPoints {

    private PlaywrightFactory pf;
    private Properties prop;
    public String name, type, ip, location, version, publisher, hash, env;
    public static String deviceID, serialNumber;
    private String keycloakUrl, clientId, realm;
    public static List<String> applicationNames;
    public static String appName, deviceAppName, activityType, severity, fileName, status, recoveryMethod;
    public static int recoveryID;
    public String threatName, affectedFiles, detectionMethod, actionTaken, timestamp;
    public int fileSize;
    Faker faker = new Faker(new Locale("en-IN"));

    public ConsoleEndPoints(PlaywrightFactory pf) {
        this.pf = pf;
        this.prop = pf.getEnvProp();
        RestAssured.baseURI = prop.getProperty("consoleBaseURI");
    }

    private JSONObject createDeviceRequestBody() {
        JSONObject properties = new JSONObject();
        properties.put("IP", ip);
        properties.put("LOCATION", location);
        JSONObject requestBody = new JSONObject();
        requestBody.put("name", name);
        requestBody.put("type", type);
        requestBody.put("serial_number", serialNumber);
        requestBody.put("properties", properties);
        return requestBody;
    }

    public void CreateDevice() {
        pf.log("Creating device with the following details:");
        generateRandomDeviceData();
        RestAssured.basePath = "/devices/";
        JSONObject requestBody = createDeviceRequestBody();
        Response response = given()
                .header("X-Org-Key", OrganizationProfilePage.orgID)
                .contentType(ContentType.JSON)
                .body(requestBody.toString())
                .when()
                .post()
                .then()
                .extract().response();
        validateResponseStatus(response, 200);
        String responseBody = response.getBody().asString();
        pf.log("Response Body: " + responseBody);
        JSONObject jsonResponse = new JSONObject(responseBody);
        name = jsonResponse.getString("name");
        serialNumber = jsonResponse.getString("serial_number");
        deviceID = jsonResponse.getString("id");
        Map<String, String> deviceInfo = new HashMap<>();
        deviceInfo.put("username", name);
        deviceInfo.put("serialNumber", serialNumber);
        deviceInfo.put("deviceId", deviceID);
        pf.log("Stored Device Information: " + deviceInfo);
    }

    public void updateDeviceHeartBeat() {
        pf.log("Updating the Device HeartBeat");
        RestAssured.basePath = "/devices/" + deviceID + "/heartbeat";
        Response response = given()
                .header("X-Org-Key", OrganizationProfilePage.orgID)
                .contentType(JSON)
                .when()
                .post()
                .then()
                .extract()
                .response();
        validateResponseStatus(response, 200);
        String responseBody = response.getBody().asString();
        pf.log("Response Body: " + responseBody);
    }

    public void generateRandomDeviceData() {
        name = faker.commerce().productName();
        type = faker.options().option("Laptop", "Tablet", "Smartphone");
        serialNumber = faker.number().digits(5);
        ip = faker.internet().ipV4Address();
        location = faker.address().state();
    }

    private void validateResponseStatus(Response response, int expectedStatusCode) {
        if (response.statusCode() != expectedStatusCode) {
            throw new RuntimeException("Unexpected status code: " + response.statusCode() + " - " + response.getBody().asString());
        }
    }

    public String getUserAccessToken(AccountModel account) {
        pf.log("Getting access token of the " + account.username + " user");
        keycloakUrl = prop.getProperty("keycloak_url");
        clientId = prop.getProperty("client_id");
        realm = prop.getProperty("realm");
        String tokenEndpoint = keycloakUrl + "/realms/" + realm + "/protocol/openid-connect/token";
        Response response = given()
                .contentType("application/x-www-form-urlencoded")
                .formParam("client_id", clientId)
                .formParam("grant_type", "password")
                .formParam("username", account.email)
                .formParam("password", account.password)
                .post(tokenEndpoint);
        validateResponseStatus(response, 200);
        String accessToken = response.jsonPath().getString("access_token");
        if (accessToken != null) {
            return accessToken;
        } else {
            throw new RuntimeException("Access token not found in the response.");
        }
    }

    public void generateRandomDeviceApplicationData() {
        appName = faker.app().name();
        version = faker.app().version();
        publisher = faker.company().name();
        hash = faker.crypto().sha256();
    }

    private JSONObject createApplicationRequestBody() {
        generateRandomDeviceApplicationData();
        JSONObject applicationRequestBody = new JSONObject();
        applicationRequestBody.put("name", appName);
        applicationRequestBody.put("version", version);
        applicationRequestBody.put("publisher", publisher);
        applicationRequestBody.put("hash", hash);
        return applicationRequestBody;
    }

    public void createGlobalApplication(AccountModel account) {
        RestAssured.basePath = "applications";
        String bearerToken = getUserAccessToken(account);
        JSONObject applicationRequestBody = createApplicationRequestBody();
        Response response = given()
                .header("Authorization", "Bearer " + bearerToken)
                .contentType(JSON)
                .body(applicationRequestBody.toString())
                .when()
                .post();
        validateResponseStatus(response, 200);
        String responseBody = response.getBody().asString();
        JSONObject jsonResponse = new JSONObject(responseBody);
        appName = jsonResponse.getString("name");
        Map<String, String> applicationInfo = new HashMap<>();
        applicationInfo.put("applicationName", appName);
        pf.log("Stored Application Information: " + applicationInfo);
    }

    private JSONObject createInventoryRequestBody(int numOfApplications) {
        JSONArray itemsArray = new JSONArray();
        for (int i = 0; i < numOfApplications; i++) {
            generateRandomDeviceApplicationData();
            JSONObject item = new JSONObject();
            item.put("name", appName);
            item.put("publisher", publisher);
            item.put("version", version);
            item.put("hash", hash);
            itemsArray.put(item);
        }
        JSONObject requestBody = new JSONObject();
        requestBody.put("items", itemsArray);
        return requestBody;
    }

    public void createDeviceInventory(int numOfApplications) {
        RestAssured.basePath = "/devices/" + deviceID + "/inventory";
        JSONObject inventoryRequestBody = createInventoryRequestBody(numOfApplications);
        Response response = RestAssured.given()
                .header("X-Org-Key", OrganizationProfilePage.orgID)
                .contentType("application/json")
                .body(inventoryRequestBody.toString())
                .when()
                .post();
        validateResponseStatus(response, 200);
        String responseBody = response.getBody().asString();
        JSONArray jsonResponse = new JSONArray(responseBody);
        pf.log("Inventory added successfully for Device ID: " + deviceID);
        if (numOfApplications == 1) {
            JSONObject inventoryDetails = jsonResponse.getJSONObject(0);
            JSONObject application = inventoryDetails.getJSONObject("application");
            deviceAppName = application.getString("name");
            Map<String, String> applicationInfo = new HashMap<>();
            applicationInfo.put("deviceAppName", deviceAppName);
            pf.log("Stored Application Information: " + applicationInfo);
        } else {
            applicationNames = new ArrayList<>();
            for (int i = 0; i < jsonResponse.length(); i++) {
                JSONObject inventoryDetails = jsonResponse.getJSONObject(i);
                JSONObject application = inventoryDetails.getJSONObject("application");
                deviceAppName = application.getString("name");
                applicationNames.add(deviceAppName);
            }
            pf.log("Stored Application Names: " + applicationNames);
        }
    }

    public void generateRandomActivityLog() {
        activityType = faker.hacker().verb() + " Detected";
        severity = faker.options().option("Critical", "High", "Medium", "Low");
        threatName = faker.lorem().word();
        affectedFiles = "C:/Users/Documents/" + faker.file().fileName(null, null, "doc", null).replace("\\", "/");
        detectionMethod = faker.options().option("BEHAVIOR", "SIGNATURE", "HEURISTIC", "MACHINE LEARNING");
        actionTaken = faker.options().option("QUARANTINE", "DELETE", "IGNORE", "BLOCK");
        timestamp = faker.date().past(30, java.util.concurrent.TimeUnit.DAYS).toInstant().toString();
    }

    private JSONArray createActivityLogsRequestBody() {
        generateRandomActivityLog();
        JSONObject detailsObject = new JSONObject();
        detailsObject.put("threat_name", threatName);
        detailsObject.put("affected_files", new JSONArray().put(affectedFiles));
        detailsObject.put("detection_method", detectionMethod);
        detailsObject.put("action_taken", actionTaken);
        detailsObject.put("timestamp", timestamp);
        JSONObject requestBody = new JSONObject();
        requestBody.put("device_id", deviceID);
        requestBody.put("activity_type", activityType);
        requestBody.put("severity", severity);
        requestBody.put("details", detailsObject);
        return new JSONArray().put(requestBody);
    }

    public void createActivityLog() {
        pf.log("Creating Activity log for the " + deviceID);
        RestAssured.basePath = "/activity-logs";
        JSONArray activityLogRequestBody = createActivityLogsRequestBody();
        Response response = RestAssured.given()
                .header("X-Org-Key", OrganizationProfilePage.orgID)
                .contentType("application/json")
                .body(activityLogRequestBody.toString())
                .when()
                .post();
        validateResponseStatus(response, 200);
        String responseBody = response.getBody().asString();
        JSONArray jsonResponseArray = new JSONArray(responseBody);
        JSONObject jsonResponse = jsonResponseArray.getJSONObject(0);
        deviceID = jsonResponse.getString("device_id");
        activityType = jsonResponse.getString("activity_type");
        severity = jsonResponse.getString("severity");
        Map<String, String> activityInfo = new HashMap<>();
        activityInfo.put("deviceID", deviceID);
        activityInfo.put("activityType", activityType);
        activityInfo.put("severity", severity);
        pf.log("Stored Device Activity logs Information: " + activityInfo);
    }

    public void generateRandomFileRecoveryData() {
        fileName = faker.lorem().word() + "." + faker.options().option("doc", "pdf", "txt", "jpg", "png", "xlsx");
        status = faker.options().option("In Progress", "Completed", "Failed");
        recoveryMethod = faker.options().option("Shadow Copy", "Backup Restore", "File History", "Cloud Backup", "Local Backup", "Remote Recovery", "Manual", "Default");
        fileSize = faker.number().numberBetween(1, 100);
    }

    private JSONArray createFileRecoveryRequestBody() {
        generateRandomFileRecoveryData();
        JSONObject requestBody = new JSONObject();
        requestBody.put("device_id", deviceID);
        requestBody.put("file_name", fileName);
        requestBody.put("status", status);
        requestBody.put("recovery_method", recoveryMethod);
        requestBody.put("file_size", fileSize);
        JSONArray requestBodyArray = new JSONArray();
        requestBodyArray.put(requestBody);
        return requestBodyArray;
    }

    public void createFileRecovery() {
        pf.log("Creating File Recovery log for the " + deviceID);
        RestAssured.basePath = "/file_recovery";
        JSONArray fileRecoveryRequestBody = createFileRecoveryRequestBody();
        Response response = RestAssured.given()
                .header("X-Org-Key", OrganizationProfilePage.orgID)
                .contentType("application/json")
                .body(fileRecoveryRequestBody.toString())
                .when()
                .post();
        validateResponseStatus(response, 200);
        String responseBody = response.getBody().asString();
        JSONArray jsonResponseArray = new JSONArray(responseBody);
        for (int i = 0; i < jsonResponseArray.length(); i++) {
            JSONObject jsonResponse = jsonResponseArray.getJSONObject(i);
            recoveryID = jsonResponse.getInt("id");
            fileName = jsonResponse.getString("file_name");
            status = jsonResponse.getString("status");
            recoveryMethod = jsonResponse.getString("recovery_method");
            Map<String, String> recoveryInfo = new HashMap<>();
            recoveryInfo.put("recoveryID", String.valueOf(recoveryID));
            recoveryInfo.put("recoveryFileName", fileName);
            recoveryInfo.put("status", status);
            recoveryInfo.put("recoveryMethod", recoveryMethod);
            pf.log("Stored Device File Recovery Information for ID " + recoveryID + ": " + recoveryInfo);
        }
    }
}