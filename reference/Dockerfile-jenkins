FROM jenkins:2.32.1-alpine
MAINTAINER Christopher Madden <madden@netapp.com>
USER root
RUN apk add --no-cache sudo docker
RUN echo "jenkins ALL=NOPASSWD: ALL" >> /etc/sudoers
	
	