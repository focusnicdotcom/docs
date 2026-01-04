---
title: Basic Configuration
description: AlmaLinux 8 Basic Configuration Tutorial
sidebar_position: 3
sidebar_label: Basic Configuration
---

After the AlmaLinux 8 operating system installation process is complete, the next very important step is to perform basic configuration. This configuration
aims to ensure that the system runs stably, safely, and is ready to be used as a production server, testing server, or development server.

:::info
This configuration can also be done on all servers whether VPS, Dedicated Server, or similar. When we first boot, we will usually configure
this configuration so that the dependencies or tools we need are available at the beginning and facilitate Linux administration.
:::

## Setting Hostname
So that the server hostname is easily recognized and correctly set in DNS / network identification. In addition, if you want to use this server for web hosting services such as
cPanel control panel, Plesk, and so on, it is usually required to set the FQDN hostname and also PTR / DNS pointing on this server.

```
hostnamectl set-hostname web1.focusnic.com
```

## Update and Install Basic Packages
Here is the update server and also the installation of basic packages for linux administration purposes
```
dnf update -y && dnf install epel-release -y
dnf update -y && dnf -y install git traceroute nmap bash-completion bc bmon bzip2 curl dmidecode ethtool htop ifstat iftop iotop make multitail nano bind-utils net-tools rsync screen sudo tree unzip wget yum-utils zip zlib-devel tar screen dnf-plugins-core sysstat
```

Here are the packages that will be installed
| **Package**        | **Function**                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `git`              | Version control system, commonly used to manage source code.                                |
| `traceroute`       | Traces the route (hops) that packets take to reach a destination host.                      |
| `nmap`             | Network and port scanning tool.                                                             |
| `bash-completion`  | Provides tab-completion for bash commands and arguments.                                    |
| `bc`               | Command-line calculator supporting complex arithmetic operations.                           |
| `bmon`             | Real-time bandwidth monitor per interface.                                                  |
| `bzip2`            | File compression utility.                                                                   |
| `curl`             | Tool to transfer data from/to servers via URL-based protocols (HTTP, FTP, etc.).            |
| `dmidecode`        | Displays hardware information from BIOS (CPU, RAM, motherboard, etc.).                      |
| `ethtool`          | Utility to view or modify NIC (Network Interface Card) settings.                            |
| `htop`             | Interactive and user-friendly alternative to `top`, showing system processes.               |
| `ifstat`           | Displays real-time network interface statistics.                                            |
| `iftop`            | Real-time display of bandwidth usage between IPs.                                           |
| `iotop`            | Tracks real-time disk I/O usage by processes.                                               |
| `make`             | Utility to build and manage projects (commonly used for compiling software).                |
| `multitail`        | View and follow multiple log files simultaneously in terminal.                              |
| `nano`             | Simple terminal-based text editor.                                                          |
| `bind-utils`       | Contains DNS utilities like `dig`, `host`, and `nslookup`.                                  |
| `net-tools`        | Classic networking tools (e.g., `ifconfig`, `netstat`, etc.).                               |
| `rsync`            | Tool for syncing files and directories across systems or locations.                         |
| `screen`           | Terminal multiplexer to run multiple shell sessions and resume them later.                  |
| `sudo`             | Allows running commands as another user (typically root).                                   |
| `tree`             | Displays directory structure in a tree format.                                              |
| `unzip`            | Extract `.zip` archive files.                                                               |
| `wget`             | Downloads files from the web via HTTP/HTTPS/FTP.                                            |
| `yum-utils`        | Collection of tools to extend YUM/DNF functionality.                                        |
| `zip`              | Compress files into `.zip` archives.                                                        |
| `zlib-devel`       | Development headers and library for data compression (required for building some software). |
| `tar`              | Archive utility for packaging and extracting files and directories.                         |
| `dnf-plugins-core` | Additional plugins for DNF, like `config-manager`.                                          |
| `sysstat`          | System performance monitoring tools (`iostat`, `mpstat`, `pidstat`, etc.).                  |

## Setting Timezone
Time synchronization. This is very useful for systems or applications that will be hosted on this server. Besides being useful for viewing logs, and also synchronizing time
```
timedatectl set-timezone Asia/Jakarta
```
Make sure the output is like this and also the parameter `System clock synchronized: yes`
```jsx showLineNumbers
               Local time: Wed 2025-07-02 21:25:45 WIB
           Universal time: Wed 2025-07-02 14:25:45 UTC
                 RTC time: Wed 2025-07-02 14:25:45
                Time zone: Asia/Jakarta (WIB, +0700)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```
If `System clock synchronized: no` let's install `chony`
```
dnf install chrony
systemctl enable --now chronyd
timedatectl set-timezone Asia/Jakarta
```

If everything is set, then please reboot the server
```
reboot -h now
```
