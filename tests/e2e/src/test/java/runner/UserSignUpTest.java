package runner;

import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Parameters;

@CucumberOptions(
        features = "src/test/resources/features/user-sign-up.feature",
        glue = {"teststeps"},
        tags = ""
)
public class UserSignUpTest extends AbstractTestNGCucumberTests {

    @Parameters("tag")
    public UserSignUpTest(String tag) {
        System.setProperty("cucumber.filter.tags", tag);
    }

    @Override
    @DataProvider(parallel = false)
    public Object[][] scenarios() {
        return super.scenarios();
    }
}