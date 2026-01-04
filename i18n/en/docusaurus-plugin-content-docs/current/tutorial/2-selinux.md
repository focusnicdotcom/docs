---
title: SELinux
description: SELinux Tutorial and Configuration
sidebar_position: 101
sidebar_label: SELinux
---
SELinux is a kernel-level security mechanism in Linux that provides policy-based access control (MAC). SELinux helps restrict processes and 
users from accessing only allowed resources, thus preventing system abuse even if the service is exposed to exploits.

## Check SELinux Status
Run the following command
```
sestatus
```
Here are the output results:
```jsx showLineNumbers
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33
```
Or you can also use the following command which is simpler and immediately displays the status
```
getenforce
```
Example:
```
Enforcing
```
The following describes the output of SELinux:

- `Enforcing` → Enable and block access against policy.

- `Permissive` → Log only (not blocking).

- `Disabled` → Inactive.

## Changing SELinux Mode (Temporarily)
:::info
These changes will disappear after a reboot.
:::
Run the following command to change to `Permissive` mode
```
setenforce 0
```
Run the following command to change to `Enforcing` mode
```
setenforce 1
```

## Change SELinux Mode (Permanent)
Edit the following SELinux configuration file:
```
nano /etc/selinux/config
```
To disable SELinux please fill in the following parameters or change the existing parameters to:
```jsx showLineNumbers title="/etc/selinux/config"
SELINUX=disabled 	# Change to permissive or disabled if necessary
SELINUXTYPE=targeted
```
The value option in SELinux:

- `enforcing`

- `permissive`

- `disabled`

The value option in SELinux:

- `targeted` → Default, protects only certain services (Apache, SSH, etc).

- `mls` → Multi-Level Security, kompleks, untuk sistem keamanan tinggi (jarang digunakan umum).

After changing SELinux please reboot the server:
```
reboot -h now
```
## Check Logs on SELinux
SELinux logs are stored in `/var/log/audit.log`. Use ausearch or sealert (if installed):
```
ausearch -m avc -ts recent
```
Or to analyze:
```
sealert -a /var/log/audit/audit.log
```
Can use `tail` as follows:
```
tail -f /var/log/audit/audit.log
```

## Managing SELinux Booleans
There is a case where when SELinux is active and we install Apache/HTTPD the daemon does not access folders outside its default directory. So if you want 
to allow Apache to access outside folders please run the following command:
```
chcon -Rt httpd_sys_content_t /var/www/custom-folder
setsebool -P httpd_read_user_content on
```

See all booleans:
```
getsebool -a
```
See specific boolean:
```
getsebool httpd_can_network_connect
```
Enable boolean. `-P` to be permanent after reboot:
```
setsebool -P httpd_can_network_connect on
```
