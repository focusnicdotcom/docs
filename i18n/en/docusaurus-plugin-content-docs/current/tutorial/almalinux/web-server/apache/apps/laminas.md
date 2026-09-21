---
title: Complete Guide on How to Install PHP Framework Laminas/Zend Framework using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install PHP Framework Laminas/Zend Framework using LAMP Stack on AlmaLinux 8
sidebar_label: Laminas
---

In this guide, we'll thoroughly cover **how to install Laminas using the LAMP Stack on AlmaLinux 8**. This guide is designed to ensure anyone running the Laminas framework on an AlmaLinux-based server can follow the steps easily, quickly, and accurately. We'll first configure **Linux, Apache, MariaDB, and PHP (LAMP)**, then proceed to install Laminas and all its dependencies.

**Laminas** is an open-source, **component-based** PHP framework developed by the **Laminas Project** under the auspices of the **Linux Foundation**. Laminas was **officially released in 2020** as a rebranding and merger of:

- **Zend Framework**
- **Apigility**
- **Expressive (middleware-based framework)**

These three projects were combined and redeveloped into Laminas, with the aim of making it more **modular, modern, and PSR (PHP Standards Recommendations) compliant**.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the Laminas installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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
Enable the desired PHP module version. For example, for PHP 8.3, run the following command:
```
dnf module reset php -y
dnf module enable php:remi-8.3 -y
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

## Install Laminas

Before installing Laminas, we'll first create a virtual host and database (to store Laminas content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/laminasapp/public

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
create database laminas_db;
create user 'laminas_user'@'localhost' identified by 'd0h4ghIn9IotMLV7';
grant all on laminas_db.* to 'laminas_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for CodeIgniter management such as installing dependencies and other requirements during development or production.
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
PHP version 8.3.24 (/usr/bin/php)
```

Download the Laminas file and place it in the directory according to the virtualhost, we will download Laminas and create a project with the name `laminasapp` using composer:
```
cd /var/www/focusnic.biz.id/
composer create-project -s dev laminas/laminas-mvc-skeleton laminasapp
cd laminasapp
composer require laminas/laminas-db
```
Change some parameters in the following file for the database connection on Laminas:
```
/var/www/focusnic.biz.id/laminasapp/config/autoload/global.php
```
Match the previously created database information including db, username, and password:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/laminasapp/config/autoload/global.php"
return [
    'db' => [
        'driver'   => 'Pdo',
        'dsn'      => 'mysql:dbname=laminas_db;host=localhost;charset=utf8',
        'username' => 'laminas_user',
        'password' => 'd0h4ghIn9IotMLV7',
    ],
    'service_manager' => [
        'factories' => [
            Laminas\Db\Adapter\Adapter::class => Laminas\Db\Adapter\AdapterServiceFactory::class,
        ],
    ],
];
```
Adjust the permissions on the Laminas directory:
```
find /var/www/focusnic.biz.id/laminasapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/laminasapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the Laminas installation via a browser, for example: `http://focusnic.biz.id`. If the installation is successful, the default Laminas page will appear as follows.
![](/img/almalinux8-lamp-apps-laminas1.jpg)<br/>

## Troubleshooting

1. Blank Page or Error 500 <br/>

This could be caused by incorrect permissions or `mod_rewrite` being disabled. Solution:
```
find /var/www/focusnic.biz.id/laminasapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/laminasapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Allow `mod_rewrite` on virtualhost:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>
```

## Conclusion

Through this guide, we have successfully installed and configured the **Laminas MVC Framework** using the **LAMP Stack on AlmaLinux 8** in a complete and structured manner. Laminas empowers experienced developers to build large-scale applications with a modular architecture, although it requires more detailed manual setup than frameworks like Laravel.

We have covered:

- Installing Apache, MariaDB, and PHP 8.3
- Installing Composer and the Laminas MVC Framework
- Configuring the database connection according to the official documentation
- Adding modules and configuring the service manager
- Troubleshooting common errors


Q: Does Laminas have a built-in migration feature? <br/>
A: No. Laminas doesn't have a built-in migration system like Laravel. You can use external tools like Doctrine Migrations or Phinx if you want versioned database management.

Q: Is it mandatory to use an ORM like Doctrine in Laminas? <br/>
A: Not required. You can use Laminas\Db to access the database directly using SQL builder, or integrate an ORM like Doctrine if needed.

Q: Why doesn't the installation connect directly to the database? <br/>
A: Laminas is designed to be modular. You must add your own database configuration to the autoload file and register the Laminas\Db module in `modules.config.php`.

Q: Can you use SQLite, PostgreSQL, or SQL Server? <br/>
A: Yes. Laminas supports various database drivers through PDO. Simply change the dsn and ensure the appropriate PHP extension is installed.

Q: Is Laminas suitable for small startup applications? <br/>
A: Laminas is more suitable for enterprise applications and large projects that require high flexibility. For small startups, Laravel may be faster for initial development.

Q: How do I deploy Laminas to production? <br/>
A: Use a LAMP/LEMP server with PHP-FPM, optimize permissions, enable `OPcache` caching, and ensure `.htaccess` is working properly.

Q: Can Laminas only be installed using Composer? <br/>
A: Yes. Composer is the only official and recommended method for installing the Laminas Framework.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
