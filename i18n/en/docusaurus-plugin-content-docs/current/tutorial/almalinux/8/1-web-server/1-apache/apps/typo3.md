---
title: Complete Guide on How to Install TYPO3 CMS using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install TYPO3 CMS using LAMP Stack on AlmaLinux 8
sidebar_label: TYPO3
---

**TYPO3** is a PHP-based **Content Management System (CMS)** widely used for building professional websites, corporate portals, and large-scale content management systems. The combination of **TYPO3** with the **LAMP Stack** (Linux, Apache, MySQL/MariaDB, PHP) in **AlmaLinux 8** offers optimal stability, performance, and security. This guide will cover the **step-by-step** installation of TYPO3 with the correct configuration to ensure optimal website performance.

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

## Install TYPO3

Before installing TYPO3, we'll first create a virtual host and database (to store TYPO3 content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/typo3app/public

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
create database typo3_db;
create user 'typo3_user'@'localhost' identified by 'BcBDAg8S8EsAMbk5';
grant all on typo3_db.* to 'typo3_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for TYPO3 management such as installing dependencies and other requirements during development or production.
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
Download the TYPO3 file and place it in the directory according to the virtualhost, we will download TYPO3 and create a project with the name `typo3app` using composer:
```
cd /var/www/focusnic.biz.id
composer create-project "typo3/cms-base-distribution:^13.4" typo3app
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/typo3app -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/typo3app -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
chmod -R +x  /var/www/focusnic.biz.id/typo3app/vendor/bin/
```

Then run the following command to setup TYPO3:
```
sudo -u apache /var/www/focusnic.biz.id/typo3app/vendor/bin/typo3 setup
```

Here's an example of TYPO3 instruction output:

:::info
The TYPO3 installer will automatically hide the password instruction.
:::

```
Which web server is used?
  [apache] Apache
  [iis   ] Microsoft IIS
  [other ] Other (use for anything else)
 > apache
Configuration already exists do you want to overwrite it [default: no] ? yes
Database driver?
  [mysqli        ] [MySQLi] Manually configured MySQL TCP/IP connection
  [mysqliSocket  ] [MySQLi] Manually configured MySQL socket connection
  [pdoMysql      ] [PDO] Manually configured MySQL TCP/IP connection
  [pdoMysqlSocket] [PDO] Manually configured MySQL socket connection
  [postgres      ] Manually configured PostgreSQL connection
  [sqlite        ] Manually configured SQLite connection
 > mysqli
Enter the database "username" [default: db] ? typo3_user
Enter the database "password" ? 
Enter the database "port" [default: 3306] ? [ENTER]
Enter the database "host" [default: db] ? localhost
Select which database to use: 
  [typo3_db] typo3_db (Tables 0 ✓)
 > typo3_db
Admin username (user will be "system maintainer") ? admin
Admin user and installer password ? 
Admin user email ? admin@focusnic.biz.id
Give your project a name [default: New TYPO3 Project] ? 
Create a basic site? Please enter a URL [default: no] 
✓ Congratulations - TYPO3 Setup is done.
```

The following is a screenshot of the TYPO3 admin dashboard, accessible via `http://$DOMAIN/typo3`. Use the username and password created above.
![](/img/almalinux8-lamp-apps-typo31.jpg)<br/>

## Troubleshooting

1. Error 500 Internal Server Error <br/>

Make sure all files and folders in `/var/www/focusnic.biz.id/typo3app` are owned by `apache:apache` and have permissions 755. Run the following command:
```
find /var/www/focusnic.biz.id/typo3app -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/typo3app -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
chmod -R +x  /var/www/focusnic.biz.id/typo3app/vendor/bin/
```

2. Database Connection Failed <br/>

Check the database information or repeat the installation wizard.

3. Slow Website Access <br/>

Enable Opcache in `php.ini` and increase the `memory_limit` and `max_execution_time` values.

## Conclusion

Using **TYPO3 with the LAMP Stack on AlmaLinux 8 i**s the right choice for building large-scale websites that require high stability, security, and flexibility. With a structured installation process, optimal PHP configuration, and correct permission settings, the system will run smoothly and securely.

Q: Can TYPO3 be installed on a shared hosting server? <br/>
A: Yes, but a VPS or dedicated server is recommended for more stable performance, especially for websites with high traffic.

Q: What PHP version is recommended for TYPO3? <br/>
A: The latest version of TYPO3 usually supports PHP 8.1 or later. Use the version that meets the official recommendations.

Q: How do I update TYPO3 to the latest version? <br/>
A: Updates can be done through Composer or by changing the source code and then running an update script in the TYPO3 backend.

Q: Is MariaDB better than MySQL for TYPO3? <br/>
A: Both are compatible, but MariaDB is usually faster and lighter on Linux.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
