---
title: Complete Guide on How to Install phpIPAM using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install phpIPAM using LAMP Stack on AlmaLinux 8
sidebar_label: phpIPAM
---

IP address management (IPM) is a crucial aspect of modern network infrastructure. As enterprise networks expand, the need for effective IP address management becomes increasingly urgent. **phpIPAM** is a web-based, open-source solution for managing, monitoring, and documenting IP address usage. This guide will cover in detail **how to install phpIPAM using the LAMP Stack on AlmaLinux 8**, providing detailed steps to build a stable and reliable IP address management system.

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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap php-ldap php-pear php-gmp
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

## Install phpIPAM

Before installing phpIPAM, we'll first create a virtual host and database (to store phpIPAM content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/public_html

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
mkdir -p /var/www/focusnic.biz.id/public_html
```

Restart Apache to save changes:
```
apachectl configtest
systemctl restart httpd
```

Change the `php.ini` configuration with the following command:
```
nano /etc/php.ini
```
Adjust according to the following parameters:
```jsx showLineNumbers title="/etc/php.ini"
max_execution_time = 180
max_input_time = 180
memory_limit = 256M
post_max_size = 50M
upload_max_filesize = 50M
```
Then restart `php-fpm` to save the changes with the following command:
```
systemctl restart php-fpm
```
Create a database by running the following command:
```
mariadb
```

Then run the following command to create a database, user, and password:
```
create database phpipam_db;
create user 'phpipam_user'@'localhost' identified by '7v7NbpaM03m69F48';
grant all on phpipam_db.* to 'phpipam_user'@'localhost';
flush privileges;
quit;
```

Download the phpIPAM file and place it in the appropriate directory of the virtual host:
```
cd /var/www/focusnic.biz.id/public_html
git clone https://github.com/phpipam/phpipam.git .
```
phpIPAM database configuration:
```
cd /var/www/focusnic.biz.id/public_html
cp config.dist.php config.php
nano config.php
```
Adjust the configuration to the database that has been created:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/config.php"
 * database connection details
 ******************************/
$db['host'] = '127.0.0.1';
$db['user'] = 'phpipam_user';
$db['pass'] = '7v7NbpaM03m69F48';
$db['name'] = 'phpipam_db';
$db['port'] = 3306;
```
Then run the following command to import the database:
```
cd /var/www/focusnic.biz.id/public_html
mariadb phpipam_db < db/SCHEMA.sql 
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access phpIPAM through a browser by typing the domain name or IP address. Enter the default user name `admin` and the password `ipamadmin`. Then, after logging in, set a new password.
![](/img/almalinux8-lamp-apps-phpipam1.png) <br/>
Here is the phpIPAM dashboard view
![](/img/almalinux8-lamp-apps-phpipam2.png) <br/>

## Troubleshooting

1. Unsupported PHP version! Detected PHP version: 8.4.12 >= 8.4 <br/>

Please add the following parameters to `config.php`

```
$allow_untested_php_versions=true;
```

2. Error 500 Internal Server Error <br/>

Check the phpIPAM file permissions in `/var/www/focusnic.biz.id/public_html` and make sure the `config.php` configuration file is correct:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

3. Database Connection Error <br/>

Check username, password, and db name in `config.php`.

4. phpIPAM Blank Page <br/>

Enable `display_errors = On` in `php.ini` and make sure all PHP extensions are installed.

## Conclusion

By following the steps above, we have successfully built **phpIPAM using the LAMP Stack on AlmaLinux 8**. From the installation of Apache, MariaDB, and PHP to the configuration of phpIPAM, everything is well integrated. This application will greatly assist in more structured and efficient **IP address management**, especially on large-scale networks.

For those who want a reliable IP management system but don't want the hassle of installation and configuration, **don't hesitate to use Focusnic's services**, which are ready to help provide high-performance **cloud VPS and server installation services**.

Q: What is phpIPAM? <br/>
A: phpIPAM is an open-source, web-based application for IP address management, supporting subnetting, VLANs, VRFs, and integration with DHCP and DNS.

Q: Is phpIPAM free to use? <br/>
A: Yes, phpIPAM is open-source and free to use. However, it still requires a server with adequate resources to run smoothly.

Q: Can phpIPAM run on anything other than a LAMP stack? <br/>
A: Yes. phpIPAM also supports Nginx and other databases like MySQL or Percona. However, the LAMP stack is more common due to its stability and comprehensive documentation.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
