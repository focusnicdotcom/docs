---
title: Complete Guide on How to Install October CMS using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install October CMS using LAMP Stack on AlmaLinux 8
sidebar_label: October CMS
---

**October CMS** is a lightweight, flexible, and easily integrated PHP-based **Content Management System** for modern website development. In this guide, we'll cover in detail **how to install October CMS using the LAMP Stack on AlmaLinux 8**, from server preparation to final configuration to ensure optimal use.

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

## Install October CMS

Before installing October CMS, we will first create a virtual host and database (to store October CMS content, configuration, and structure). Run the following command to create a virtual host:
:::info
Make sure you are using a valid domain (FQDN) and that the DNS A record is pointed to the server IP address used on your server.
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
    DocumentRoot /var/www/focusnic.biz.id/octoberapp

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
create database october_db;
create user 'october_user'@'localhost' identified by 'teYWgZVkMW6U67z4';
grant all on october_db.* to 'october_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:

:::info
Composer will be needed for October CMS management such as installing dependencies and other requirements during development or production.
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

Download the October file and place it in the directory according to the virtual host, we will download October CMS and create a project with the name `octoberapp` using composer:
```
cd /var/www/focusnic.biz.id
composer create-project october/october octoberapp
```
Install October CMS:
```
cd /var/www/focusnic.biz.id/octoberapp
php artisan october:install
```

Here's an example of the output instructions from the October CMS installation:

:::info
Make sure you have an October CMS license, which can be obtained for free from the official October CMS website https://octobercms.com/
:::


```
.=================================================.
   ____   _____ _______  ____  ____  ___________   
  / __ \ / ____|__   __|/ __ \|  _ \|  ____|  __ \ 
 | |  | | |       | |  | |  | | |_) | |__  | |__) |
 | |  | | |       | |  | |  | |  _ <|  __| |  _  / 
 | |__| | |____   | |  | |__| | |_) | |____| | \ \ 
  \____/ \_____|  |_|   \____/|____/|______|_|  \_\
                                                    
`================== INSTALLATION =================' 

Application key [g3s2uRdQoiQkWk4zZKl8onzz2C2n2yDd] set successfully.
 ------- ------------------------------------ ------- ----------------------------------- 
  Code    Language                             Code    Language                           
 ------- ------------------------------------ ------- ----------------------------------- 
  ar      (Arabic) العربية                     it      (Italian) Italiano                 
  be      (Belarusian) Беларуская              ja      (Japanese) 日本語                  
  bg      (Bulgarian) Български                ko      (Korean) 한국어                    
  ca      (Catalan) Català                     lt      (Lithuanian) Lietuvių              
  cs      (Czech) Čeština                      lv      (Latvian) Latviešu                 
  da      (Danish) Dansk                       nb-no   (Norwegian) Norsk (Bokmål)         
  de      (German) Deutsch                     nl      (Dutch) Nederlands                 
  el      (Greek) Ελληνικά                     pl      (Polish) Polski                    
  en      (English) English (United States)    pt-br   (Portuguese) Português (Brasil)    
  en-au   (English) English (Australia)        pt-pt   (Portuguese) Português (Portugal)  
  en-ca   (English) English (Canada)           ro      (Romanian) Română                  
  en-gb   (English) English (United Kingdom)   ru      (Russian) Русский                  
  es      (Spanish) Español                    sk      (Slovak) Slovenský                 
  es-ar   (Spanish) Español (Argentina)        sl      (Slovene) Slovenščina              
  et      (Estonian) Eesti                     sv      (Swedish) Svenska                  
  fa      (Persian) فارسی                      th      (Thai) ไทย                         
  fi      (Finnish) Suomi                      tr      (Turkish) Türkçe                   
  fr      (French) Français                    uk      (Ukrainian) Українська мова        
  fr-ca   (French) Français (Canada)           vn      (Vietnamese) Tiếng việt            
  hu      (Hungarian) Magyar                   zh-cn   (Chinese) 简体中文                 
  id      (Indonesian) Bahasa Indonesia        zh-tw   (Chinese) 繁體中文                 
 ------- ------------------------------------ ------- ----------------------------------- 

 Select Language [en]:
 > en 

Application Configuration
-------------------------

 Application URL [http://localhost]:
 > http://focusnic.biz.id

To secure your application, use a custom address for accessing the admin panel.

 Backend URI [/admin]:
 > [ENTER]

 Database Engine [MySQL]:
  [0] SQLite
  [1] MySQL
  [2] Postgres
  [3] SQL Server
 > 1

Hostname for the database connection.

 Database Host [127.0.0.1]:
 > [ENTER]

(Optional) A port for the connection.

 Database Port [3306]:
 > [ENTER]

Specify the name of the database to use.

 Database Name [database]:
 > october_db

User with create database privileges.

 Database Login [root]:
 > october_user

Password for the specified user.

 Database Password []:
 > teYWgZVkMW6U67z4

Demo Content
------------

 Install the demonstration theme and content? (Recommended) (yes/no) [yes]:
 > yes

License Key
-----------

Enter a valid License Key to proceed.

 License Key:
 > X0M6F-4XXX-XXXX-XXXX

                                                                                                                        
 [OK] Thanks for being a customer of October CMS!
```
Run the following command to migrate October CMS db:
```
cd /var/www/focusnic.biz.id/octoberapp
php artisan october:migrate
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/octoberapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/octoberapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup October CMS admin/backend via `http://$DOMAIN/admin`
![](/img/almalinux8-lamp-apps-octobercms1.jpg)<br/>
Here is the October CMS admin dashboard view
![](/img/almalinux8-lamp-apps-octobercms2.jpg)<br/>
Frontend demo view of October CMS
![](/img/almalinux8-lamp-apps-octobercms3.jpg)<br/>


## Troubleshooting

1. AH00124: Request exceeded the limit of 10 internal redirects <br/>

After installing October CMS an error like the following appears in the Apache `error_log`:
```
AH00124: Request exceeded the limit of 10 internal redirects due to probable configuration error
```
or
```
AH01276: Cannot serve directory /var/www/domain/octoberapp/app/: No matching DirectoryIndex found
```

So the main cause is usually that the `DocumentRoot` is misdirected.

**Cause:**

- The VirtualHost is pointed to the `/app` or `/public` folder as per the Laravel configuration.
- October CMS places `index.php` directly in the root of the installation folder, not `/public` or `/app`.
- Apache cannot find `index.php` in the redirected location, so it tries to redirect repeatedly.

**Solution:**

Make sure `DocumentRoot` points directly to the root folder of the October CMS installation:
```
DocumentRoot /var/www/domain/octoberapp

<Directory /var/www/domain/octoberapp>
    AllowOverride All
    Require all granted
</Directory>
```

2. Error “Composer Not Found” <br/>

If an error appears during installation:
```
bash: composer: command not found
```

**Solution:**

```
dnf install composer -y
```
Also make sure Composer is installed correctly:
```
composer -V
```

3. Error Permission Denied <br/>

If October CMS can't create a file or directory, the problem is usually with permissions. Solution:
```
find /var/www/focusnic.biz.id/octoberapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/octoberapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

4. Database Connection Error <br/>

If you receive an error saying you can't connect to the database:

- Make sure the username, password, and database name are correct.
- Try a manual connection:
```
mysql -u octoberuser -p
```

## Conclusion

Installing **October CMS on AlmaLinux 8 using the LAMP Stack** is the right step to building a fast, secure, and flexible website. With the right configuration, we can achieve optimal performance. Ensure every step, from installing Apache, MariaDB, and PHP to configuring the Virtual Host, is carried out carefully.

For more optimal setup and maximum security, **use Focusnic's server or cloud VPS installation services**, ready to assist you from installation, configuration, and optimization.


Q: What is October CMS? <br/>
A: October CMS is a PHP-based CMS with a flexible Laravel framework suitable for various types of websites.

Q: Can October CMS run on AlmaLinux 8? <br/>
A: Yes, October CMS is fully compatible with AlmaLinux 8, especially if using a LAMP Stack with PHP 8.0 or later.

Q: Do you have to use Composer to install October CMS? <br/>
A: Yes, Composer is highly recommended because it simplifies installation and updating dependencies.

Q: Does October CMS have a `/public` folder like Laravel? <br/>
A: No. All core files and `index.php` are located in the installation root. There is no need to point `DocumentRoot` to `/public`.

Q: What if I still want to separate public and private folders like Laravel? <br/>
A: You can manually configure `index.php` by moving `index.php` to the `public_html` folder and resetting the path, but this requires additional modifications and is not recommended for standard installations.

Q: Is `.htaccess` required? <br/>
A: Yes. The `.htaccess` file in the root of October CMS is required for routing and URLs to work correctly.

Q: Can I use Nginx for October CMS? <br/>
A: Yes. However, the Nginx configuration is different and needs to be adjusted, especially for the rewrite rules in `.htaccess`.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
