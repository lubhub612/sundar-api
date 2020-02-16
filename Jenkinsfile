#!/usr/bin/env groovy

pipeline {
    agent any
    tools { nodejs "node v9" }
    stages {
        stage('Update') {
            steps {
                sh 'echo Updating ${BRANCH_NAME}...'
                script {
                    if (env.BRANCH_NAME == 'master') {
                        sh 'ssh dripadmin@168.62.38.213 "cd drip-api; git pull https://rchan099:925a68beb85e5b7c8ec96bc642ab0afe31d97041@github.pwc.com/sdc-emtech/drip-api.git master"'
                    } else if (env.BRANCH_NAME == 'test') {
                        sh 'ssh dripadmin@104.211.1.23 "cd drip-api; git pull https://rchan099:925a68beb85e5b7c8ec96bc642ab0afe31d97041@github.pwc.com/sdc-emtech/drip-api.git test"'
                    }
                }
            }
        }

        stage('Prepare environment') {
            steps {
                sh 'echo Deploying ${BRANCH_NAME}...'
                script {
                    if (env.BRANCH_NAME == 'master') {
                        sh 'ssh dripadmin@168.62.38.213 "cd drip-api; export PATH=/home/dripadmin/.nvm/versions/node/v9.4.0/bin:$PATH; npm install"'
                    } else if (env.BRANCH_NAME == 'test') {
                        sh 'ssh dripadmin@104.211.1.23 "cd drip-api; export PATH=/home/dripadmin/.nvm/versions/node/v9.4.0/bin:$PATH; npm install"'
                    }
                }
            }
        }


        stage('Restart') {
            steps {
                sh 'echo Deploying ${BRANCH_NAME}...'
                script {
                    if (env.BRANCH_NAME == 'master') {
                        sh 'ssh dripadmin@168.62.38.213 "cd drip-api; export EGG_SERVER_ENV=prod; export PATH=/home/dripadmin/.nvm/versions/node/v9.4.0/bin:$PATH; npm stop; npm start"'
                    } else if (env.BRANCH_NAME == 'test') {
                        sh 'ssh dripadmin@104.211.1.23 "cd drip-api; export EGG_SERVER_ENV=test; export PATH=/home/dripadmin/.nvm/versions/node/v9.4.0/bin:$PATH; npm stop; npm start"'
                    }
                }
            }
        }
    }
    post {
        success {
            emailext (
                subject: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                         <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }

        failure {
            emailext (
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                         <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>""",
                recipientProviders: [[$class: 'DevelopersRecipientProvider']]
            )
        }
    }
}

