---
title: Complete Guide on How to Install Paymenter using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Paymenter using LAMP Stack on AlmaLinux 8
sidebar_label: Paymenter
---

**Paymenter** is an **open-source billing hosting** platform designed to simplify payment management, billing, and even hosting service automation. Supported by **extension plugins, a marketplace, and a modern API**, Paymenter is widely used by hosting providers, developers, and companies looking to provide a flexible and reliable payment system.

In this guide, we'll cover in detail **how to install Paymenter using a LAMP Stack (Linux, Apache, MariaDB/MySQL, PHP) on AlmaLinux 8**. This guide is written for production servers with complete configurations to ensure optimal and secure system performance.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the Paymenter installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-redis
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

### Install Redis

Run the following command to install the Redis server:
```
dnf install redis
```
Enable Redis service:
```
systemctl enable --now redis
systemctl status redis
```

## Install Paymenter

Before installing Paymenter, we'll first create a virtual host and database (to store Paymenter content, configuration, and structure). Run the following command to create a virtual host:

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
    DocumentRoot /var/www/focusnic.biz.id/paymenterapp/public

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
mkdir -p /var/www/focusnic.biz.id/paymenterapp
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
create database paymenter_db;
create user 'paymenter_user'@'localhost' identified by 'ubMH9tfmpWgGLJm8';
grant all on paymenter_db.* to 'paymenter_user'@'localhost';
flush privileges;
quit;
```
Download Composer and install it with the following command:

:::info
Composer will be needed for Paymenter management, such as installing dependencies and other requirements during development or production.
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
PHP version 8.4.11 (/usr/bin/php)
```
Download the Paymenter file with the following command:
```
cd /var/www/focusnic.biz.id/paymenterapp
curl -Lo paymenter.tar.gz https://github.com/paymenter/paymenter/releases/latest/download/paymenter.tar.gz
tar -xf paymenter.tar.gz
```
Run the following command to install the required dependencies:
```
cd /var/www/focusnic.biz.id/paymenterapp
composer install --no-dev --optimize-autoloader
```
Then copy the environment and set some parameters including the database:
```
cd /var/www/focusnic.biz.id/paymenterapp
cp .env.example .env
nano .env
```
Fill in the parameters in the following environment according to the database that has been created:
```
DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymenter_db
DB_USERNAME=paymenter_user
DB_PASSWORD=ubMH9tfmpWgGLJm8
```
Generate encryption key:
```
cd /var/www/focusnic.biz.id/paymenterapp
php artisan key:generate --force
php artisan storage:link
```
Output example:
```
   INFO  Application key set successfully.  

   INFO  The [public/storage] link has been connected to [storage/app/public].  
```

Run the following commands to migrate db, initialize Paymenter, and create Paymenter user:
```
cd /var/www/focusnic.biz.id/paymenterapp
php artisan migrate --force --seed
php artisan app:init
php artisan app:user:create
```
The following is an example of the output from the `php artisan app:init` command:
```
 ┌ What is the name of your company? ───────────────────────────┐
 │ Focusnic                                                     │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the URL of your application? ────────────────────────┐
 │ http://focusnic.biz.id                                       │
 └──────────────────────────────────────────────────────────────┘

Thanks for installing Paymenter!
Now you're all set up!
Visit Paymenter at http://focusnic.biz.id
```
Here is an example output from the `php artisan app:user:create` command:
```
 ┌ What is the user's first name? ──────────────────────────────┐
 │ admin                                                        │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's last name? ───────────────────────────────┐
 │ focusnic                                                     │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's email address? ───────────────────────────┐
 │ admin@focusnic.biz.id                                        │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's password? ────────────────────────────────┐
 │ •••••••••                                                    │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's role? ────────────────────────────────────┐
 │ admin                                                        │
 └──────────────────────────────────────────────────────────────┘
```
Adjust the permissions on the Paymenter directory:
```
cd /var/www/focusnic.biz.id/paymenterapp
chmod -R 755 storage/* bootstrap/cache/
find /var/www/focusnic.biz.id/paymenterapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/paymenterapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Create a cronjob every minute to run the Paymenter queue worker:
```
crontab -e
```
Fill in the following parameters:
```
* * * * * sudo -u apache php /var/www/paymenter/artisan schedule:run >> /dev/null 2>&1
```

Access the Paymenter installation through a browser, for example: `http://$DOMAIN`. If the installation is successful, the default Paymenter page will appear as follows <br/>
![](/img/almalinux8-lamp-apps-paymenter1.jpg)<br/>
Next is the Paymenter Administrator dashboard. It can be accessed via the following domain: `http://$DOMAIN/admin`
![](/img/almalinux8-lamp-apps-paymenter2.jpg)<br/>
The Paymenter client dashboard display is as follows
![](/img/almalinux8-lamp-apps-paymenter3.jpg)<br/>


## Troubleshooting

1. Error 500 Internal Server Error <br/>

The permissions on the `storage` or `bootstrap/cache` directory are incorrect. Run the following command to adjust the permissions:
```
cd /var/www/focusnic.biz.id/paymenterapp
chmod -R 755 storage/* bootstrap/cache/
find /var/www/focusnic.biz.id/paymenterapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/paymenterapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Unable to Connect to Database <br/>

Incorrect `.env` configuration, incorrect database username/password input. Solution: Check the `.env` file for the following lines:
```
DB_DATABASE=paymenter
DB_USERNAME=paymenteruser
DB_PASSWORD=password
```

3. Composer Error / Failed to Install Dependency <br/>

PHP does not have all the required extensions installed. Run the following command to install the required PHP extensions:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-redis
```

4. Blank Paymenter Page After Installation <br/>

Make sure `AllowOverride All` is added to the Apache VirtualHost configuration.

## Conclusion

By following the steps above, we have successfully installed **Paymenter using the LAMP Stack on AlmaLinux 8**. Everything from server preparation and installation of Apache, MariaDB, and PHP to Composer configuration, database migration, and Apache Virtual Hosts has been thoroughly explained.

Paymenter provides a flexible, open-source, and secure billing hosting solution for digital businesses and hosting service providers. However, the installation process requires careful attention to detail to ensure the system is truly stable and secure in a production environment.

Q: What is Paymenter? <br/>
A: Paymenter is an open-source hosting billing application that can be used to manage payment systems, invoices, users, and integrate hosting services.

Q: How is Paymenter different from WHMCS? <br/>
A: Paymenter is a free and open-source alternative to WHMCS, offering high flexibility, extension plugins, and community support.

Q: Can Paymenter run on AlmaLinux 8? <br/>
A: Yes. Although the official documentation is more for Ubuntu/Debian, Paymenter can run on AlmaLinux 8 using the LAMP Stack.

Q: What is the minimum PHP version for Paymenter? <br/>
A: Paymenter requires PHP 8.2 or later to be compatible with the Laravel framework it uses.

Q: How can I speed up Paymenter's performance? <br/>
A: You can optimize PHP, the MariaDB database, caching, and Apache configuration. For maximum performance, use a server with an SSD and at least 4GB of RAM.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
