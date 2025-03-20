package utils;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class ConfigReader extends PropertyManager {

    public void ConfigReader() {

        String applicationUrl = getProperty("applicationUrl");
        String consoleJsonUrl = getProperty("consoleJsonUrl");
        String consoleDocsUrl = getProperty("consoleDocsUrl");
        String agentBinaryJsonUrl = getProperty("agentBinaryJsonUrl");
        String agentBinaryDocsUrl = getProperty("agentBinaryDocsUrl");
        String keycloakUrl = getProperty("keycloakUrl");
        String dirPath = System.getProperty("user.dir") + "/tests/Security/src/assets";
        String fileName = dirPath + "/Zap_urls.txt";

        try {
            // Create the directory if it doesn't exist
            File directory = new File(dirPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            try (FileWriter writer = new FileWriter(fileName)) {
                writer.write(applicationUrl + "\n");
                writer.write(consoleJsonUrl + "\n");
                writer.write(consoleDocsUrl + "\n");
                writer.write(agentBinaryJsonUrl + "\n");
                writer.write(agentBinaryDocsUrl + "\n");
                writer.write(keycloakUrl + "\n");
            } catch (IOException e) {
                e.printStackTrace();
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
