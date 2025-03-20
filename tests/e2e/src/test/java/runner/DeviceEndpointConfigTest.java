package runner;

import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Parameters;

@CucumberOptions(
        features = "src/test/resources/features/device-endpoint-config.feature",
        glue = {"teststeps"},
        tags = ""
)
public class DeviceEndpointConfigTest extends AbstractTestNGCucumberTests {

    @Parameters("tag")
    public DeviceEndpointConfigTest(String tag) {
        System.setProperty("cucumber.filter.tags", tag);
    }

    @Override
    @DataProvider(parallel = false)
    public Object[][] scenarios() {
        return super.scenarios();
    }
}