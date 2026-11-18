pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    triggers {
        pollSCM('H/1 * * * *')
    }

    stages {
        stage('Install') {
            steps {
                bat 'npm ci'
                bat 'npx playwright install chromium'
            }
        }

        stage('Validate') {
            steps {
                bat 'node tests/guard.js --all'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/test-results/**, **/playwright-report/**, *.log', allowEmptyArchive: true
        }
    }
}
