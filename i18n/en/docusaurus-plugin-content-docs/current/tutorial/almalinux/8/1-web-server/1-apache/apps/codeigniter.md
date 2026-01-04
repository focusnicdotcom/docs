---
title: Complete Guide on How to Install PHP Framework CodeIgniter using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install PHP Framework CodeIgniter using LAMP Stack on AlmaLinux 8
sidebar_label: CodeIgniter
---

CodeIgniter is one of the most popular and powerful **PHP frameworks** widely used for building modern, fast, and secure web applications. In this guide, we'll thoroughly cover **how to install CodeIgniter using a LAMP (Linux, Apache, MySQL/MariaDB, PHP) stack on AlmaLinux 8**, a highly stable Red Hat Enterprise Linux (RHEL)-based Linux distribution suitable for production use.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the CodeIgniter installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install CodeIgniter

Before installing the latest version of CodeIgniter 4, we will first create a virtual host and database (to store CodeIgniter content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/ciapp/public

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
create database ci_db;
create user 'ci_user'@'localhost' identified by 'EkZx5OIslz59uTe4';
grant all on ci_db.* to 'ci_user'@'localhost';
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

Download the CodeIgniter file and place it in the directory according to the virtualhost, we will download CodeIgniter and create a project with the name `ciapp` using composer:
```
cd /var/www/focusnic.biz.id/
composer create-project codeigniter4/appstarter ciapp
cd ciapp
cp env .env
```
Change some parameters in the `.env` file for the database connection in CodeIgniter:
```
nano /var/www/focusnic.biz.id/ciapp/.env
```
Match the previously created database information, including the db, username, and password. For `app.baseURL`, you can define a valid IP address or domain:
```
CI_ENVIRONMENT = development
app.baseURL = 'http://focusnic.biz.id'
database.default.hostname = localhost
database.default.database = ci_db
database.default.username = ci_user
database.default.password = EkZx5OIslz59uTe4
database.default.DBDriver = MySQLi
database.default.port = 3306
```
Adjust permissions on the CodeIgniter directory:
```
find /var/www/focusnic.biz.id/ciapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/ciapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the CodeIgniter installation through a browser, for example: `http://focusnic.biz.id`. If the installation is successful, the following default CodeIgniter page will appear.
![](/img/almalinux8-lamp-apps-codeigniter1.jpg)<br/>

## Trobleshooting

1. Page not found or 404 error when opening the main page <br/>

Ensure the Apache root directory points to CodeIgniter's `public/` and that `.htaccess` is active.

2. Permission denied on writable folder <br/>

Make sure `apache` is the owner and the folder has 775 permissions.

3. Database Connection Failed (Error: Unable to connect to your database) <br/>

The username, password, or database name is incorrect. Make sure to create the database and test it manually:
```
mariadb -u ci_user -p
```

4. Incomplete PHP Extensions <br/>

Some required PHP extensions are missing (such as mbstring, intl, pdo, etc.). Install all required extensions:
```
dnf install php-mbstring php-intl php-pdo php-mysqlnd
systemctl restart httpd php-fpm
```

## Conclusion

By following the detailed steps above, we have successfully installed the complete **CodeIgniter** framework on a **LAMP Stack** based on **AlmaLinux 8**. This combination provides high performance, stability, and ease of PHP application development. This configuration is ideal for use on both production and development servers.

Q: Can I use Nginx instead of Apache? <br/>
A: Yes, CodeIgniter can run on top of Nginx, but the configuration is different. This guide focuses on the LAMP Stack with Apache.

Q: How do I display detailed errors during development? <br/>
A: Change the environment in the `.env` file:
```
CI_ENVIRONMENT = development
```

Q: What is the difference between the `app/`, `public/`, and `writable/` directories in CodeIgniter? <br/>
A:

- `app/`: Contains the main application code (controllers, models, configuration).
- `public/`: The root directory accessed by web browsers, where index.php is located.
- `writable/`: Contains logs, caches, and temporary files.

Q: Is CodeIgniter 4 compatible with PHP 8? <br/>
A: Yes, CodeIgniter 4 is designed to work well with PHP 7.4 to 8.x.

Q: What should I do if I want to publish my application to the internet? <br/>
A: You will need to set up a domain, SSL (HTTPS), and additional security.

Q: How do I update CodeIgniter to the latest version? <br/>
A: If you are using Composer, run the following command:
```
composer update
```

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity

