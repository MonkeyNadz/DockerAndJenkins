node {
    def container
	
    stage('Clone repository') {
        /* fetch the git repo (scm) */

        checkout scm
    }

    stage('Build image') {
        /* build via the path (relative to git)*/
		container = docker.build("monkeynadz/dockerandjenkins")
    }

    stage('Push image') {
        /* push the build container image to the online registry hub.docker.com with two tags:
         * 1 - The incremental build number from Jenkins that is automatically just done
         * 2 - latest so that it can be referenced easily */
		withDockerRegistry([ credentialsId: "dockerhubcreds", url: "" ]) {
			container.push("${env.BUILD_NUMBER}")
			container.push("latest")
		}
    }
	
	
}