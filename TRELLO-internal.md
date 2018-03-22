***This page contains instructions that have been loaded into Trello.  So either use Trello, or these, but there is no sense in using both!***

### [1] Get ready for ChatOps:  Join Slack and Trello ###
 1. Get on our Slack. Create an account and sign in at [NetApp Hackathon](https://netapp-hackathon.slack.com/). Users with a `@netapp.com` email address will automatically be approved for access.  If you don't have a `@netapp.com` email address contact the leader to get an invite.
 1. Once in Slack have a look around and notice there are several channels that the bots will post to:
  - \#workflow: Trello sourced task completion updates
  - \#build: Jenkins sourced job updates
  - \#git: Git sourced source code and issue updates
 1. Look for a pinned post on the #general channel to find credentials and other info needed for the event.  The leader will assign each team a number giving you your own lab container host.
 1. Get on Trello.  In the pinned post is an invite link to join the hackathon-vol2 board.  Join it and find the list matching your team number.  Open the first card and check off the tasks that you have already completed and then continue with the next task to work through the event!

### [2] Setup Trident ###
Persistent storage is provided by NetApp SolidFire storage and managed using the NetApp Trident Plugin.  Install and setup the plugin, then verify you can provision, use, and deprovision storage directly from Docker.

Trident lives at [NetApp Github](https://github.com/NetApp/trident). The documentation can ben found here: https://netapp-trident.readthedocs.io/en/stable-v18.01/index.html.

1. Install and configure Trident software on your container host.  Attention:
 - SolidFire connection details are in the Slack pinned post found on the #general channel
 - Configure the `TenantName` to be your container hostname (shortname as shown on the SSH prompt)

3. Create, mount, test, unmount, destroy some storage. Notes to help:
 - Use the blog post mentioned earlier for tips!
 - Create a volume.  Next start a container and attach your volume using something like `docker run -it --rm -v vol1:/vol1 alpine ash`. Use `df` to check if the volume is mounted through to the container.  Do some IO and verify from the SolidFire GUI that you see IO to the volume.
 - Explore and try other syntax options to create, clone, mount, and remove persistent storage.  Use the SolidFire GUI and reporting event log to follow along.

### [3] Install Web Application Manually ###
Before you can automate something you have to know the steps to do it by hand.  In this stage you will download the web application, create production storage for it, run the db, and then build and run the webapp.

1. Use `git` to clone the [hackathon-vol2](https://github.com/NetAppEMEA/hackathon-vol2) repo to your container host.  
1. Create persistent storage for your db:
 - Make the size 50GB.
 - Name the volume `vol-redis` because later automation will require this name.
 - Set the QoS limits to Min:500, Max:1500, Burst: 3000.
 - Check the volume from a Docker perspective using `inspect`.
 - Check the SolidFire GUI and verify the config (size and qos) is correct.
1. Run the database container.  The container must be named `redis` as the webapp will connect to this hostname:
 - `docker run --name redis -d  -v vol-redis:/data redis:3.2.6-alpine redis-server --appendonly yes`
 - Check if it is running using `docker ps`.  Are any network ports exported?
 - Which container filesystem path is the `vol-redis` volume mapped to?  How do you know this is the correct location? Hint: Check [Docker Hub](https://hub.docker.com/_/redis/) for more details on this image.
1. The webapp is our own code so we need to build a container image.  The code you cloned earlier includes a Dockerfile.  Use this syntax:
 - `docker build -t webapp:latest .`
 - How many MBs is the image?  What flavor of linux does it use?
1. Run a webapp container from this image. Name the container `webapp` because later automation will require this name.  Use this syntax:
 - `docker run --name webapp -d -p 80:80 --link redis  webapp:latest --redis_port=6379 --redis_host=redis`
 - Are any network ports exported?
 - Why is `--link redis` needed?
1. From your web browser load the webapp and click around a bit. Then use `inspect` in your web browser (right click on the page and choose `inspect`) and click the Network tab
 - What traffic do you see? What data is being sent and what is the response?  
 - Stop the redis database container.  What do you see in `inspect`?  Start the redis container again.
 - What kind of application model is used by the webapp?
1. An API exists that will remove all logos. Call this API to reset things.
 - Search the code on github for an API call you saw when you used `inspect` earlier.  Once you find the file with that code browse around and see if there is another API that will reset things.
 - Use `curl` and the appropriate HTTP verb to call that API and reset your webapp
 - Refresh your web browser and verify it is reset.  
 - Create a more artistic design that you will recognize later during other testing

### [4] Initial setup Jenkins ###
Now that you have the application running we want to enable continuous integration / continuous deployment of it using Jenkins.  First we need to setup Jenkins...in a container of course!

1. Install Jenkins.  The Jenkins container in the Docker hub does not include Docker CLI which we need for management so we will extend the official one.
 - The repo includes a `reference/Dockerfile` which will provide the extra functionality needed.  View the file and see what extra steps are taken.
 - Build an image from it; use an image name like `hack/jenkins` to avoid confusion with the official image
1. Create a 10GB persistent storage volume for Jenkins, for example named `vol-jenkins`.
1. Run the container.  The Jenkins container will use its Docker CLI but manage the Docker engine on the container host.  For this to happen we pass through the management socket from the Docker host into the Jenkins container.  
 - Start Jenkins:
 ```
  docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
  -v vol-jenkins:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e DOCKER_HOST_IP=`ip -4 addr show eth0 | \
  grep -Po 'inet \K[\d.]+'` hack/jenkins
 ```
1. Load the web interface and after logging in choose **Select Plugins to Install**.  Select None and continue.  Update the `admin` user with the password `hack@thepub` and fill in your own name and email address.  It should complete the initial setup and then show you the main dashboard.
1. Add the following plugins by navigating **Manage Jenkins** -> **Manage Plugins**:
 - **user build vars plugin**
 - **Slack Notification Plugin**
 - **Pipeline**
 - **GitHub Plugin**
 - *Choose to download now and activate after next boot.  Then on the install status screen check the Restart Jenkins checkbox.*
1. Configure the Slack plugin: **Manage Jenkins** -> **Configure System** and fill in the **Global Slack Notifier Settings** using details provided in the pinned Slack post.  Click the **Test Connection** button and verify a test message is posted to Slack #build channel.

### [5] Configure jobs in Jenkins ###

Jenkins is very flexible supporting numerous job types.  We will explore freestyle jobs (more simplistic) and pipeline jobs (more advanced).

1. First, lets create a new **freestyle** job:
 - Create a new **freestyle** job called `hello-world`.
 - In the **Build** steps add an **Execute shell** step with contents `docker run --rm hello-world`.
 - In the **Post-build Actions** add a **Slack Notifications** step and enable Slack notifications for **start**, **failure**, and **success**.
 - Click **Build Now** and then on the build # view the **Console Output** to see that it was able to run correctly.
 - Check the Slack #build channel to see if the progress was posted.
 - Explore around and tweak your job adding new steps, maybe ones that are expected to fail so that you can see the results.
 - Post a message to Slack on the #general channel describing a use case for Jenkins with NetApp

1. Now lets look at a **pipeline** job that uses a Pipeline script. The Pipeline script is written in [Groovy](http://www.groovy-lang.org/) and allows for more sophisticated control.  The script can be typed manually into Jenkins, or stored in a `Jenkinsfile` which is pulled from an SCM like Git.  Do the following:
 - In the Git repo there is a `Jenkinsfile`.  Find the file and read through what it will do.
 - Create a new **pipeline** job called `webapp`.  
 - Choose **pipeline from SCM** using **Git** and add the Git repository URL.

1. It's time to test our CI/CD.  Choose **Build Now** on our new pipeline.
 - Monitor the stages in Jenkins.  Monitor Slack for posts.
 - When approval is requested check the console log for a URL for the staging instance.  Check it and if you like the change, push to production, otherwise don't!
 - Monitor the \#git channel for code updates.  If code is checked in see what changed and trigger a build.  If you're eager for a change ask the leader to push something!

### The end ###

If you got here you have successfully setup worked in an Agile way to setup a Continuous Integration / Continuous Deployment (CI/CD) pipeline to build, test, and deploy a containerized stateful web application using NetApp SolidFire storage!  Pat yourself on the back and post an emoji or two to Slack to celebrate your triumph!

And in case you want more, keep going, the container host is yours to play with!  
Some ideas:

- Configure your pipeline to automatically check and build code updates pushed to Git
- Create a job that would create a QA instance, and another that would destroy it
- Create another web application using persistent storage with some other database type
- Create a simple apache webserver with your own webpage on persistent storage.  Change it to nginx webserver with the same persistent storage.
