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

        stage('regression testing'){
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