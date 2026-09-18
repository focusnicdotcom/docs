---
title: Complete Guide on How to Install EspoCRM using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install EspoCRM using LAMP Stack on AlmaLinux 8
sidebar_label: EspoCRM
---

**EspoCRM** is a lightweight, fast, and reliable open-source **Customer Relationship Management (CRM)** solution for a variety of business needs. With comprehensive features such as **sales management, marketing automation, lead tracking, and in-depth reporting**, EspoCRM is the perfect choice for companies looking to optimize customer relationships. This guide details the steps for **installing EspoCRM using the LAMP Stack (Linux, Apache, MariaDB, PHP)** on **AlmaLinux 8**, ensuring easy and optimal implementation.

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

## Install EspoCRM

Before installing EspoCRM, we will first create a virtual host and database (to store EspoCRM content, configuration, and structure). Run the following command to create a virtual host:
:::info
Make sure you are using a valid domain (FQDN) and that the DNS A record is pointed to the server IP address used on the server.
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
    DocumentRoot /var/www/focusnic.biz.id/espocrmapp/public

    Alias /client/ /var/www/focusnic.biz.id/espocrmapp/client/

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
mkdir -p /var/www/focusnic.biz.id/espocrmapp
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
create database espocrm_db;
create user 'espocrm_user'@'localhost' identified by '1AUw92jrNHN6yCk2';
grant all on espocrm_db.* to 'espocrm_user'@'localhost';
flush privileges;
quit;
```

Download the EspoCRM file and place it in the appropriate directory on the virtual host:
```
cd /var/www/focusnic.biz.id/espocrmapp
wget https://www.espocrm.com/downloads/EspoCRM-9.1.8.zip
unzip EspoCRM-9.1.8.zip
mv EspoCRM-9.1.8/* .
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/espocrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/espocrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup EspoCRM via `http://$DOMAIN`. You can set the language and theme in this initial step.
![](/img/almalinux8-lamp-apps-espocrm1.jpg) <br/>
Read and agree to the EspoCRM license agreement to continue with the installation.
![](/img/almalinux8-lamp-apps-espocrm2.png) <br/>
Then fill in the database information with the database created above, then test the DB connection before continuing.
![](/img/almalinux8-lamp-apps-espocrm3.png) <br/>
EspoCRM will check the requirements, make sure the result is "Success"
![](/img/almalinux8-lamp-apps-espocrm4.png) <br/>
Create an administrator user to manage EspoCRM
![](/img/almalinux8-lamp-apps-espocrm5.png) <br/>
Then adjust the system settings, the most important thing here is the language, currency, and also the time zone.
![](/img/almalinux8-lamp-apps-espocrm6.png) <br/>
EspoCRM installation has been successful, and there is information to add a cron job to the server so that EspoCRM can run *scheduled tasks* smoothly.
![](/img/almalinux8-lamp-apps-espocrm7.png) <br/>

Please log in to the server and add a cron job using the following command:
```
crontab -e
```
Fill in the following parameters:
```
* * * * * cd /var/www/focusnic.biz.id/espocrmapp; /usr/bin/php -f cron.php > /dev/null 2>&1
```

The following is a view of the EspoCRM dashboard which can be accessed via `http://$DOMAIN`
![](/img/almalinux8-lamp-apps-espocrm8.png) <br/>

## Troubleshooting

1. Error "500 Internal Server Error" After EspoCRM Installation <br/>

Folder permissions are incorrect or mod_rewrite is not enabled. Run the following command to adjust the permissions:
```
find /var/www/focusnic.biz.id/espocrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/espocrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Failed to Connect to Database <br/>

The database credentials are incorrect or the user has not been granted full access rights. Run the following command to grant database access:
```
mariadb
grant all on espocrm_db.* to 'espocrm_user'@'localhost';
flush privileges;
exit;
```

3. The EspoCRM frontend doesn't appear correctly during installation <br/>

Ensure that the 'Alias' on the Apache virtual host exists. Adjust the following virtual host to your own:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/espocrmapp/public

    Alias /client/ /var/www/focusnic.biz.id/espocrmapp/client/

    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

## Conclusion

Using **EspoCRM on AlmaLinux 8 with a LAMP Stack** provides high flexibility, guaranteed security, and optimal performance for customer management. The installation process includes server preparation, Apache, MariaDB, PHP, VirtualHost configuration, and SSL security.

With this guide, it is hoped that the **EspoCRM** implementation will run smoothly without any significant issues. For companies looking to focus on business without the hassle of technical issues, **Focusnic** offers a **professional and reliable server and cloud VPS installation service**.

Q: Is EspoCRM Free?
A: Yes, EspoCRM is open-source software and can be used without a licensing fee. However, some additional modules are paid.

Q: What are the Minimum Server Specifications for EspoCRM?
A: A minimum of 2 vCPUs, 2GB of RAM, and 10GB of storage are recommended for optimal performance. For more than 20 users, use a minimum of 4GB of RAM.

Q: How is EspoCRM different from SuiteCRM or Vtiger? <br/>
A: EspoCRM is lighter, faster, and more customizable than other CRMs like SuiteCRM or Vtiger, making it suitable for small to medium-sized businesses.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
