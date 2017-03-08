# Goal #
Work in an Agile way and build a Continuous Integration / Continuous Deployment (CI/CD) pipeline to build, test, and deploy a containerized stateful web application:

![Diagram of Goal](https://cloud.githubusercontent.com/assets/917241/22088722/60f5e71a-dde6-11e6-8307-0160f2cc6ca8.png)

We will use Slack and Trello to work using a ChatOps model popular in DevOps shops.  Slack is a communications platform (chat on steroids) and Trello helps with task management which will help you keep your actions and status in check.  You will do most work on your own container host running CentOS. From that host you will install and configure the NetApp Docker Volume Plugin and provision some NetApp SolidFire storage. Then you will deploy a web application and database and test it works properly. Next you will setup Jenkins, including integration with Slack, so that you can quickly test and deploy new releases of the app that will be rolled out during the event.

Technologies used:

- Trello and Slack for ChatOps
- Docker as the container engine
- Jenkins as the CI/CD engine
- SolidFire with the NetApp Docker Volume Plugin for persistent storage
- Web application written in Node.js and Javascript
- Redis in-memory data structure store as database

## Start here! ##
In this event we will use lab resources from NetApp Hands-on-lab (scheduled event) or NetApp Lab on Demand (individual ad-hoc lab).  The lab "SolidFire 101 Hands on Lab v1.0" provides us with a Linux host and NetApp SolidFire cluster.  We will follow a few steps in the lab guide but mostly just need the systems for our own hack :-)

1. Launch your lab:
 - If a scheduled event use the login details provided by the event leader.  The lab is already initialized and ready to go!
 - If you are an individual running it on your own launch your own lab by logging into [Lab on Demand](https://labondemand.netapp.com/?p=library) and then request [SolidFire 101 Hands on Lab](https://labondemand.netapp.com/?p=RequestLab&id=10300).  It can take some time to initialize (minimum 20 minutes) so grab a drink!
1. Connect to the remote desktop session in your web browser.  I highly recommend you make the browser window full screen to avoid distractions and clutter from your laptop.  **Complete all remaining steps inside this remote desktop session!**
1. Open this webpage inside your remote desktop session and continue from it.

### [1] Get ready for ChatOps:  Join Slack and Trello ###
Get connected to our ChatOps tooling; Slack and Trello:

1. Get on our Slack. Create an account and sign in at [NetApp Hackathon](https://netapp-hackathon.slack.com/). Users with a `@netapp.com` email address will automatically be granted access.  Non-NetApp users should give their email address to the leader and request an invitation.
1. Once in Slack have a look around and notice there are several channels that the bots will post to:
 - \#workflow: Trello sourced task completion updates
 - \#build: Jenkins sourced job updates
 - \#git: Git sourced source code and issue updates
1. Look for a pinned post on the #general channel to find some private info needed for the event.
1. Get on our Trello board using the invite link in the pinned post on Slack.  Find the list matching your team number, here you will find all steps for the event.  Open the first card and check off the tasks that you have already completed and then continue with the rest.

## Acknowledgements ##

Special thanks to [Andrew Sullivan](https://github.com/acsulli) for Jenkinsfile snippets and inspiration, [Kai Davenport](https://github.com/binocarlos) for the basis of the stateful app, and Jason Padman and Kapil Arora for their dry-run to validate the steps!

## CLI hints ##

If you don't use Linux and Docker everyday here are some useful commands:

| Command                        | Description     |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `sudo -i`                      | Superuser do interactively.  Basically change your shell to the root user so you don't need to type sudo anymore.        |
| `ls -ltr`                      | Show all files in a directory, reverse sorted by modification timestamp.  Useful to find the most recently modified file.|
| `history`                      | Show previous commands entered                                                                                           |
| `docker --help`                | Show help for docker.  Available at each level, so `docker volume --help` will give help syntax for volumes              |
| `/var/log/netappdvp/*`         | Error log for the nDVP.  If something isn't working check here!                                                          |
