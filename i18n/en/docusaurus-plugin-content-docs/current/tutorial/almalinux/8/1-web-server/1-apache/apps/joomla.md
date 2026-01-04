---
title: Complete Guide on How to Install Joomla using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Joomla using LAMP Stack on AlmaLinux 8
sidebar_label: Joomla
---

**Joomla** is one of the most popular open-source **Content Management Systems (CMS)** used to create dynamic and professional websites. With its extensive ecosystem, Joomla is perfect for blogs, corporate websites, and even e-commerce. In this guide, we'll cover **how to install Joomla using the LAMP Stack on AlmaLinux 8**, step by step, in a **comprehensive** manner, to ensure your Joomla site runs **optimally and securely**.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the Joomla installation, make sure your AlmaLinux 8 server is up to date and ready to install the LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Joomla

Before installing the latest Joomla version 5, we will first create a virtual host and database (to store Joomla content, configuration, and structure). Run the following command to create a virtual host:
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
create database joomla_db;
create user 'joomla_user'@'localhost' identified by 'bfhWbTcFFg93wc5s';
grant all on joomla_db.* to 'joomla_user'@'localhost';
flush privileges;
quit;
```

Download the Joomla file and place it in the appropriate directory on the virtual host:
```
cd /var/www/focusnic.biz.id/public_html
wget https://downloads.joomla.org/cms/joomla5/5-3-2/Joomla_5-3-2-Stable-Full_Package.zip?format=zip -O joomla.zip
unzip joomla.zip
cp htaccess.txt .htaccess
```

Adjust permissions:
```
cd /var/www/focusnic.biz.id/public_html
find . -type d -exec chmod u=rwx,g=rx,o= '{}' \;
find . -type f -exec chmod u=rw,g=r,o= '{}' \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Access the Joomla installation via a browser, for example: `http://focusnic.biz.id` then adjust the language you want to use and fill in the site name then click "Setup Login Data"
![](/img/almalinux8-lamp-apps-joomla1.jpg)<br/>
Then, set up the administrator name, username, password, and email address for Joomla. Continue by clicking "Setup Database Connection."
![](/img/almalinux8-lamp-apps-joomla2.jpg)<br/>
Setup the database, adjust it to the database that was created previously, such as the db name, user, and password, then click "Install Joomla"
![](/img/almalinux8-lamp-apps-joomla3.jpg)<br/>
Wait until the installation is complete
![](/img/almalinux8-lamp-apps-joomla4.jpg)<br/>
Here is a preview of Joomla installation
![](/img/almalinux8-lamp-apps-joomla5.jpg)<br/>
To enter the administrator dashboard, please put the username and password created previously, then please open the Joomla administrator page at `http://$DOMAIN/administrator/`
![](/img/almalinux8-lamp-apps-joomla6.jpg)<br/>

## Troubleshooting

1. Blank Joomla Page (Blank Screen / White Page) <br/>

**Cause:**

- Incorrect PHP configuration
- Required PHP extensions are not installed
- PHP errors are not visible because `display_errors` is disabled

**Solution:**

- Check the PHP and Apache logs:
```
tail -f /var/log/httpd/focusnic.biz.id-error.log
```
- Enable error display:
```
nano /etc/php.ini
```
Adjust the following parameters:
```
display_errors = On
error_reporting = E_ALL
```
Restart the php-fpm:
```
systemctl restart php-fpm
```

Then try to access and check if any errors appear.

2. Error “Cannot connect to the database” <br/>

The database name, user, or password is incorrect. Make sure MariaDB is running and that the database, user, and password have been created.

3. Error 403 Forbidden <br/>

Incorrect directory and SELinux permissions.

**Solution:**
```
chown -R apache:apache /var/www/focusnic.biz.id
setsebool -P httpd_unified 1
setsebool -P httpd_can_network_connect_db 1
```
4. Joomla Doesn't Save Configuration <br/>

The `configuration.php` file has incorrect permissions.

**Solution:**
```
chmod 644 /var/www/focusnic.biz.id/public_html/configuration.php
```

## Conclusion

Installing **Joomla with a LAMP Stack on AlmaLinux 8** is a relatively easy process if done systematically and according to the guide. By properly setting up **Apache, MariaDB, and PHP**, and configuring permissions and databases appropriately, Joomla can run **stable, quickly, and securely**. Running Joomla on AlmaLinux offers the benefits of stability, enterprise-grade security, and long-term support (LTS). This combination makes Joomla a solid choice for business websites, organizations, and other professional needs.

Q: What's the difference between Joomla and other CMSs like WordPress? <br/>
A: Joomla offers a more flexible structure in terms of content management and access control. It's suitable for websites that require complex multi-user systems.

Q: Can I use Nginx instead of Apache? <br/>
A: Yes, but this guide uses Apache because it's highly compatible and easier to configure for beginners.

Q: Is Joomla safe to use for e-commerce websites? <br/>
A: Yes. With proper security settings, regular updates, and the use of trusted extensions, Joomla can be used safely for e-commerce.

Q: Do I have to use SSL/HTTPS? <br/>
A: It's highly recommended for security and user trust. Joomla supports SSL, and you can easily enable it using Let's Encrypt.

Q: Can I install Joomla on a local server (localhost)? <br/>
A: Yes, Joomla can be run on localhost for development and testing. However, for production, a server or VPS is still recommended.

Q: Do I have to use a domain for Joomla? <br/>
A: No, you can run Joomla on localhost or a public IP, but for production, using a domain and SSL is highly recommended.

Q: What is the minimum RAM for a Joomla server? <br/>
A: Minimum RAM is 1 GB, but 2 GB or more is recommended for optimal performance, especially if the site uses many extensions.

Q: Can Joomla run on PHP 8? <br/>
A: Yes, the latest version of Joomla supports PHP 8.x. Make sure all PHP extensions are compatible.

Q: Is MariaDB safe to use with Joomla? <br/>
A: MariaDB is the default choice, very stable, and fully supported by Joomla.

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
