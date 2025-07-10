pipeline {
    agent any

    environment {
        FRONT_IMAGE = "react-app"
        FRONT_CONTAINER = "react-app-container"
        FRONT_PORT = "80"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh "docker build -t $FRONT_IMAGE ."
                }
            }
        }



        stage('Deploy Containers') {
            steps {
                sh "docker rm -f $FRONT_CONTAINER || true"
                
                sh "docker run -d -p ${FRONT_PORT}:80 --name $FRONT_CONTAINER $FRONT_IMAGE"
            }
        }

        stage('Check Running Container') {
            steps {
                echo "✅ 현재 실행 중인 컨테이너 목록:"
                sh "docker ps"
            }

        }
    }

    post {
        success {
            echo "✅ 배포 성공!"
        }
        failure {
            echo "❌ 배포 실패!"
        }
    }
}
