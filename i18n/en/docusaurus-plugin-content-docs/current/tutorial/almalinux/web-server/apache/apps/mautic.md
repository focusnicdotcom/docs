---
title: Complete Guide on How to Install Mautic using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Mautic using LAMP Stack on AlmaLinux 8
sidebar_label: Mautic
---

**Mautic** is a popular **open-source marketing automation platform** known for its flexibility, scalability, and advanced features that can be customized to suit business needs. Using Mautic, companies can manage email campaigns, build forms, create landing pages, and even track customer behavior. In this guide, we'll cover **how to install Mautic using the LAMP Stack on AlmaLinux 8** in detail, so you can run it on your server with optimal performance.

If you need help with server installation or want a ready-to-use **cloud VPS**, don't hesitate to contact **Focusnic**.

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
Enable the desired PHP module version. For example, for PHP 8.3, run the following command:
```
dnf module reset php -y
dnf module enable php:remi-8.3 -y
```
Once the repository is active, we can proceed with installing PHP along with the commonly used essential modules:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap
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

## Install Mautic

Before installing Mautic, we'll first create a virtual host and database (to store Mautic's content, configuration, and structure). Run the following command to create a virtual host:
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
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <Directory /var/www/focusnic.biz.id/public_html>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Then create a directory on the virtualhost above:
```
mkdir -p /var/www/focusnic.biz.id/public_html
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
create database mautic_db;
create user 'mautic_user'@'localhost' identified by 'x5NqrmKZfisDmQG8';
grant all on mautic_db.* to 'mautic_user'@'localhost';
flush privileges;
quit;
```

Download the Mautic file and place it in the appropriate directory of the virtual host:
```
cd /var/www/focusnic.biz.id/public_html
wget https://github.com/mautic/mautic/releases/download/6.0.4/6.0.4.zip
unzip 6.0.4.zip
```
Adjust permissions:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup Mautic via `http://$DOMAIN/installer`
![](/img/almalinux8-lamp-apps-mautic1.jpg)<br/>
Set up the Mautic database, making sure to use the database, user, and password you created earlier. Continue until the database table creation process is successful.
![](/img/almalinux8-lamp-apps-mautic2.jpg)<br/>
Then create an administration user for Mautic
![](/img/almalinux8-lamp-apps-mautic3.jpg)<br/>
The following is a display of the Mautic admin dashboard which can be accessed via `http://$DOMAIN/s/login`
![](/img/almalinux8-lamp-apps-mautic4.jpg)<br/>

## Troubleshooting

1. PHP Extension Missing <br/>

Double-check that all PHP extensions are installed. Run the following command to install the required PHP extensions:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap
```

2. Database Connection Failed <br/>

Ensure the database has been created and the user has full access rights. Run the following command to manually test the database connection:
```
mariadb -u matomo_user -p
```

3. Emails Not Delivered <br/>

Use a valid SMTP server to send marketing emails. Make sure the server also allows outbound SMTP ports 25, 465, and 587.

## Conclusion

Installing **Mautic using the LAMP Stack on AlmaLinux 8** gives you complete control over your digital marketing system. With the combination of stable AlmaLinux, a powerful LAMP Stack, and flexible Mautic, your business can build a reliable marketing automation system.

However, if you don't want to waste time on technical configuration, you can directly entrust the server and Mautic installation to **Focusnic**, who is ready to provide the best solution for your business.

Q: Is Mautic free to use? <br/>
A: Yes, Mautic is an open-source platform, so it can be used without licensing fees.

Q: Is AlmaLinux suitable for running Mautic? <br/>
A: Yes, AlmaLinux 8 is very stable, compatible with RHEL, and supports all Mautic dependencies.

Q: What are the minimum server specifications for Mautic? <br/>
A: Minimum 2 CPUs, 4GB RAM, and 20GB storage. However, for large campaigns, higher specifications are recommended.

Q: Can Mautic be integrated with other CRMs? <br/>
A: Yes, Mautic supports integration with many systems such as Salesforce, HubSpot, and others.

Q: What if I don't want the hassle of installation? <br/>
A: You can contact Focusnic directly for server and cloud VPS installation services.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
