---
title: Complete Guide on How to Install Nextcloud using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Nextcloud using LAMP Stack on AlmaLinux 8
sidebar_label: Nextcloud
---

**Nextcloud** is a **cloud storage** solution that allows you to store, manage, and share data independently without relying on third-party services. Using the **LAMP Stack** (Linux, Apache, MariaDB/MySQL, PHP) on **AlmaLinux 8**, we can build a secure, stable, and customizable **private cloud** platform that meets both business and personal needs.

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

## Install Nextcloud

Before installing Nextcloud, we'll first create a virtual host and database (to store Nextcloud content, configuration, and structure). Run the following command to create a virtual host:
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

    <Directory /var/www/focusnic.biz.id/public_html>
        AllowOverride All
        Require all granted

    <IfModule mod_dav.c>
      Dav off
    </IfModule>

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
create database nextcloud_db;
create user 'nextcloud_user'@'localhost' identified by 'mjAVU3Jv9hTCQsg3';
grant all on nextcloud_db.* to 'nextcloud_user'@'localhost';
flush privileges;
quit;
```

Download the Nextcloud file and place it in the appropriate directory of the virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://download.nextcloud.com/server/releases/latest.zip
unzip latest.zip
mv nextcloud/* .
mv nextcloud/.htaccess .
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup Nextcloud via `http://$DOMAIN`. Create a user for Nextcloud administration, and also a connection to the database that was created previously.

:::info
To increase the security level of your Nextcloud installation, it is highly recommended to store the `data` directory in a separate location from `public_html`. This way, you can protect sensitive data from unauthorized access via the web.
:::

![](/img/almalinux8-lamp-apps-nextcloud1.jpg)<br/>
Continue the installation by installing Recommended Apps
![](/img/almalinux8-lamp-apps-nextcloud2.jpg)<br/>
Here is a view of the Nextcloud admin dashboard
![](/img/almalinux8-lamp-apps-nextcloud3.jpg)<br/>

## Troubleshooting

1. Error 500 Internal Server Error <br/>

This is usually caused by incorrect file permissions or an uninstalled PHP module. Solution:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
dnf install php-mbstring php-gd php-intl php-xml -y
systectl restart httpd
```

2. Cannot Upload Files Larger than 2MB <br/>

PHP's default settings limit the upload size. The solution is to change the `php.ini` value:
```
nano /etc/php.ini
```
Look for the `upload_max_filesize` and `post_max_size` parameters and then adjust them to the following values or adjust them to your needs:
```
upload_max_filesize = 1G
post_max_size = 1G
```
Restart php-fpm to save changes:
```
systemctl restart php-fpm
```

3. Cron Job Not Running <br/>

Cron has not been configured or the Apache user does not have access rights. Run the following command:
```
sudo crontab -u apache -e
```
Add the following parameters:
```
*/5 * * * * php -f /var/www/focusnic.biz.id/public_html/cron.php
```

## Conclusion

This guide details **how to install Nextcloud using the LAMP Stack on AlmaLinux 8**, from server setup to installing Apache, MariaDB, and PHP. With the correct configuration, **Nextcloud** can be a secure, stable, and reliable **private cloud** solution. The main advantages of using LAMP on AlmaLinux are stability, security, and long-term support.

Q: Is Nextcloud free to use? <br/>
A: Yes, Nextcloud is open-source software and can be used for free. However, there are also paid services with enterprise support.

Q: Is Nextcloud accessible on Android/iOS? <br/>
A: Yes, there is an official Nextcloud app on the Google Play Store and Apple App Store for easy data syncing.

Q: Can Nextcloud use HTTPS? <br/>
A: Yes, and it's highly recommended. Use Certbot to get a free SSL certificate from Let's Encrypt.

Q: How do I back up Nextcloud data? <br/>
A: Backups can be done by archiving the Nextcloud installation folder `/var/www/focusnic.biz.id/` and dumping the MariaDB database using `mysqldump`.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
