## Lab on Demand ##

The documentation is written using internal NetApp lab resources but with a few modifications you can also use the NetApp Lab on Demand infrastructure:

1. Login [Lab on Demand](https://labondemand.netapp.com/?p=library) and then request [SolidFire 101 Hands on Lab](https://labondemand.netapp.com/?p=RequestLab&id=10300).
1. Wait for it to initialize.  In the meantime review the lab guide and grab a drink!
1. Access the Lab on Demand remote desktop session in your web browser and complete section 3.1 from the lab guide to complete the initial setup of the SolidFire cluster.
1. Login the centos host using putty
1. Set SElinux in permissive mode so Docker socket can be accessed by Jenkins:
    ```
    [root@centos72 ~]# setenforce permissive
    ```

1. Remove the default firewall blocking rule.  First, find rule in "Chain INPUT" that has REJECT all in it.  Next delete this one by num.
    ```
    [root@centos72 ~]# iptables -L INPUT --line
    Chain INPUT (policy ACCEPT)
    num  target     prot opt source               destination
    1    ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
    2    ACCEPT     all  --  anywhere             anywhere
    3    INPUT_direct  all  --  anywhere             anywhere
    4    INPUT_ZONES_SOURCE  all  --  anywhere             anywhere
    5    INPUT_ZONES  all  --  anywhere             anywhere
    6    ACCEPT     icmp --  anywhere             anywhere
    7    REJECT     all  --  anywhere             anywhere             reject-with icmp-host-prohibited

    [root@centos72 ~]# iptables -D INPUT 7
    ```

1. Install Docker engine and start it
```
[root@centos72 ~]# yum install -y docker
[root@centos72 ~]# systemctl start docker
```

1.  Continue with the ***normal*** instructions but note these three points:
   - Connection information for the SolidFire cluster needed for the nDVP are in your Lab on Demand guide
   - Trello and Slack information from the normal event can be used as these are external cloud services. Alternately, create your own Trello and Slack sites for the integration.
   - Jenkins requires a different command in step 4.3 of the lab to start it correctly.  Use this command:
       ```
       [root@centos72 ~]# docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \
       -v vol-jenkins:/var/jenkins_home \
       -v /var/run/docker.sock:/var/run/docker.sock \
       -e DOCKER_HOST_IP=`ip -4 addr show ens160 | \
       grep -Po 'inet \K[\d.]+'` hack/jenkins

       ```

Enjoy!
