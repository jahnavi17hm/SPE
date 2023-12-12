pipeline{
    agent any
    environment{
        MONGO="mongodb+srv://dheeraj:1998@cluster0.3ead53n.mongodb.net/"
        JWT="f0900068cdd54283418d385c837a1069830189c9a2622dcf74b1b01c2baab006502d02c4513ca72a49c0072b8c63d9f0eaf9ef26b49d30fe9e0c1ef77971790e"
    }
    stages{
        stage('Clone Git'){
            steps{
                git 'https://github.com/jahnavi17hm/SPE'
            }
        }
    //     stage('Testing'){
    //         steps{
    //             dir('frontend'){
    //                 sh "npm install"
    //                 // sh "npm test"
    //             }
    //         }
    //     }
        
    //    stage('Build Frontend Image') {
    //         steps {
    //             sh 'docker build -t frontend-image ./frontend'
    //         }
    //     }
    //      stage('Build Backend Image') {
    //         steps {
    //             sh 'docker build -t backend-image ./backend'
    //         }
    //     }
    //     stage('Push Images to DockerHub') {
    //         steps {

    //             withCredentials([usernamePassword(credentialsId: 'DockerHubCred', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
    //                 sh 'docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD'
    //                 sh 'docker tag frontend-image jahnavi17hm/frontend-image:latest'
    //                 sh 'docker push jahnavi17hm/frontend-image:latest'
    //                 sh 'docker tag backend-image jahnavi17hm/backend-image:latest'
    //                 sh 'docker push jahnavi17hm/backend-image:latest'
    //             }          
    //         }
    //     }
    //     stage('Ansible Deployment') {
    //         steps {
    //             script { 
    //                 sh 'ansible-playbook -i inventory playbook.yml'
    //             }
    //         }
    //     }
    }
}
