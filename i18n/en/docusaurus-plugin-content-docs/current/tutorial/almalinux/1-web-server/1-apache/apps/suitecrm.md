---
title: Complete Guide on How to Install SuiteCRM using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install SuiteCRM using LAMP Stack on AlmaLinux 8
sidebar_label: SuiteCRM
---

SuiteCRM is a popular open-source **Customer Relationship Management (CRM)** platform due to its flexibility and comprehensive features. Using **SuiteCRM**, companies can manage customer data, automate sales, marketing campaigns, and provide customer service more efficiently. This article will detail how to **install SuiteCRM on AlmaLinux 8 using the LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP)**.

By following this guide, you can build a stable, secure, and ready-to-use CRM server for your business needs.

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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap php-ldap
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

## Install SuiteCRM

Before installing SuiteCRM, we will first create a virtual host and database (to store SuiteCRM content, configuration, and structure). Run the following command to create a virtual host:
:::info
Make sure you are using a valid domain (FQDN) and that the DNS A record is pointed to the server IP address used on the server.
:::

```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Fill in the following parameters:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/suitecrmapp/public

    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Then create a directory on the virtualhost above:
```
mkdir -p /var/www/focusnic.biz.id/suitecrmapp
```

Restart Apache to save changes:
```
apachectl configtest
systemctl restart httpd
```

Change the `memory_limit` and `upload_max_filesize` configuration in PHP.ini:
```
nano /etc/php.ini
```
Adjust according to the following parameters:
```jsx showLineNumbers title="/etc/php.ini"
upload_max_filesize = 20M
memory_limit = 256M
```
Then restart `php-fpm` to save the changes with the following command:
```
systemctl restar php-fpm
```
Create a database by running the following command:
```
mariadb
```
Then run the following command to create a database, user, and password:
```
create database suitecrm_db;
create user 'suitecrm_user'@'localhost' identified by 'cTcJMQUff5jANn46';
grant all on suitecrm_db.* to 'suitecrm_user'@'localhost';
flush privileges;
quit;
```

Download the SuiteCRM file and place it in the appropriate virtualhost directory:
```
cd /var/www/focusnic.biz.id/suitecrmapp
wget https://github.com/SuiteCRM/SuiteCRM-Core/releases/download/v8.8.1/SuiteCRM-8.8.1.zip
unzip SuiteCRM-8.8.1.zip
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/suitecrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/suitecrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Set up SuiteCRM via `http://$DOMAIN`. SuiteCRM will perform server-side checks before installation. Ensure PHP, Server, and Permissions are **checked**.
![](/img/almalinux8-lamp-apps-suitecrm1.jpg)<br/>
Create a user for SuiteCRM administration, and also the previously created database connection.
![](/img/almalinux8-lamp-apps-suitecrm2.png)<br/>
Here's a look at the SuiteCRM dashboard. Please access it via `http://$DOMAIN/#/Login` 
![](/img/almalinux8-lamp-apps-suitecrm3.png)<br/>

## Troubleshooting

1. Error 500 Internal Server SuiteCRM<br/>

The SuiteCRM directory permissions are incorrect or the Apache module is not enabled. Run the following command to correct the permissions:
```
find /var/www/focusnic.biz.id/suitecrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/suitecrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. SuiteCRM is slow to access <br/>

OPcache is not enabled or server resources are limited. Enable OPcache in the `/etc/php.d/10-opcache.ini` file and increase server resources (RAM/CPU).

3. SuiteCRM Email Not Working <br/>

Make sure the SMTP settings in Admin > Email Settings match your email server.

## Conclusion

Installing **SuiteCRM on AlmaLinux 8 using the LAMP Stack** is the best solution for companies requiring a full-featured, flexible, and cost-effective open source CRM system. With the right configuration of **Apache, MariaDB, and PHP**, the SuiteCRM system can run smoothly and is ready to support daily business needs.

Q: What is SuiteCRM? <br/>
A: SuiteCRM is an open-source Customer Relationship Management (CRM) software that can be used to manage customers, sales, marketing, and after-sales service.

Q: Is SuiteCRM free to use? <br/>
A: Yes, SuiteCRM is open source and free to use. However, there are also paid support options if your company requires official support.

Q: Can SuiteCRM be integrated with email? <br/>
A: Yes. SuiteCRM supports integration with SMTP servers such as Gmail, Microsoft Exchange, or corporate email servers.

Q: Can I use Nginx instead of Apache? <br/>
A: Yes, but the default SuiteCRM installation is easier using Apache. If you want to use Nginx, you'll need to adjust the configuration.

Q: Can SuiteCRM run on a small VPS (1 GB RAM)? <br/>
A: Yes, but performance will be limited. It's recommended to use at least 2 GB of RAM or more for SuiteCRM to run smoothly.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
