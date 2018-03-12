# Goal #
Work in an Agile way and build a Continuous Integration / Continuous Deployment (CI/CD) pipeline to build, test, and deploy a containerized stateful web application:

![Diagram of Goal](https://cloud.githubusercontent.com/assets/917241/22088722/60f5e71a-dde6-11e6-8307-0160f2cc6ca8.png)

We will use Slack and Trello to work using a ChatOps model popular in DevOps shops.  Slack is a communications platform (chat on steroids) and Trello helps with task management which will help you keep your actions and status in check.  You will do most work on your own container host running CoreOS, an OS optimized for containers which includes Docker pre-installed.  From that host you will install and configure the NetApp Trident Plugin and provision some NetApp SolidFire storage.  Then you will deploy a web application and database and test it works properly.  Next you will setup Jenkins, including integration with Slack, so that you can quickly test and deploy new releases of the app that will be rolled out during the event.

Technologies used:

- Trello and Slack for ChatOps
- Docker as the container engine
- Jenkins as the CI/CD engine
- SolidFire with the NetApp Trident Plugin for persistent storage
- Web application written in Node.js and Javascript
- Redis in-memory data structure store as database

## Start here! ##
To begin you need to get connected to our ChatOps tooling; Slack and Trello:

1. Get on our Slack. Create an account and sign in at [NetApp Hackathon](https://netapp-hackathon.slack.com/). Users with a `@netapp.com` email address will automatically be approved for access.  If you don't have a `@netapp.com` email address contact the leader to get an invite.
1. Once in Slack have a look around and notice there are several channels that the bots will post to:
 - \#workflow: Trello sourced task completion updates
 - \#build: Jenkins sourced job updates
 - \#git: Git sourced source code and issue updates
1. Look for a pinned post on the #general channel to find credentials and other info needed for the event.  The leader will assign each team a number giving you your own lab container host.
1. Get on Trello.  In the pinned post is an invite link to join the hackathon-vol2 board.  Join it and find the list matching your team number.  Open the first card and check off the tasks that you have already completed and then continue with the next task to work through the event!

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
| `/var/log/netappdvp/*`         | Error log for the Trident.  If something isn't working check here!                                                          |
