---
title: Complete Guide on How to Install PHP Framework Symfony using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install PHP Framework Symfony using LAMP Stack on AlmaLinux 8
sidebar_label: Symfony
---

Symfony is one of the most powerful and flexible **PHP frameworks** for developing large-scale web applications. With high performance, comprehensive documentation, and an active community, Symfony is an ideal choice for professional developers. In this guide, we'll thoroughly cover **how to install Symfony using a LAMP stack on AlmaLinux 8** – designed to be easy to follow, even for beginners new to Linux and Symfony.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the Symfony installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Symfony

Before installing the latest version of Symfony 7, we will first create a virtual host and database (to store Symfony content, configuration, and structure). Run the following command to create a virtual host:
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
create database symfony_db;
create user 'symfony_user'@'localhost' identified by 'b0mIt1N4kuzUTRE1';
grant all on symfony_db.* to 'symfony_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for Symfony management such as installing dependencies and other requirements during development or production.
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
Download and install `symfony-cli` with the following command:
:::info
Symfony CLI is a tool to help you build, run, and manage Symfony applications directly from the terminal.
:::
```
wget https://get.symfony.com/cli/installer -O - | bash
mv /root/.symfony5/bin/symfony /usr/local/bin/symfony
```
Then check the `symfony-cli` installation with the following command:
```
symfony -v
```
Output example:
```
Symfony CLI version 5.12.0 (c) 2021-2025 Fabien Potencier (2025-06-16T09:40:30Z - stable)
Symfony CLI helps developers manage projects, from local code to remote infrastructure
```
Download the Symfony file and place it in the directory according to the virtualhost, we will download Symfony and create a project with the name `symfonyapp` using `symfony-cli`:
```
cd /var/www/focusnic.biz.id/
symfony check:req
symfony new symfonyapp
cd symfonyapp
composer fund
composer update
composer install
composer require symfony/orm-pack
composer require symfony/maker-bundle --dev
cp env .env
```
Change some parameters in the `.env` file for the database connection in Symfony:
```
nano /var/www/focusnic.biz.id/symfonyapp/.env
```
Add the following parameters and adjust with the previously created database information including db, username, and password:
```
DATABASE_URL="mysql://symfony_user:b0mIt1N4kuzUTRE1@127.0.0.1:3306/symfony_db"
```
Run the following command to populate db:
```
php bin/console make:migration
php bin/console doctrine:migrations:migrate
```
Adjust permissions on the Symfony directory:
```
find /var/www/focusnic.biz.id/symfonyapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/symfonyapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the Symfony installation through a browser, for example: `http://focusnic.biz.id`. If the installation is successful, the following default Symfony page will appear.
![](/img/almalinux8-lamp-apps-symfony1.jpg)<br/>

## Troubleshooting

1. Symfony CLI Command Not Found <br/>

Make sure you have moved the binary to the global directory after downloading:
```
mv /root/.symfony5/bin/symfony /usr/local/bin/symfony
```
Then verify with the following command:
```
symfony -v
```

2. Can't create database `symfony_db`; database exists <br/>

Ignore this error and proceed to the migration steps:
```
php bin/console doctrine:migrations:migrate
```

3. Error: The version "latest" couldn't be reached, there are no registered migrations. <br/>

The cause is that no migration files were detected by Doctrine.

Solution:

- Create an entity first:

:::info
When generating an entity, fill in the following values: <br/>
// Class name<br/>
Post <br/>

// Field 1 <br/>
title<br/>
string<br/>
150<br/>

// Field 2<br/>
content<br/>
text
:::

```
cd /var/www/focusnic.biz.id/symfonyapp
php bin/console make:entity
php bin/console doctrine:schema:validate
```
- Generate migration:
```
php bin/console make:migration
```
- Then run the following command:
```
php bin/console doctrine:migrations:migrate
```

4. 403 Forbidden <br/>

Make sure the `public` directory permissions are correct and `AllowOverride All` is enabled.

## Conclusion

Installing Symfony using the **LAMP Stack on AlmaLinux 8** requires several steps, from server configuration, dependency installation, database setup, to Apache and Doctrine configuration. If all steps are followed correctly, Symfony is ready to use to build professional and scalable web applications.

Q: Can Symfony be installed without Composer? <br/>
A: Not recommended. Composer is the primary dependency manager for Symfony.

Q: Can I use Nginx instead of Apache? <br/>
A: Yes. However, this guide focuses on LAMP (Linux, Apache, MySQL/MariaDB, PHP).

Q: Symfony detects no changes, even though an entity has been created? <br/>
A: Make sure you have saved the entity file and that the entity structure is correct. Run the following command:
```
php bin/console doctrine:schema:validate
```
Q: Is Symfony suitable for beginners? <br/>
A: Symfony is certainly better suited for large projects or experienced developers, but with documentation and tools like `make:entity`, `make:controller`, and `symfony server:start`, even beginners can learn gradually.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity

