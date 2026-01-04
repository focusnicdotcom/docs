---
title: Complete Guide on How to Install PHP Framework Laravel using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install PHP Framework Laravel using LAMP Stack on AlmaLinux 8
sidebar_label: Laravel
---

Laravel is one of the most popular and powerful **PHP frameworks** widely used for building modern, fast, and secure web applications. In this guide, we will thoroughly cover **how to install Laravel using a LAMP (Linux, Apache, MySQL/MariaDB, PHP) stack on AlmaLinux 8**, a highly stable Red Hat Enterprise Linux (RHEL)-based Linux distribution for production use.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the Laravel installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Laravel

Before installing the latest version of Laravel 12, we will first create a virtual host and database (to store Laravel content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/laravelapp/public

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
create database laravel_db;
create user 'laravel_user'@'localhost' identified by 'uKpCZmSAXY9HMu7E';
grant all on laravel_db.* to 'laravel_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for Laravel management such as installing dependencies and other requirements during development or production.
:::

```
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```
Check composer version:
```
composer --version
```
Example output:
```
Composer version 2.8.10 2025-07-10 19:08:33
PHP version 8.4.10 (/usr/bin/php)
```

Download the Laravel file and place it in the directory according to the virtual host, we will download Laravel and create a project with the name `laravelapp` using composer:
```
cd /var/www/focusnic.biz.id/
composer create-project --prefer-dist laravel/laravel laravelapp
```
Change some parameters in the `.env` file for database connection in Laravel:
```
nano /var/www/focusnic.biz.id/laravelapp/.env
```
Match the previously created database information including db, username, and password:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=uKpCZmSAXY9HMu7E
```
Run the following commands to initialize and migrate the laravelapp project database:
```
cd /var/www/focusnic.biz.id/laravelapp
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:clear
sudo -u apache php artisan migrate
sudo -u apache php artisan db:seed
```
Adjust permissions on Laravel directory:
```
find /var/www/focusnic.biz.id/laravelapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/laravelapp -type d -exec chmod 755 {} \;
chmod -R 775 /var/www/focusnic.biz.id/laravelapp/storage
chmod -R 775 /var/www/focusnic.biz.id/laravelapp/bootstrap/cache
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the Laravel installation through a browser, for example: `http://focusnic.biz.id`. If the installation is correct and appropriate, the default Laravel page will appear as follows.
![](/img/almalinux8-lamp-apps-laravel1.jpg)<br/>

## Troubleshooting

1. 403 Forbidden after installing Laravel <br/>

**Cause:**

- Directory permissions or ownership are incorrect.
- SELinux is blocking access to the Laravel directory.

**Solution:**

Run the following commands to adjust permissions and SELinux:
```
chown -R apache:apache /var/www/focusnic.biz.id/laravelapp
chmod -R 755 /var/www/focusnic.biz.id/laravelapp
chcon -R -t httpd_sys_content_t /var/www/focusnic.biz.id/laravelapp
chcon -R -t httpd_sys_rw_content_t /var/www/focusnic.biz.id/laravelapp/storage
```

2. 500 Internal Server Error <br/>

**Cause:**

- The `.env` file is not configured.
- The `storage/` or `bootstrap/cache/` permissions are incorrect.
- Composer autoload has not been run.

**Solution:**

Run the following command
```
cd /var/www/focusnic.biz.id/laravelapp
php artisan config:clear
php artisan config:cache
chmod -R 775 storage bootstrap/cache
composer install --optimize-autoloader --no-dev
```

3. Route or configuration changes not detected <br/>

This is because Laravel is still using the old cache. The solution is to clear the cache with the following command:
```
cd /var/www/focusnic.biz.id/laravelapp
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

4. Error during migration or db:seed <br/>

**Cause:**

- The database has not been configured correctly in .env
- The database user does not have access
- The command was executed by a user other than the web server user

**Solution:**

Check the contents of `.env` and ensure they match the database credentials. Use the following command to migrate the database:
```
sudo -u apache php artisan migrate
sudo -u apache php artisan db:seed
```

## Conclusion

Through this guide, we have thoroughly discussed **how to install the Laravel Framework using the LAMP Stack on AlmaLinux 8**, from system configuration and installation of Apache, MariaDB, PHP 8, and Composer, to successfully running Laravel and accessing it through a browser. By following these steps, your server will be ready to develop and run stable and optimal Laravel applications.

Q: Can Laravel run without Composer? <br/>
A: No. Composer is Laravel's official dependency manager and is required to install and manage application dependencies.

Q: Are MariaDB and MySQL the same for Laravel? <br/>
A: Generally, yes, Laravel supports both. MariaDB is a fork of MySQL and is used by default on AlmaLinux.

Q: When should I run `php artisan migrate` and `db:seed`? <br/>
A:
- Run `migrate` during initial deployment or when adding a new table.
- Run `db:seed` if you want to populate initial data (admin, roles, categories, etc.).

Q: How can I make my Laravel more secure in production? <br/>
A:
- Disable debugging in `.env` (`APP_DEBUG=false`)
- Use the minimum permissions required.
- Enable SSL for traffic encryption.
- Use firewalls and SELinux properly.

Q: Why use `sudo -u apache`? <br/>
A:
- Because the files created and used by Laravel must be readable/writable by the `apache` user.
- To prevent permission issues (e.g., the `storage/logs/laravel.log` file cannot be written to).

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
