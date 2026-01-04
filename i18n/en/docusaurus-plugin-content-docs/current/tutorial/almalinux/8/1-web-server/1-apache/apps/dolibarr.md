---
title: Complete Guide on How to Install Dolibarr using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Dolibarr using LAMP Stack on AlmaLinux 8
sidebar_label: Dolibarr
---

In today's digital era, **Dolibarr ERP/CRM** has become one of the most widely used open-source software solutions by small to medium-sized companies to manage their businesses. By combining **Enterprise Resource Planning (ERP)** and **Customer Relationship Management (CRM)** in one platform, Dolibarr simplifies data, finances, customers, inventory, and projects.

In this guide, we'll cover in detail **how to install Dolibarr using the LAMP Stack on AlmaLinux 8**. This complete guide covers everything from server preparation, component installation, database configuration, and the final step of running Dolibarr in a web browser.

If you want optimal results without the hassle of managing your own installation, don't hesitate to contact **Focusnic**, a professional provider of **server installation services** and **cloud VPS** solutions ready to assist you with your needs.

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

## Install Dolibarr

Before installing Dolibarr, we'll first create a virtual host and database (to store Dolibarr's content, configuration, and structure). Run the following command to create a virtual host:
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
create database dolibarr_db;
create user 'dolibarr_user'@'localhost' identified by 'yjLmBXOWDcOZFHh4';
grant all on dolibarr_db.* to 'dolibarr_user'@'localhost';
flush privileges;
quit;
```

Download the Dolibarr file and place it in the appropriate directory of the virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://github.com/Dolibarr/dolibarr/archive/refs/tags/21.0.3.zip
unzip 21.0.3.zip
mv dolibarr-21.0.3/htdocs/* /var/www/focusnic.biz.id/public_html
mv dolibarr-21.0.3/scripts /var/www/focusnic.biz.id
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the Dolibarr installation in the browser by typing the domain name or IP.
![](/img/almalinux8-lamp-apps-dolibarr1.png) <br/>
Dolibarr will perform a system check before continuing the installation, make sure it is fulfilled.
![](/img/almalinux8-lamp-apps-dolibarr2.png) <br/>
Then setup the Dolibarr installation directory, URL, and also the database.
![](/img/almalinux8-lamp-apps-dolibarr3.png) <br/>
Install Dolibarr
![](/img/almalinux8-lamp-apps-dolibarr4.png) <br/>
Create an admin user for Dolibarr
![](/img/almalinux8-lamp-apps-dolibarr5.png) <br/>
Access the Dolibarr admin page via `http://$DOMAIN/admin/`
![](/img/almalinux8-lamp-apps-dolibarr6.png) <br/>

## Troubleshooting

1. Dolibarr Page is Blank or Error 500 <br/>

The PHP module is incomplete or the file permissions are incorrect. Ensure all PHP extensions, such as `php-mysqlnd`, `php-mbstring`, `php-xml`, and `php-intl`, are installed. Then, run the following command to adjust the permissions:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Database Connection Failed <br/>

The username, password, or database name is incorrect. Then grant the appropriate privileges:
```
mariadb
grant all on dolibarr_db.* to 'dolibarr_user'@'localhost';
```
Login to the database to test the user that has been created:
```
mariadb -u dolibarr_user -p
```

## Conclusion

Through this guide, we have successfully covered in detail **how to install Dolibarr using the LAMP Stack on AlmaLinux 8**. This includes server preparation, installation of Apache, MariaDB, and PHP, and Dolibarr configuration via the web interface. With the right steps, Dolibarr can be an efficient, cost-effective, and flexible ERP/CRM solution for your business. However, server management requires special attention in terms of security, performance optimization, and long-term maintenance.

If you want a hassle-free installation and full support in managing your business server, **Focusnic** is your trusted partner, providing professional **server installation services** and **cloud VPS services**.

Q: Is Dolibarr free to use? <br/>
A: Yes, Dolibarr is open-source and free to use. You just need to set up a server to run it.


Q: What's the difference between MariaDB and MySQL in a Dolibarr installation? <br/>
A: MariaDB is a compatible fork of MySQL and is more commonly used on modern servers. Dolibarr supports both, but MariaDB is recommended for AlmaLinux 8.

Q: Can Dolibarr run over HTTPS/SSL? <br/>
A: Yes, Dolibarr is highly recommended to run over HTTPS. You can use Let's Encrypt for a free SSL certificate.


Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
