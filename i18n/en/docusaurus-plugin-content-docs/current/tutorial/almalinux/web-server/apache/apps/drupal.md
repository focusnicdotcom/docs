---
title: Complete Guide on How to Install Drupal using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Drupal using LAMP Stack on AlmaLinux 8
sidebar_label: Drupal
---

Drupal is one of the world's most popular **Content Management Systems (CMS)** and is widely used to build small to large-scale websites, including government portals, news media, and large community sites. In this guide, we will cover in detail **how to install Drupal using the LAMP Stack (Linux, Apache, MariaDB, and PHP)** on **AlmaLinux 8**, an enterprise-grade operating system that serves as an alternative to CentOS.

If you're looking for a practical and professional guide to **installing Drupal on an AlmaLinux server**, this guide is the right reference. Follow these steps to ensure a flawless installation and that Drupal is ready to use.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the installation process, ensure that your AlmaLinux 8 server is updated to the latest version. Use the following command to ensure the system is using the latest packages:
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

## Install Drupal

Before installing the latest Drupal version 11, we'll first create a virtual host and database (to store Drupal content, configuration, and structure). Run the following command to create a virtual host:

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
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <Directory /var/www/focusnic.biz.id/public_html>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Then create a directory on the virtualhost above:
```
mkdir -p /var/www/focusnic.biz.id/public_html
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
create database drupal_db;
create user 'drupal_user'@'localhost' identified by 'nrbL5B2HDEqPpnro';
grant all on drupal_db.* to 'drupal_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for Drupal management such as installing dependencies and other requirements during development or production.
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
Download the Drupal files and place them in the appropriate directory on the virtual host:
```
cd /var/www/focusnic.biz.id/public_html
wget https://www.drupal.org/download-latest/tar.gz -O drupal.tar.gz
tar -xf drupal.tar.gz 
mv drupal-11.2.2/* .
```
To enable clean URLs, Drupal uses `.htaccess`. Make sure `mod_rewrite` is enabled by default on the virtual host. If `.htaccess` isn't in the directory, copy it using the following command:
```
cd /var/www/focusnic.biz.id/public_html
cp drupal-11.2.2/.htaccess .
```
Adjust permissions:
```
cd /var/www/focusnic.biz.id/public_html
find . -type d -exec chmod u=rwx,g=rx,o= '{}' \;
find . -type f -exec chmod u=rw,g=r,o= '{}' \;
chown -R apache:apache /var/www/focusnic.biz.id
```
Access the Drupal installation via a browser, for example: `http://focusnic.biz.id` then select the language and click "Save and continue"
![](/img/almalinux8-lamp-apps-drupal1.jpg)<br/>
Select the Drupal profile and click "Save and continue"
![](/img/almalinux8-lamp-apps-drupal2.jpg)<br/>
Then set the MySQL database with the db name, user, and password that you created previously, continue by clicking "Save and continue"
![](/img/almalinux8-lamp-apps-drupal3.jpg)<br/>
Wait for the installation process to complete
![](/img/almalinux8-lamp-apps-drupal4.jpg)<br/>
Drupal admin configuration, if it is correct, please click "Save and continue"
![](/img/almalinux8-lamp-apps-drupal5.jpg)<br/>
Here's what the Drupal installation looks like. To access the Drupal administrator dashboard, go to `http://$DOMAIN/admin`.
![](/img/almalinux8-lamp-apps-drupal6.jpg)<br/>

## Troubleshooting

1. Error: Cannot connect to the database <br/>

**Cause:**

- The database name, user, or password is incorrect.
- MariaDB is not running.
- The database user has not been granted access rights.

**Solution:**

Ensure MariaDB is active with the following command:
```
systemctl status mariadb
```
Manual connection test to database:
```
mariadb -u drupal_user -p
```

2. 403 Forbidden or 500 Internal Server Error <br/>

**Cause:**

- Incorrect directory or file permissions.
- `.htaccess` cannot be read because `AllowOverride` has not been set.
- The `mod_rewrite` module is not enabled.

**Solution:**

Ensure the files and folders belong to the apache user:
```
chown -R apache:apache /var/www/focusnic.biz.id.id
```

Edit VirtualHost configuration:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<Directory /var/www/focusnic.biz.id/public_html>
    AllowOverride All
</Directory>
```

3. White Screen of Death <br/>

**Cause:**

- Problem with an uninstalled PHP module or extension.
- PHP errors are hidden.

**Solution:**

Enable PHP error logging:
```
nano /etc/php.ini
```
Change the following parameters:
```
display_errors = On
error_reporting = E_ALL
```
Restart php-fpm and check the log on the web server:
```
systemctl restart php-fpm
tail -f /var/log/httpd/focusnic.biz.id-error.log
```

4. Failed to Access Drupal from Domain <br/>

**Cause:**

- The domain name is not pointed to the server IP.
- The VirtualHost has not been configured.

**Solution:**

- Add an A record in your DNS that points to the server IP.
- Make sure the ServerName on the VirtualHost matches your domain.
- Or use the `hosts` file on the client

## Conclusion

Installing Drupal using the **LAMP Stack on AlmaLinux 8** provides a stable and efficient solution for building professional websites. By combining **Apache as a web server, MariaDB as a database, and PHP as an application interpreter**, we create a strong foundation for managing content through the Drupal platform. The entire process starts with **system updates, LAMP installation, database configuration, Apache virtual host setup, and Drupal installation and configuration**. These steps give you full control over running a highly flexible and secure CMS suitable for both large and small web projects.

If you want a fast, error-free **installation that's ready for immediate production**, **don't hesitate to use Focusnic's server or cloud VPS installation services**. Our team is ready to assist you from initial setup to server performance optimization.

Q: Can I use a PHP version other than 8.1? <br/>
A: Yes. Drupal supports several PHP versions, but it is recommended to use the latest stable version (PHP 8.1 or 8.2). Check the PHP requirements on the official Drupal website.
https://www.drupal.org/docs/getting-started/system-requirements/php-requirements

Q: Do I have to use MariaDB? <br/>
A: Not necessarily. You can use MySQL or PostgreSQL, but MariaDB is more commonly used in distributions like AlmaLinux.

Q: Is Composer mandatory for Drupal? <br/>
A: Composer is highly recommended, especially for large and complex projects, as it helps manage dependencies, themes, and modules. However, for a basic installation, you can still manage it.

Q: Can I use a control panel like aaPanel or CyberPanel? <br/>
A: Yes, but it's not recommended for advanced users who want full control. This tutorial focuses on manual setup for maximum security and flexibility.

Q: What are the minimum server resources for Drupal? <br/>
A: For development or testing, 2GB of RAM and 1 CPU core are sufficient. For production, a minimum of 4GB of RAM is recommended.

Q: Can I use Nginx instead of Apache? <br/>
A: Yes, but the configuration is slightly different. This guide uses Apache because it is more common in the LAMP stack.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
