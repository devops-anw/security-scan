Feature: Deletion of users

  @Sanity @RegressionWorking
  Scenario: Deleting uploaded agentBinary files during automation
    Given  I delete uploaded agentBinary file during automation

  @Teardown
  Scenario: Delete All agent binaries in an application
    Given  I delete all agent binary files

  @Sanity @RegressionWorking
  Scenario: Delete inventories in all devices in an org
    Given  I delete inventories in a device - 'user2'
    And    I delete all devices in an org - 'user2'

  @Sanity @RegressionWorking
  Scenario: Delete users and orgs from presetup
    Given  I delete the users and orgs from presetup

  @Teardown
  Scenario: Delete all random users and organizations
    Given  I delete all Random users with in application
    And    I delete all Random orgs with in application

  @Teardown
  Scenario: Delete all random api users and organizations
    Given  I delete all Random api users with in application
    And    I delete all Random api Org with in application

  @TeardownAll
  Scenario: Delete All users and org from application
    Given  I delete all users from application
    And    I delete all orgs with in application
