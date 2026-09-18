---
title: Complete Guide on How to Install PHP Framework Yii using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install PHP Framework Yii using LAMP Stack on AlmaLinux 8
sidebar_label: Yii
---

The **Yii PHP** framework is one of the best and fastest frameworks widely used to build modern web applications. To run Yii optimally, we need a reliable server environment such as the LAMP Stack (Linux, Apache, MySQL/MariaDB, and PHP). In this guide, we will discuss in **depth and structured** about **how to install the Yii PHP framework using the LAMP Stack on AlmaLinux 8**, starting from basic system installation to testing the Yii application running successfully.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the Yii installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath
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

## Install Yii

Before installing Yii, we'll first create a virtual host and database (to store Yii's content, configuration, and structure). Run the following command to create a virtual host:
:::info
Make sure you're using a valid domain (FQDN) and that the DNS A record is pointed to the server IP address used on your server.
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
    DocumentRoot /var/www/focusnic.biz.id/yiiapp/web

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
mkdir -p /var/www/focusnic.biz.id
```

Restart Apache to save changes:
```
apachectl configtest
systemctl restart httpd
```

Create a database by running the following command:
```
mariadb
```

Then run the following command to create a database, user, and password:
```
create database yii_db;
create user 'yii_user'@'localhost' identified by 'beTeOBAzd7bdY0H0';
grant all on yii_db.* to 'yii_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for Yii management such as installing dependencies and other requirements during development or production.
:::

```
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```
Check composer version:
```
composer --version
```
Output example:
```
Composer version 2.8.10 2025-07-10 19:08:33
PHP version 8.4.11 (/usr/bin/php)
```

Download the Yii file and place it in the appropriate directory on your virtual host. We'll download Yii and create a project named `yiiapp` using composer:
:::info
Yii has two application templates. The main difference is the advanced template, which comes with more front-end and back-end features, user registration, and password restore/reset.
:::

```
cd /var/www/focusnic.biz.id/
composer create-project --prefer-dist --stability=stable yiisoft/yii2-app-basic yiiapp # yii basic
composer create-project --prefer-dist --stability=stable yiisoft/yii2-app-advanced yiiapp # yii advanced
```
Change some parameters in the following file for database connection in Yii:
```
nano /var/www/focusnic.biz.id/yiiapp/config/db.php
```
Match the previously created database information including db, username, and password:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/yiiapp/config/db.php"
<?php

return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=localhost;dbname=yii_db',
    'username' => 'yii_user',
    'password' => 'beTeOBAzd7bdY0H0',
    'charset' => 'utf8',
];
```
Run the following command to populate or db migrate:
```
cd /var/www/focusnic.biz.id/yiiapp
php yii migrate
```
If the configuration is successful, and the database is empty (without migration), the following message will appear:
```
Creating migration history table "migration"...Done.
No new migrations found. Your system is up-to-date.
```
Adjust permissions on the Yii directory:
```
find /var/www/focusnic.biz.id/yiiapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/yiiapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the Yii installation through a browser, for example: `http://focusnic.biz.id`. If the installation is successful, the default Yii page will appear as follows.
![](/img/almalinux8-lamp-apps-yii1.jpg)<br/>

## Troubleshooting

1. Error: SQLSTATE[HY000] [1045] Access denied for user <br/>

**Cause:** The username or password is incorrect, or the user has not been granted access to the database.

**Solution:** Double-check the configuration in config/db.php. Ensure the username, password, and database name are correct. Rerun the following command:
```
GRANT ALL PRIVILEGES ON yii_db.* TO 'yii_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Error: Could not find driver when running `php yii migrate` <br/>

This is usually caused by the `pdo_mysql` module not being installed correctly. Run the following command to install it:
```
dnf install php-mysqlnd
```

3. Error: yii\db\Exception or blank page when accessing from a browser <br/>

Database connection issue or DSN typo. Ensure the DSN is formatted correctly:
```
mysql:host=localhost;dbname=yiidb
```

## Conclusion

Installing the **Yii PHP framework on AlmaLinux 8 using the LAMP Stack** is not difficult if done correctly. With a properly configured combination of Apache, MariaDB, and PHP, Yii can run efficiently and optimally. It's also important to configure the environment and file permissions according to production security standards to prevent the application from being easily exploited.

Q: Can Yii run on shared hosting? <br/>
A: Yes, but certain features like Redis, queues, or advanced URL rewriting may be limited by the hosting provider.

Q: What is the difference between Yii basic and advanced? <br/>
A: The basic version is suitable for simple applications, while the advanced version has a modular structure for large projects.

Q: How do I know the database connection is successful? <br/>
A: Run the following command. If no errors appear, the connection is successful:
```
php yii migrate
```

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
