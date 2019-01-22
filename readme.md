# Jenkins and Docker Play
This is essentially my store for learning DevOps - mostly playing around with Docker/Jenkins - with more time wasted on Jenkins running as a container - but accessing the hosts docker processes... yikes. 

## Files

Simple file list and description i probably wont keep up to date:

 - Dockerfile
 - Dockerfile-HugeFile - more basic DockerFile which results in images 10-15x the main DcckerFile here.
 - Jenkinsfile
 - package.json - needed to get node working and point to the js file
 - readme.md - wow
 - src/main.js - where the web-app lives

## Environment Setup
Essentially a tracker of how I set things up.

#### Docker Setup

 1. Installed Docker on an Ubuntu VM (16.04) as per [here](https://docs.docker.com/v17.09/engine/installation/linux/docker-ce/ubuntu/#upgrade-docker-ce-1)
 2. Then	exposed it on the TCP port (for fun - plus when i end up moving access to TCP instead of unix sockets....) - done as per [here](https://docs.docker.com/v17.09/engine/installation/linux/linux-postinstall/)
 3. Setup Docker Hub - run the below command and just follow the instructions - make sure register for an account beforehand.
 
	    docker login

#### Jenkins Container Setup (including Docker comms)

 1. List item
 2. Make a Dockerfile with the below 

        FROM jenkins/jenkins:lts
        USER root
        RUN apt-get update \
          && apt-get install -y sudo \
          && apt-get install -y libltdl7 \
          && rm -rf /var/lib/apt/lists/
        RUN echo "jenkins ALL=NOPASSWD: ALL" >> /etc/sudoers
        USER jenkins

 3. Build the container and give it a reasonable tag (ran from the directory where the Dockerfile is - or adjust the . to the filepath as necessary 

        docker build -t muhjenkins .

 4. Run it :) This will run the container with a name of jenkins - with volumes as needed to get the container to share the parent docker instance. 

        docker run -d -v /var/run/docker.sock:/var/run/docker.sock -v $(which docker):/usr/bin/docker -p 8080:8080 --name jenkins muhjenkins

 5. Go through the steps on the web page for Jenkins - don't forget to unlock it with the password - found with:

         docker exec -it -u root jenkins bash

    or

        docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

	first logs you into the container - where you can navigate through - second just dumps the password - which was temperamental - but most likely due to incompetence.

 6. Log into the container (with the bash command from the above step) - and try to run docker

	    docker ps
	if it works - great - if not try with sudo 
	
	    sudo docker ps

 7. Test Job to get docker working.  Create a simple free form job - with a build step of :

	 `sudo docker ps`

	then run it - check the console logs under the build id - if it works - then great - then try without sudo.
	
	If that works - great - you're done - otherwise see next step

 8. Jenkins container user modifications 

	Step 1 -Find the docker gid in the docker host vm by running the below:
	

		id
	After this, you can see the id of the group called docker - e.g. 999

	Just for the sake of sanity on the docker host vm - check the jenkins user doesn't exist.
	
	    less /etc/passwd | grep jenkins

	Log into the jenkins container then move over to the jenkins user (could go directly to jenkins if you want - probably advisable).
	
	    docker exec -it -u root jenkins bash
	    su jenkins
	
	Now create the group - but with a specific gid - as  below with sudo if needed - (999 here is the id from the host -use yours).
	
	    groupadd -g 999 docker
		
	Then with the group "fake copied" - add the user to the group
	
        usermod -aG docker jenkins

	Then confirm again with "id" - which should then show the membership to the new group. 
	
	To then get this to work - i had to restart the container - so make sure to exit out back to the docker host - and then restart the container with the below.
	

	    docker restart jenkins

	Then the failing job should be working now.

#### Jenkins Pipeline Attempt
A simple 3 step pipeline

 1. Fetch code from git (including Dockerfile and Jenkinsfile)
 2. Build the container
 3. Push the container to Docker Hub.

First - setup some credentials -  and name them something useful like "dockerhubcreds" which is in my pipeline script - this will contain your Docker Hub configs.
 
Create the pipeline within jenkins with the below settings:
 1. Build Triggers > Poll SCM (Not needed for this - but partway to doing things until i get to webhooks etc.)

	    H/5 * * * *

 2. Under Pipeline - set the definintion to "Pipeline script from SCM", select git - then paste the repo there.
 3. Save and Apply.
 4. Hit Build Now - and it should all run nicely - and you should see the container build in your Docker Hub repos.


#### Deploying Container Built by Pipeline
Create the container by running the below where:

 - < name > is something sensible
 - < username > is your account name
 - < reponame > is the name of the repo you targeted

    docker run -p 8000:8000 --name < name > < username >/< reponame >:latest
