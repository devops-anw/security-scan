package managers;

import externalEndPoints.ConsoleEndPoints;
import pages.*;

public class PageObjectManager {

    private SignInPage signInPage;
    private HomePage homepage;
    private LandingPage landingPage;
    private PlaywrightFactory pf;
    private SignUpPage signUpPage;
    private ApprovalRequestsPage approvalPage;
    private UsersPage usersPage;
    private AgentBinaryPage agentBinaryPage;
    private DashboardPage dashboardPage;
    private DeviceMonitorPage deviceMonitorPage;
    private OrganizationProfilePage organizationProfilePage;
    private ConsoleEndPoints consoleApi;
    private AgentDownloadPage agentDownloadPage;
    private ApplicationsPage applicationsPage;
    private ActivityLogsPage activityLogsPage;
    private RecoveryPage recoveryPage;

    public PageObjectManager() {
        this.pf = new PlaywrightFactory();
        this.consoleApi = new ConsoleEndPoints(pf);
    }

    public PlaywrightFactory getPlaywrightFactory() {
        return pf;
    }

    public SignInPage getSignInPage() {
        if (signInPage == null)
            signInPage = new SignInPage(pf);
        return signInPage;
    }

    public HomePage getHomePage() {
        if (homepage == null)
            homepage = new HomePage(pf);
        return homepage;
    }

    public LandingPage getLandingPage() {
        if (landingPage == null)
            landingPage = new LandingPage(pf);
        return landingPage;
    }

    public SignUpPage getSignUpPage() {
        if (signUpPage == null)
            signUpPage = new SignUpPage(pf);
        return signUpPage;
    }

    public ApprovalRequestsPage getApprovalRequestPage() {
        if (approvalPage == null)
            approvalPage = new ApprovalRequestsPage(pf);
        return approvalPage;
    }

    public UsersPage getUsersPage() {
        if (usersPage == null)
            usersPage = new UsersPage(pf);
        return usersPage;
    }

    public AgentBinaryPage getAgentBinaryPage() {
        if (agentBinaryPage == null)
            agentBinaryPage = new AgentBinaryPage(pf);
        return agentBinaryPage;
    }

    public DashboardPage getDashboardPage() {
        if (dashboardPage == null)
            dashboardPage = new DashboardPage(pf);
        return dashboardPage;
    }

    public DeviceMonitorPage getDeviceMonitorPage() {
        if (deviceMonitorPage == null)
            deviceMonitorPage = new DeviceMonitorPage(pf, consoleApi);
        return deviceMonitorPage;
    }

    public OrganizationProfilePage getOrganizationProfilePage() {
        if (organizationProfilePage == null)
            organizationProfilePage = new OrganizationProfilePage(pf, consoleApi);
        return organizationProfilePage;
    }

    public AgentDownloadPage getAgentDownloadPage() {
        if (agentDownloadPage == null)
            agentDownloadPage = new AgentDownloadPage(pf);
        return agentDownloadPage;
    }

    public ApplicationsPage getApplicationsPage() {
        if (applicationsPage == null)
            applicationsPage = new ApplicationsPage(pf, consoleApi);
        return applicationsPage;
    }

    public ActivityLogsPage getActivityLogsPage() {
        if (activityLogsPage == null)
            activityLogsPage = new ActivityLogsPage(pf, consoleApi);
        return activityLogsPage;
    }

    public RecoveryPage getRecoveryPage() {
        if (recoveryPage == null)
            recoveryPage = new RecoveryPage(pf, consoleApi);
        return recoveryPage;
    }
}