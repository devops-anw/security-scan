# Automated UI Tests

This repository contains the UI automated tests created for the Playwright with java project.
## Getting Started

Before the the work with the Automated Tests it is required to dowload and install Java JDK
It is recommended to have the most up to date version. Java must be added to the system environmental variables

The solution of the automated tests is using the Apache Maven 
The apache maven must be installed [Maven – Download Apache Maven](https://maven.apache.org/download.cgi)

Maven must be added to system path, 
The proper installation can be verified by the following command

```bash
mvn -v
```
## Playwright 
Playwright is distributed as a set of Maven modules. The easiest way to use it is to add one dependency to your Maven pom.xml file as described below. If you're not familiar with Maven please refer to its documentation.

To run Playwright simply add following dependency to your Maven project:

```bash
<dependency>
  <groupId>com.microsoft.playwright</groupId>
  <artifactId>playwright</artifactId>
  <version>1.41.0</version>
</dependency>
```
To run Playwright using Gradle add following dependency to your build.gradle file:
```bash
dependencies {
  implementation group: 'com.microsoft.playwright', name: 'playwright', version: '1.41.0'
}
```
If you have any concerns, please check out official  [documentation site](https://playwright.dev/java)

## TestNG
TestNG is a powerful testing framework inspired by JUnit and NUnit, offering additional features and flexibility. It provides an easy-to-use and intuitive way to write and execute tests for Java applications.
To use TestNG in your Java projects, you can add the TestNG dependency to your project's build configuration file (e.g., pom.xml for Maven):

```bash
<dependency>
      <groupId>org.testng</groupId>
      <artifactId>testng</artifactId>
      <version>7.9.0</version>
      <scope>test</scope>
    </dependency>
```

## Cucumber 
Cucumber is a widely-used tool for writing acceptance tests in a behavior-driven development (BDD) style. It allows stakeholders to define application behavior in plain text, which can be understood by everyone involved in the project. Cucumber-PicoContainer is a module that integrates PicoContainer with Cucumber-JVM, allowing for dependency injection in Cucumber tests. PicoContainer is a lightweight dependency injection container for Java

To integrate Cucumber with your Java project, Add the Cucumber dependencies to your pom.xml file:

```bash
<dependency>
      <groupId>io.cucumber</groupId>
      <artifactId>cucumber-java</artifactId>
      <version>${cucumber.version}</version>
</dependency>

<dependency>
      <groupId>io.cucumber</groupId>
      <artifactId>cucumber-picocontainer</artifactId>
      <version>${cucumber-picocontainer.version}</version>
      <scope>test</scope>
 </dependency>

<dependency>
      <groupId>io.cucumber</groupId>
      <artifactId>cucumber-testng</artifactId>
      <version>${cucumber.version}</version>
</dependency>
```
## Environment Properties
To customize the behavior of the framework by modifying the environment properties in the env.properties file. These properties include environement and  associated with \<env>.properties file includes base URL and other settings.

## Reporting

<<<<<<< HEAD



=======
Extent Reports is a lightweight and flexible reporting library that generates interactive HTML reports for test executions. 
It offers various features such as:
1.Detailed test logs
2.Attachments support (e.g., screenshots)
3.Customizable report themes
4.Integration with popular testing frameworks

Add the Extent Reports dependency to your project configuration file (e.g., Maven, Gradle).
**Maven Dependency
**
```bash
<dependency>
    <groupId>com.aventstack</groupId>
    <artifactId>extentreports</artifactId>
    <version>5.0.6</version>
</dependency>
```
**Gradle Dependency
**
```bash
implementation 'com.aventstack:extentreports:5.0.6'
```
**Usage**
Extent Reports provides rich functionality for creating detailed and interactive reports. Some key features include:
1.Adding test steps and logs
2.Attaching screenshots and files
3.Categorizing tests with tags
4.Creating hierarchical test structures
Refer to the [official documentation](https://www.extentreports.com/documentation-2/) for detailed usage instructions and examples.



## Running Scripts Using Jenkins

Jenkins is a popular automation server that facilitates continuous integration and continuous delivery (CI/CD) pipelines.
Jenkins enables you to automate the execution of scripts, such as build scripts, deployment scripts, and test scripts, within CI/CD pipelines. By configuring Jenkins jobs, you can schedule script executions, trigger them based on events, and monitor their progress.

**Prerequisites**

Before getting started with Jenkins, ensure that Installed Jenkins on your server or local machine

Refer to the [official Jenkins documentation](https://www.jenkins.io/doc/) for installation instructions based on your operating system and environment.

**Setting up Jenkins**

Once Jenkins is installed, follow these steps to set up your Jenkins environment:

Access the Jenkins web interface in your browser.

1. Install any necessary plugins for your project requirements (e.g., Git plugin, Maven plugin).
2. Configure global settings, such as security settings, system properties, and email notifications.
3. Create users and configure access controls as needed.
4. Set up Jenkins agents (nodes) for distributed builds if required.

Refer to the [official Jenkins documentation](https://www.jenkins.io/doc/) for detailed setup instructions and best practices.

**Creating Jenkins Jobs**

To run scripts using Jenkins, you need to create Jenkins jobs. Follow these general steps to create a Jenkins job:
Navigate to the Jenkins dashboard.
1. Click on "New Item" to create a new job.
2. Enter a name for your job and select the appropriate job type (e.g., Maven project, Pipeline).
3. Configure job settings, including source code management/ from git repository, build triggers, and build step
4. Save your job configuration.

**Running Scripts**
To run a script using Jenkins:

1. Navigate to the Jenkins dashboard.
2. Click on the desired job to open its details page.
3. Click on "Build Now" to trigger a build manually, or configure build triggers for automatic execution.
4. Monitor the build progress in real-time and view console output for logs and errors.

**Viewing Logs and Reports**

After running scripts using Jenkins, you can view build logs, test reports, and other artifacts generated by the scripts. Jenkins provides built-in features and plugins to capture and display detailed information about script executions.

To view logs and reports in Jenkins:

1. Open the Jenkins dashboard.
2. Navigate to the specific job that executed the script.
3. Click on the build number to view build details.
4. Access the "Console Output" to view script logs.
5. Explore additional tabs or links to view test reports, code coverage reports, and other artifacts generated by the script.


For Maven  project
Add pre step as 
```bash
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```
And add goals and options under build step
```bash
   clean test -Dsurefire.suiteXmlFiles=testng.xml
```
For Pipeline

1. Configure the pipeline parameters in the Jenkins job.
2. Run the pipeline and monitor the progress in the Jenkins interface.

**Pipeline Script**
```bash
pipeline{
    agent any
    tools{
        maven 'maven'
    }

    stages{
        stage('Deployed to Qa'){
            steps{
                echo("deployed to Qa")
            }
        }

        stage('Regression Testing'){
            steps{
                 bat 'rmdir /S /Q anw_playwright_QA'
                 bat 'git clone https://github.com/appnetwise/anw_playwright_QA'
                 bat  "mvn test -Dsurefire.suiteXmlFiles=testng.xml"
            }
        }

        stage('Archive Artifacts'){
        steps{
             archiveArtifacts 'reports/'
        }
        }
    }
}
```
## Executing Scripts with Dockerized Selenium Grid

**Install Docker:**

Ensure that Docker is installed on your system. You can download and install Docker from the official website: Docker.

**Create a Docker Compose file**: 

Create a docker-compose.yml file in your project directory. This file will define the services required for Selenium Grid. Below is an example docker-compose.yml file

``` bash
    version: "3"
    services:
    chrome:
    image: selenium/node-chrome:dev
    shm_size: 2gb
    depends_on:
    - selenium-hub
    environment:
    - SE_EVENT_BUS_HOST=selenium-hub
    - SE_EVENT_BUS_PUBLISH_PORT=4442
    - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
    - SE_NODE_MAX_SESSIONS=3
    - SE_NODE_OVERRIDE_MAX_SESSIONS=true
    - SE_NODE_GRID_URL=http://localhost:4444/
        
    edge:
    image: selenium/node-edge:dev
    shm_size: 2gb
    depends_on:
    - selenium-hub
    environment:
    - SE_EVENT_BUS_HOST=selenium-hub
    - SE_EVENT_BUS_PUBLISH_PORT=4442
    - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
    - SE_NODE_MAX_SESSIONS=3
    - SE_NODE_OVERRIDE_MAX_SESSIONS=true
    - SE_NODE_GRID_URL=http://localhost:4444/
    
    firefox:
    image: selenium/node-firefox:dev
    shm_size: 2gb
    depends_on:
    - selenium-hub
    environment:
    - SE_EVENT_BUS_HOST=selenium-hub
    - SE_EVENT_BUS_PUBLISH_PORT=4442
    - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
    - SE_NODE_MAX_SESSIONS=3
    - SE_NODE_OVERRIDE_MAX_SESSIONS=true
    - SE_NODE_GRID_URL=http://localhost:4444/
    selenium-hub:
    image: selenium/hub:latest
    container_name: selenium-hub
    ports:
    - "4442:4442"
    - "4443:4443"
    - "4444:4444"
``` 
**Start the Selenium Grid infrastructure:** 

Open a terminal or command prompt, navigate to your project directory containing the docker-compose.yml file, and run the following command:
``` bash
    docker-compose up -d
```
**Connecting Playwright to Selenium Grid**

Open a terminal or command prompt, navigate to your project directory and set the SELENIUM_REMOTE_URL 
``` bash
set SELENIUM_REMOTE_URL=http://localhost:4444
``` 
And Run the script using following command
``` bash
mvn test -Dsurefire.suiteXmlFiles=testng.xml -Dremote=true -DremoteURL=http://localhost:4444
``` 


>>>>>>> master

