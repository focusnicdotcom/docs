---
title: Complete Guide on How to Install PHP Framework CakePHP using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install PHP Framework CakePHP using LAMP Stack on AlmaLinux 8
sidebar_label: CakePHP
---

CakePHP is one of the most popular **PHP frameworks**, enabling fast, efficient, and structured web application development. In this guide, we'll cover **how to install CakePHP on AlmaLinux 8 using the LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP)** in depth. All steps are clearly explained to ensure you can build a stable and optimized development environment.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the CakePHP installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install CakePHP

Before installing the latest CakePHP version 5, we'll first create a virtual host and database (to store CakePHP content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/cakephpapp/webroot

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
create database cakephp_db;
create user 'cakephp_user'@'localhost' identified by 'VrwaQghBw1EFQ6d8';
grant all on cakephp_db.* to 'cakephp_user'@'localhost';
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
PHP version 8.4.10 (/usr/bin/php)
```

Download the CakePHP file and place it in the directory according to the virtualhost, we will download CakePHP and create a project with the name `cakephpapp` using composer:
```
cd /var/www/focusnic.biz.id/
composer create-project --prefer-dist cakephp/app:5 cakephpapp
```
Change some parameters in the following file for the database connection in CakePHP:
```
nano /var/www/focusnic.biz.id/cakephpapp/config/app_local.php
```
Match the previously created database information including db, username, and password:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/cakephpapp/config/app_local.php"
    'Datasources' => [
        'default' => [
            'host' => 'localhost',
            /*
             * CakePHP will use the default DB port based on the driver selected
             * MySQL on MAMP uses port 8889, MAMP users will want to uncomment
             * the following line and set the port accordingly
             */
            //'port' => 'non_standard_port_number',

            'username' => 'cakephp_user',
            'password' => 'VrwaQghBw1EFQ6d8',

            'database' => 'cakephp_db',
            /*
```
Then populate DB or migrate with the following command:
```
cd /var/www/focusnic.biz.id/cakephpapp/
sudo -u apache bin/cake migrations migrate
```
Adjust the permissions on the CakePHP directory:
```
find /var/www/focusnic.biz.id/cakephpapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/cakephpapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the CakePHP installation through a browser, for example: `http://focusnic.biz.id`. If the installation is successful, the default CakePHP page will appear as follows.
![](/img/almalinux8-lamp-apps-cakephp1.jpg)<br/>

## Troubleshooting

1. Permission Denied Error When Running Migration <br/>

Make sure the logs directory is owned by the apache user:
```
chown -R apache:apache /var/www/focusnic.biz.id/cakephpapp/logs
chmod -R 755 /var/www/focusnic.biz.id/cakephpapp/logs
```

2. Error: No such file or directory in schema-dump-default.lock when running migrations.

Create the Migrations directory manually:
```
mkdir -p /var/www/focusnic.biz.id/cakephpapp/config/Migrations
chown -R apache:apache /var/www/focusnic.biz.id/cakephpapp/config/Migrations
chmod -R 755 /var/www/focusnic.biz.id/cakephpapp/config/Migrations
```

3. Blank Web Page or Internal Server Error <br/>

- Check the Apache error log:
```
tail -f /var/log/httpd/focusnic.biz.id-error.log
```
- Check the permissions of the `webroot/` directory
- Ensure `.htaccess` is enabled and `mod_rewrite` is available

4. CakePHP Not Connecting to the Database <br/>

- Check the configuration in `config/app_local.php`
- Check if MariaDB is enabled:
```
systemctl status mariadb
```
- Try a manual connection to the database using the `mysql` CLI

## Conclusion

Installing **CakePHP version 5** using the **LAMP Stack on AlmaLinux 8** requires special attention to:

- A compatible PHP version (**PHP 8.1 and above**)
- CakePHP's latest directory structure, namely the webroot
- File/directory permission settings for optimal application performance
- Using Composer and configuring app_local.php for the database

By following this guide, you should have a stable **CakePHP development environment ready for deployment**. If you'd like to speed up the process of professionally setting up your server or PHP-based application, **don't hesitate to contact Focusnic—a provider of server installation and cloud VPS services ready to assist you quickly and efficiently.**

Q: Does CakePHP 5 still use .env files? <br/>
A: Not by default. CakePHP 5 prioritizes the configuration in `config/app_local.php`. However, you can still use `.env` if you install `vlucas/phpdotenv`.

Q: What is the minimum PHP version for CakePHP 5? <br/>
A: PHP 8.1 is the minimum supported version.

Q: Can I use MySQL instead of MariaDB? <br/>
A: Yes. CakePHP 5 is compatible with both MySQL and MariaDB. However, in AlmaLinux 8, MariaDB is recommended because it's available directly in the official repository.

Q: What if I want to deploy to a cloud VPS? <br/>
A: It's highly recommended to use a stable cloud provider. For professional, production-ready configurations, don't hesitate to use services from Focusnic — experts in server installation and cloud VPS services.

Q: Is Composer always required? <br/>
A: Yes, because CakePHP 5 relies on Composer to manage framework and plugin dependencies.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
