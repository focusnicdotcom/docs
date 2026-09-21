---
title: Complete Guide on How to Install phpMyAdmin using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install phpMyAdmin using LAMP Stack on AlmaLinux 8
sidebar_label: phpMyAdmin
---

Managing a **MySQL or MariaDB** database often requires an easy-to-use graphical interface. One of the most popular tools is **phpMyAdmin**, which can be accessed through a browser to simplify database administration. This guide will detail **how to install phpMyAdmin on AlmaLinux 8 using the LAMP Stack**.

**phpMyAdmin** is a PHP-based application used to manage MySQL/MariaDB databases through a browser. Its advantage lies in its intuitive graphical display, so users do not need to always rely on manual SQL commands. While **AlmaLinux 8** is a Linux distribution based on RHEL (Red Hat Enterprise Linux) designed for long-term stability, making it very suitable for production servers. When combined with **LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP)**, phpMyAdmin will be a very powerful tool for managing website and application databases.

By following these steps, your server will be ready to use to manage databases safely, quickly, and efficiently.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the Shopware installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
```
dnf update -y
dnf install epel-release -y
```

### Install Apache

Apache is a reliable web server and is widely used in production environments. To install it, run the following command:
```
dnf install httpd -y
```
Once the installation is complete, enable and start the Apache service with the following command:
```
systemctl enable --now httpd
```
To allow access to the server via HTTP and HTTPS, allow the firewall:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

### Install PHP

PHP (Hypertext Preprocessor) is a server-side programming language that is crucial in this stack. We will install PHP 8 from the Remi Repository to use the latest version of PHP.

Run the following command to install the Remi Repository:
```
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
```
Then list the available PHP using the following command:
```
dnf module list php
```
Output example:
```
AlmaLinux 8 - AppStream
Name                            Stream                              Profiles                                              Summary                                         
php                             7.2 [d]                             common [d], devel, minimal                            PHP scripting language                          
php                             7.3                                 common [d], devel, minimal                            PHP scripting language                          
php                             7.4                                 common [d], devel, minimal                            PHP scripting language                          
php                             8.0                                 common [d], devel, minimal                            PHP scripting language                          
php                             8.2                                 common [d], devel, minimal                            PHP scripting language                          

Remi's Modular repository for Enterprise Linux 8 - x86_64
Name                            Stream                              Profiles                                              Summary                                         
php                             remi-7.2                            common [d], devel, minimal                            PHP scripting language                          
php                             remi-7.3                            common [d], devel, minimal                            PHP scripting language                          
php                             remi-7.4                            common [d], devel, minimal                            PHP scripting language                          
php                             remi-8.0                            common [d], devel, minimal                            PHP scripting language                          
php                             remi-8.1                            common [d], devel, minimal                            PHP scripting language                          
php                             remi-8.2                            common [d], devel, minimal                            PHP scripting language                          
php                             remi-8.3                            common [d], devel, minimal                            PHP scripting language                          
php                             remi-8.4                            common [d], devel, minimal                            PHP scripting language                          

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```
Enable the desired PHP module version. For example, for PHP 8.4, run the following command:
```
dnf module reset php -y
dnf module enable php:remi-8.4 -y
```
Once the repository is active, we can proceed with installing PHP along with the commonly used essential modules:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap
```
Check the installed PHP version with the following command:
```
php -v
```

### Install MariaDB

MariaDB is a replacement for MySQL and is compatible with MySQL-based applications. Run the following command to install it:
```
dnf module list mariadb
```
Output example:
```
AlmaLinux 8 - AppStream
Name                                Stream                               Profiles                                               Summary                                   
mariadb                             10.3 [d]                             client, galera, server [d]                             MariaDB Module                            
mariadb                             10.5                                 client, galera, server [d]                             MariaDB Module                            
mariadb                             10.11                                client, galera, server [d]                             MariaDB Module                            

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```
The output above shows that the default version of MariaDB is 10.11 (the latest version from the OS). However, we'll use MariaDB version 11.4.7 using the official repository at https://mariadb.org/download/ and then reset MariaDB to remove it from the OS's default repository:
```
dnf module reset mariadb
```
Run the following command to add the MariaDB version 11.4.7 repository:
```
nano /etc/yum.repos.d/MariaDB.repo
```
Add the following parameters:
```
# MariaDB 11.4 RedHatEnterpriseLinux repository list - created 2025-07-31 14:04 UTC
# https://mariadb.org/download/
[mariadb]
name = MariaDB
# rpm.mariadb.org is a dynamic mirror if your preferred mirror goes offline. See https://mariadb.org/mirrorbits/ for details.
# baseurl = https://rpm.mariadb.org/11.4/rhel/$releasever/$basearch
baseurl = https://mirror.its.dal.ca/mariadb/yum/11.4/rhel/$releasever/$basearch
module_hotfixes = 1
# gpgkey = https://rpm.mariadb.org/RPM-GPG-KEY-MariaDB
gpgkey = https://mirror.its.dal.ca/mariadb/yum/RPM-GPG-KEY-MariaDB
gpgcheck = 1
```
Then run the following command to install MariaDB:
```
dnf install MariaDB-server MariaDB-client
```
Enable and activate the MariaDB service:
```
systemctl enable --now mariadb
systemctl status mariadb
```
Before using it for production or testing, it is best to secure the MariaDB installation first by running the following command:
```
mariadb-secure-installation
```
Then follow the instructions that appear:

- Enter current password for root (enter for none) → **[ENTER]**
- Switch to unix_socket authentication → **Y**
- Change the root password? → **Y**
- Remove anonymous users? → **Y**
- Disallow root login remotely? **Y**
- Remove test database and access to it? **Y**
- Reload privilege tables now? **Y**

## Install phpMyAdmin

:::info
Make sure you use a valid domain (FQDN) and also that the DNS A record is directed or pointed according to the server IP used on the server.
:::

To install phpMyAdmin we will use the repository from Remi using the following command:
```
dnf --enablerepo=remi install phpmyadmin
```

Then configure the phpMyAdmin virtualhost:
```
nano /etc/httpd/conf.d/phpMyAdmin.conf
```
Change the following parameters to allow all IP addresses to access phpMyAdmin:

:::warning
Once in production, be sure to allow only certain IP addresses. Here's an example configuration:
```
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require ip 192.168.2.3
   Require ip 192.168.5.0/24
</Directory>
```
:::

```jsx showLineNumbers title="/etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

#   Require local
    Require all granted
</Directory>
```
Restart Apache to save changes:
```
apachectl configtest
systemctl restart httpd
```

The following is a view of phpMyAdmin, which can be accessed via `http://$DOMAIN/phpmyadmin` or `http://$IP-ADDRESS/phpmyadmin`
:::info
You can use the `root` password or the user that has been created in the Mariadb database above.
:::

![](/img/almalinux8-lamp-apps-phpmyadmin1.jpg)<br/>

## Troubleshooting

1. Error 403 Forbidden <br/>

This is usually because the Apache configuration still restricts access to localhost only. Double-check the `/etc/httpd/conf.d/phpMyAdmin.conf` configuration to allow the IP you're using.

2. Login fails even though the password is correct <br/>

This could be because the `auth_socket` plugin is active in MariaDB. Change the authentication method to `mysql_native_password`.
```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password-change-2025';
FLUSH PRIVILEGES;
```

3. Blank page after login <br/>

Make sure PHP extensions such as `php-mbstring` and `php-xml` are installed.

## Conclusion
By following the guide above, you have now **successfully installed phpMyAdmin using the LAMP Stack on AlmaLinux 8**. phpMyAdmin simplifies visual management of MySQL/MariaDB databases, eliminating the need for constant command-line access.

Q: Is phpMyAdmin safe to use on a production server? <br/>
A: Yes, it is safe if configured correctly. Make sure to use HTTPS, restrict access to specific IP addresses, and change the default URL to /phpMyAdmin to prevent it from being easily guessed.

Q: What if I forget my MariaDB root password? <br/>
A: Use the following command to reset it:
```
systemctl stop mariadb
mysqld_safe --skip-grant-tables &
mysql -u root
```
Then run:
```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password-new-2025';
FLUSH PRIVILEGES;
```
Restart MariaDB:
```
systemctl restart mariadb
```

Q: Can I use MySQL instead of MariaDB on AlmaLinux 8? <br/>
A: Yes. AlmaLinux uses MariaDB by default, but MySQL can still be installed from the official Oracle repositories or third-party repositories

Q: Is it necessary to grant write access to the `/usr/share/phpMyAdmin/` directory? <br/>
A: No. This directory should remain with owner `root` and read-only permissions for Apache. This keeps it safe from exploits.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
