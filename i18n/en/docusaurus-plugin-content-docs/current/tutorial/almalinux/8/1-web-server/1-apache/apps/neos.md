---
title: Complete Guide on How to Install Neos CMS using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Neos CMS using LAMP Stack on AlmaLinux 8
sidebar_label: Neos
---

**Neos CMS** is a modern PHP-based **Content Management System** that is flexible, fast, and supports complex content architectures. To get the best performance when using Neos, one of the most stable options is to run it on a LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP). In this guide, we will discuss in **depth** step by step **how to install Neos using a LAMP Stack on AlmaLinux 8** until it is ready to be used on a production server.

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

## Install Neos

Before installing the latest version of Neos 9, we'll first create a virtual host and database (to store Neos content, configuration, and structure). Run the following command to create a virtual host:
:::info
Make sure you use a valid domain (FQDN) and also that the DNS A record is directed or pointed according to the server IP used on the server.
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
    DocumentRoot /var/www/focusnic.biz.id/shopwareapp/public

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
mkdir -p /var/www/focusnic.biz.id/
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
create database neos_db;
create user 'neos_user'@'localhost' identified by 'jvJQsxPXWnAD2024';
grant all on neos_db.* to 'neos_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for Neos management such as installing dependencies and other requirements during development or production.
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
PHP version 8.4.10 (/usr/bin/php)
```

Download file Neos dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Neos dan membuat project dengan nama `neosapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id
composer create-project neos/neos-base-distribution neosapp
```
Here is the output if Neos installation is successful
```
    ....######          .######
    .....#######      ...######
    .......#######   ....######
    .........####### ....######
    ....#......#######...######
    ....##.......#######.######
    ....#####......############
    ....#####  ......##########
    ....#####    ......########
    ....#####      ......######
    .#######         ........

          Welcome to Neos.

Basic system requirements
All basic requirements are fullfilled.

Database
Please configure your database in the settings or use the command ./flow setup:database

Neos setup not complete.
You can rerun this command anytime via ./flow setup
```
Setup Neos database:
```
cp /var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml.example /var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml
nano /var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml
```
Then set the db, user, and password that were created previously:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml"
Neos:
  Flow:
    persistence:
      backendOptions:
        driver: 'pdo_mysql'  
        charset: 'utf8mb4'
        host: '127.0.0.1'
        user: 'neos_user'
        password: 'jvJQsxPXWnAD2024'
        dbname: 'neos_db'
```
Run the following command to migrate Neos db:
```
cd /var/www/focusnic.biz.id/neosapp
chmod +x flow
sudo -u apache ./flow setup:database
sudo -u apache ./flow doctrine:migrate
```
Here is an example of the output:
```
DB Driver (pdo_mysql): 
  [pdo_mysql] MySQL/MariaDB via PDO
  [mysqli   ] MySQL/MariaDB via mysqli
 > pdo_mysql
Host (127.0.0.1):     
Database (neos_db): 
Username (neos_user): 
Password (jvJQsxPXWnAD2024): 

Database neos_db was connected sucessfully.

Neos:
  Flow:
    persistence:
      backendOptions:
        driver: pdo_mysql
        host: 127.0.0.1
        dbname: neos_db
        user: neos_user
        password: jvJQsxPXWnAD2024

The new database settings were written to /var/www/focusnic.biz.id/neosapp/Configuration/Development/Settings.Database.yaml
```
Then create a Neos Administrator user:
```
cd /var/www/focusnic.biz.id/neosapp
sudo -u apache ./flow user:create --roles Administrator
```
Output example:
```
Please specify the required argument "username": admin
Please specify the required argument "password": fU0RgEKskA3ezAS1
Please specify the required argument "firstName": Focusnic
Please specify the required argument "lastName": Administrator
Created user "admin" and assigned the following role: Neos.Neos:Administrator.
```
Set image handler dan neos content repository:
```
sudo -u apache ./flow setup:imagehandler
sudo -u apache ./flow cr:setup --content-repository default
```
Then setup Neos with the following command:
```
cd /var/www/focusnic.biz.id/neosapp
sudo -u apache ./flow setup
sudo -u ./flow site:importall --package-key Neos.Demo
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/neosapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/neosapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```
Refresh cache Neos:
```
cd /var/www/focusnic.biz.id/neosapp
chmod +x flow
sudo -u apache ./flow flow:cache:warmup
sudo -u apache ./flow flow:doctrine:compileproxies
```

Access the Neos installation via a browser, for example: `http://focusnic.biz.id'. This is the default view of the Neos CMS.
![](/img/almalinux8-lamp-apps-neos1.jpg)<br/>
The Neos admin dashboard is displayed, accessible via `http://$DOMAIN/neos`. Use the username and password created above.
![](/img/almalinux8-lamp-apps-neos2.jpg)<br/>

## Troubleshooting

1. `Permission denied` error when running the `flow` command <br/>

**Cause:** The `./flow` command was run as the root user or a regular user, while the web server (Apache) was running as the apache user.

**Solution:**

Run the command using the Apache user:
```
cd /var/www/focusnic.biz.id/neosapp
sudo -u apache ./flow
```

2. Neos cannot connect to the database <br/>

**Cause:** The database configuration in the `Settings.yaml` file is incorrect or the database is not running.

**Solution:**

Make sure MariaDB/MySQL is running:
```
systemctl status mariadb
```

Check the configuration file `var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml`:
```
Neos:
  Flow:
    persistence:
      backendOptions:
        driver: 'pdo_mysql'
        host: 'localhost'
        dbname: 'neos_db'
        user: 'neos_user'
        password: 'jvJQsxPXWnAD2024'
        charset: 'utf8mb4'
```

3. Neos page displays error `500 Internal Server Error` <br/>

**Cause:** Usually due to missing PHP extensions or incorrect PHP configuration.

**Solution:**

Ensure all required PHP extensions are installed:
```
dnf install php-mbstring php-intl php-xml php-gd php-zip php-bcmath php-opcache -y
```
Restart Apache:
```
systemctl restart httpd
```

4. Cache not updated after configuration changes <br/>

The Neos cache is not cleared after changing the configuration file or database. Solution:
```
cd /var/www/focusnic.biz.id/neosapp
chmod +x flow
sudo -u apache ./flow flow:cache:flush
```

## Conclusion

Installing **Neos CMS 9 on AlmaLinux 8 with a LAMP Stack** requires adjusting the PHP version (minimum 8.2), installing all extensions, and configuring the database via the **Settings.yaml** file. Using the **sudo -u apache ./flow** command is crucial for maintaining consistent access rights between the web server and the CLI, thus avoiding file permission errors.

By following this guide carefully, you can run Neos CMS 9 with optimal performance and stability on your production server. For a faster, safer, and more optimized installation, **don't hesitate to choose Focusnic as your server and cloud VPS installation service provider**.

Q: Can Neos CMS 9 use MySQL 5.7? <br/>
A: Not recommended. The minimum recommended version is MariaDB 10.4 or MySQL 8.0.

Q: Where is the Neos database configuration file located? <br/>
A: The database configuration file is located at:
```
/var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml
```

Q: Why must I run the `flow` command with `sudo -u apache`?
A: Because the Apache web server runs with the `apache` user. Running flow with the root user will result in different file access rights, which can cause errors.

Q: Can Neos CMS 9 be installed without Composer? <br/>
A: No, Composer is required because Neos is based on modern PHP with dependency management.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
