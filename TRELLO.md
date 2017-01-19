***This page contains instructions that have been loaded into Trello.  So either use Trello, or these, but there is no sense in using both!***

### [1] Get ready for ChatOps:  Join Slack and Trello ###
1. [Slack](https://www.slack.com) is software used for communicating within teams.  In this event we will use it for Q/A as well as updates from other tooling. Please create an account and sign in at [NetApp Hackathon](https://netapp-hackathon.slack.com/).  If you use your @netapp.com email address you will automatically be approved for access.  Once you have joined post a welcome message announcing yourself on the #general channel!  There are a few other channels that the bots will post to:
 - #workflow: Trello sourced task completion updates
 - #build: Jenkins sourced job updates
 - #git: Git sourced source code and issue updates
1. Send the leader a private message on Slack asking for credentials for this event.  Please only ask once for each team as a container host will be allocated to your team in the response.

1. [Trello](https://www.trello.com) is visual workflow software where you can make tasks, assign them to teammates, and easily track progress. The instructions for the event are in Trello.  A sign-up link will be provided on Slack.  Sign up and then click create a list for your team by copying from the 'Template' list:
 - Click the 'Template' list settings (...), select 'Copy List', and enter your names.
1. Start working off your own list on each card and each task in Trello.  Be sure to check things off in the checklist as you complete them!

### [2] Setup nDVP ###
Persistent storage is provided by NetApp SolidFire storage and managed using the [NetApp Docker Volume Plugin (nDVP)](https://github.com/NetApp/netappdvp).  Install and setup the plugin, then verify you can provision, use, and deprovision storage directly from Docker.

1. The installation instructions for nDVP are at [NetApp Github](https://github.com/NetApp/netappdvp).  Use them to install and configure the software on your container host.  Some notes:
 - Use v1.3 and NOT v1.3.2 which has a cloning bug with SolidFire that will cause issues for us!
 - On CoreOS the `/usr` filesystem is readonly so put it elsewhere, such as in `/opt`.
2. Configure and start the nDVP with the NetApp SolidFire backend.  Notes to help:
 - SolidFire details have been provided in a separate email
 - Configure the `TenantName` with a value of your container hostname
 - On CoreOS when you start the nDVP use must pass the port like `--port=27609`
 - nDVP does not daemonize so you should put a `&` on the end of your command when starting it to put it in the background
3. Create, mount, test, unmount, destroy some storage. Notes to help:
 - Check [this blog post](https://netapp.github.io/blog/2016/06/16/volume-options-with-the-netapp-docker-volume-plugin/) from Andrew Sullivan for some examples of the `docker volume` command syntax when using the nDVP.  Also use `docker volume --help` to see the various commands related to volumes.
 - With SolidFire, QoS limits can be set using one of the following options:
     - `-o type=MYTYPE`: Create a `Types` snippet for `MYTYPE` in your json and then reference it in your `docker volume create`. Note that nDVP reads the file when it starts so if you modify it you must restart nDVP to have these values take effect.
     - `-o qos=MIN,MAX,BURST`: Specify the QoS values directly as a plugin option to your `docker volume create`
 - Start a container and attach your volume using something like `docker run -it --rm -v vol1:/vol1 alpine ash`. Use `df` to check if the volume is mounted through to the container.  Do some IO and verify from the SolidFire GUI that you see some IO to the volume.

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
 - What filesystem path is the SolidFire volume mapped to in the container?  How do you know this is the correct location? Hint: Check [Docker Hub](https://hub.docker.com/) for more details on this image.
1. The webapp is our own code so we need to build a container image.  Use this syntax:
 - `docker build -t webapp:latest .`
 - How man MBs is the image?
1. Run a webapp container. Name the container `webapp` because later automation will require this name.
 - `docker run --name webapp -d -p 80:80 --link redis  webapp:latest --redis_port=6379 --redis_host=redis`
 - Are any network ports exported?
 - Why is `--link redis` needed?
1. From your web browser load the webapp and click around a bit.  Then use 'inspect' in your web browser (right click on the page and choose `inspect`) and click the Network tab
 - What traffic do you see?  What data is being sent and what is the response?  Stop the redis database.  What happens?  Start it again.
 - Add some logos.  What traffic do you see?  What data is being sent and what is the response? What kind of application model is used by the webapp?  
1. An API exists that will remove all logos. Call this API to reset things
 - Search the code on github for an API call you saw when you used `inspect` earlier.  Once you find the file with that code browse around and see if there is another API that will reset things.
 - Use `curl` to call that API and reset your db
 - Refresh your web browser and verify it is reset.  Create a more artistic design that you will recognize later during other testing

### [4] Initial setup Jenkins ###
Now that you have the application running we want to enable continuous integration / continuous deployment of it using Jenkins.  First we need to setup Jenkins...in a container of course!

1. Install Jenkins.  The Jenkins container in the Docker hub does not include Docker CLI which we need for management so we will extend the official one.
 - The repo includes a `reference/Dockerfile-jenkins` which will provide the extra functionality needed.  View the file and see what extra steps are taken.
 - Build an image from it; use a name like `hack/jenkins` to avoid confusion with the official image
1. Create a 10GB persistent storage volume for Jenkins, for example named `vol-jenkins`.
1. Run the container.  The Jenkins container will use its Docker CLI but manage the Docker engine on the container host.  For this to happen we pass through the management socket from the Docker host into the Jenkins container.  
 - Start Jenkins:
 ```
  docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
  -v vol-jenkins:/var/jenkins_home -v /var/run/docker.sock:/var/run/docker.sock \
  -e DOCKER_HOST_IP=`ip -4 addr show eth0 | grep -Po 'inet \K[\d.]+'` hack/jenkins
 ```
1. Load the web interface and after logging in choose **Select Plugins to Install**.  Select None and continue.  Update the `admin` user with the password `hack@thepub` and fill in your own name and email address.  It should complete the initial setup and then show you the main dashboard.
1. Add the following plugins by navigating **Manage Jenkins** -> **Manage Plugins**:
 - **user build vars plugin**
 - **Slack Notification Plugin**
 - **Pipeline**
 - **GitHub Plugin**
 - *Choose to download now and activate after next boot.  Then on the install status screen check the Restart Jenkins checkbox.*
1. Configure the Slack plugin:
 - Install plugin: **Manage Jenkins** -> **Manage Plugins** and install **Slack Notification Plugin**.  No restart of Jenkins is necessary.
 - Configure the plugin: **Manage Jenkins** -> **Configure System** and fill in the **Global Slack Notifier Settings** using details provided by the event leaders.  Click the **Test Connection** button and verify a test message is posted to Slack #build channel.

### [5] Configure jobs in Jenkins ###

Jenkins is very flexible supporting numerous job types.  We will explore freestyle jobs (more simplistic) and pipeline jobs (more advanced).

1. First, lets create a new **freestyle** job:
 - Create a new **freestyle** job called `hello-world`.
 - In the **Build** steps add an **Execute shell** step with contents `docker run --rm hello-world`.
 - In the **Post-build Actions** add a **Slack Notifications** step and enable Slack notifications for **start**, **failure**, and **success**.
 - Click **Build Now** and then on the build # view the **Console Output** to see that it was able to run correctly.
 - Check the Slack #build channel to see if the progress was posted.

1. Now lets look at a **pipeline** job that uses a Pipeline script. The Pipeline script is written in [Groovy](http://www.groovy-lang.org/) and allows for more sophisticated control.  The script can be typed manually into Jenkins, or stored in a `Jenkinsfile` which is pulled from an SCM like Git.  Do the following:
 - The webapp in the repo includes a `Jenkinsfile`.  Find the file and read through what it will do.
 - Create a new **pipeline** job called `webapp`.  Choose **pipeline from SCM** using **Git** and add the Git repository URL.

1. It's time to test our CI/CD.  Choose **Build Now**.  
 - Monitor the stages in Jenkins.  Monitor Slack for posts.
 - When approval is requested if you want to push to production check the test instance.  If it looks good, push to production, otherwise don't!  If you're ready for a code change ask the leader to push something new for you!

### The end ###

If you got here and are looking for more here are some ideas:
- Add an automated test case into the pipeline
- Create a job that would create a QA instance, and another that would destroy it
- Create another web application using persistent storage for some other database type
