---
title: Install Apache
description: How to Install Apache on AlmaLinux 8
sidebar_position: 2
sidebar_label: Install Apache / HTTPD
---
Apache Web Server is still the top choice for serving website content in Linux environments. AlmaLinux 8, as one of the most stable and
compatible enterprise Linux distributions with Red Hat Enterprise Linux (RHEL), is an ideal match for Apache installation due to its reliability, long-term support, and strong ecosystem. In this guide, we will cover the complete, detailed, and practical steps to install Apache Web Server on the AlmaLinux 8 operating system.

## Prerequisite
- Full `root` access
- Basic Linux Command Line
- Security

## Instalasi Apache
Always perform system updates prior to server application installation to ensure compatibility with the latest repositories:
```
dnf update -y
```
Apache is known as the `httpd` package in Red Hat-based environments. Installation can be done with the following command:
```
dnf install httpd -y
```
Once the installation is complete, enable the Apache service to run automatically when booting:
```
systemctl enable --now httpd
```
To make sure Apache is running properly, use the command:
```
systemctl status httpd
```
Here is an example of `httpd` status output:
```
● httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)
   Active: active (running) since Fri 2025-07-11 18:34:56 WIB; 4s ago
     Docs: man:httpd.service(8)
 Main PID: 2027 (httpd)
   Status: "Started, listening on: port 80"
    Tasks: 213 (limit: 11143)
   Memory: 37.6M
```
By default, the firewall in AlmaLinux 8 uses Firewalld. To open HTTP (port 80) and HTTPS (port 443) access, run the following command:
```
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```
Open a browser and access the server IP address, for example `http://192.168.1.100`, the Apache Test Page will appear.
![](/img/almalinux8-httpd-test-page.jpg)<br/>

## Apache Directory Structure on AlmaLinux 8
Knowing the Apache directory structure is essential for easy content and configuration management:

- `/etc/httpd/` → The main directory of the Apache configuration

- `/etc/httpd/conf/httpd.conf` → Main configuration file

- `/etc/httpd/conf.d/` → Additional configuration directories, including virtual hosts

- `/var/www/html/` → Default directory where website files are stored

- `/var/log/httpd/` → Location of Apache access and error log files

## Adding the First Web Content
Put the HTML file into `/var/www/html/`. A simple example:
```
echo "<h1>Welcome to Web Server Apache AlmaLinux 8</h1>" | tee /var/www/html/index.html
```
After that, access the server using a browser to see your first page live.

## Troubleshooting
Encountering problems when installing or running Apache is common. Here are some of the problems that often arise along with practical solutions that we can do
n.

1. Apache fails to start and displays an error when using `systemctl start httpd`. Check the status and error message with:
```
systemctl status httpd
journalctl -xe
```

2. If port `80` or `443` is already used by another application, shut down or reconfigure the application.
```
lsof -i :80
lsof -i :443
```

3. After editing the configuration file, the changes are not visible in the browser. Make sure the configuration file is valid:
```
apachectl configtest
```

4. Restart Apache after the changes:
```
systemctl restart httpd
```

## Conclusion
The process of **installing Apache Web Server on AlmaLinux 8** has been successfully carried out with precise and systematic steps. Apache is now up and running as **
web content serving service (HTTP)** on the system, ready to be used as the main foundation in building and managing web-based applications.

With the basic configuration we have implemented, this server can **already serve static HTML content**, as well as allow users to access the main page via the server's 
IP address. This is a very important initial stage before we move on to advanced configuration stages such as **creating a Virtual Host to manage multiple domains**
and **implementing HTTPS with SSL for communication security**.

The next recommended steps are:

- Setting up **Virtual Host** so that the server can serve multiple domains on one physical server or VPS.
- Enabling **SSL (HTTPS)** using Let's Encrypt or other certificates to ensure user data security.
- Optimizing performance and hardening the Apache configuration to improve server speed, efficiency, and security.

Q: What is Apache Web Server?<br/>
A: Apache is an open-source software that serves website content via HTTP/HTTPS protocol.

Q: Is AlmaLinux suitable for use in a production environment? <br/>
A: Very suitable. AlmaLinux is designed to replace CentOS with long-term stability and RHEL 1:1 compatibility.

Q: How do I make sure Apache stays secure?<br/>
A: Perform regular updates, use HTTPS, restrict access with firewalls, and implement configuration hardening.

Q: Can Focusnic help with Apache installation and configuration?<br/>
A: Yes, Focusnic is the best solution for professional VPS server installation and cloud management.
