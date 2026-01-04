---
title: Complete Guide on How to Install Krayin CRM using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Krayin CRM using LAMP Stack on AlmaLinux 8
sidebar_label: Krayin CRM
---

Krayin CRM is an open-source **Customer Relationship Management (CRM)** system built using **Laravel**. With a modular, flexible, and user-friendly design, Krayin CRM is suitable for businesses of all sizes looking to manage customer interactions, sales pipelines, and marketing activities in one centralized platform. In this guide, we'll cover the **detailed steps for installing Krayin CRM using the LAMP Stack on AlmaLinux 8**, including server configuration for maximum performance.

If you're building a **self-hosted CRM** for your business, this guide is the perfect guide.

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

## Install Krayin CRM

Before installing Krayin CRM, we will first create a virtual host and database (to store Krayin CRM content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/krayincrmapp/public

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
create database krayincrm_db;
create user 'krayincrm_user'@'localhost' identified by 'BJr3zrrwqEtkXqA7';
grant all on krayincrm_db.* to 'krayincrm_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be required for Krayin CRM management such as installing dependencies and other requirements during development or production.
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

Download the Krayin CRM file and place it in the directory according to the virtual host, we will download Krayin CRM and create a project with the name `krayincrmapp` using composer:
```
cd /var/www/focusnic.biz.id
composer create-project krayin/laravel-crm krayincrmapp
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/krayincrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/krayincrmapp -type d -exec chmod 755 {} \;
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/storage
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/bootstrap/cache
chown -R apache:apache /var/www/focusnic.biz.id
```
Install Krayin CRM using the following command:

:::info
Krayin CRM installation steps such as database setup, migration, and other basic steps such as creating an account for Krayin CRM administration are carried out in the following commands.
:::

```
cd /var/www/focusnic.biz.id/krayincrmapp
php artisan config:clear
php artisan config:cache
php artisan krayin-crm:install
```

Output example:
```
Please enter the application name: Krayin CRM
Please enter the application URL: http://focusnic.biz.id
Please select the default application locale: English
Please select the default currency: Indonesian Rupiah
Please select the database connection: mysql
Please enter the database host: 127.0.0.1
Please enter the database port: 3306
Please enter the database name: krayincrm_db
Please enter the database prefix: [ENTER]
Please enter your database username: krayincrm_user
Please enter your database password: ••••••••••••••••

Enter the name of the admin user: admin
Enter the email address of the admin user: admin@focusnic.biz.id
Configure the password for the admin user: 68gYAMTv2CzByYk5

 _   __                _       
| | / /               (_)      
| |/ / _ __ __ _ _   _ _ _ __  
|    \| '__/ _` | | | | | '_ \ 
| |\  \ | | (_| | |_| | | | | |
\_| \_/_|  \__,_|\__, |_|_| |_|
                  __/ |        
                 |___/         



Welcome to the Krayin project! Krayin Community is an open-source CRM solution
which is built on top of Laravel and Vue.js.

Made with 💖  by the Krayin Team. Happy helping :)
```

The following is a view of the Krayin CRM dashboard which can be accessed via `http://$DOMAIN/admin/login`
![](/img/almalinux8-lamp-apps-krayincrm1.png) <br/>

## Troubleshooting

1. Error 500 Internal Server Error Krayin CRM <br/>

Permissions on the storage and bootstrap/cache folders are incorrect. Run the following command to adjust them:
```
find /var/www/focusnic.biz.id/krayincrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/krayincrmapp -type d -exec chmod 755 {} \;
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/storage
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/bootstrap/cache
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Krayin CRM Database Connection Error <br/>

The `.env` configuration is incorrect, especially in `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.

The solution is to ensure the database name, username, and password are correct according to the database information you created. Check the following file: `/var/www/focusnic.biz.id/krayincrmapp/.env`

4. Krayin CRM Can't Login After Installation <br/>

The Laravel cache hasn't been cleared after configuration. Run the following command:
```
cd /var/www/focusnic.biz.id/krayincrmapp/
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

5. URL or Domain Cannot Be Accessed <br/>

Apache has not enabled `AllowOverride All` in the Virtual Host configuration. Check the virtualhost file and adjust the following parameters:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/krayincrmapp/public

    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

## Conclusion

Installing **Krayin CRM on AlmaLinux 8 using the LAMP Stack** requires systematic steps, from server setup and Apache, MariaDB, and PHP configurations to Laravel customization. If done correctly, Krayin CRM will run optimally and be ready for use in customer management, sales pipelines, and business automation.

This guide has detailed **troubleshooting, FAQs, and server optimization tips**. However, for those who prefer a manual installation, the best solution is to entrust the process to **Focusnic**, a trusted service provider for **server installation, cloud VPS, and Krayin CRM configuration** to professional standards.

A:
- CPU: 2 vCPU
- RAM: 4 GB (8 GB recommended for production)
- Storage: 20 GB SSD/NVMe
- OS: AlmaLinux 8 with LAMP Stack

Q: Can Krayin CRM use Nginx instead of Apache? <br/>
A: Yes, Krayin CRM can be run using Nginx. However, this guide uses Apache because it's simpler to configure in `.htaccess`.

Q: Does Krayin CRM support multi-user and multi-role management? <br/>
A: Yes, Krayin CRM supports a multi-user system with role-based access control (RBAC). Each user can be assigned different access rights based on business needs.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
