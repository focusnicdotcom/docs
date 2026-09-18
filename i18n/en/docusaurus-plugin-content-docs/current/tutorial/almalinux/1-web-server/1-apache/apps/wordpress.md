---
title: Complete Guide on How to Install WordPress using LAMP Stack in AlmaLinux 8
description: Complete Guide on How to Install WordPress using LAMP Stack in AlmaLinux 8
sidebar_label: WordPress
---

WordPress is one of the most popular CMS (Content Management Systems) in the world. The combination of WordPress and the LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP) makes it an ideal choice for users looking to build fast, flexible, and reliable websites. In this guide, we'll cover **how to install WordPress using LAMP Stack in AlmaLinux 8**, from server installation to final WordPress configuration.

## Prerequisites

- Full root access
- Domain (optional)
- Basic Linux Command Line

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Before starting the installation process, ensure that your AlmaLinux 8 server is updated to the latest version. Use the following command to ensure the system is using the latest packages:
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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json
```
Check the installed PHP version with the following command:
```
php -v
```

### Install MariaDB

MariaDB is a replacement for MySQL and is compatible with MySQL-based applications. Run the following command to install:
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
The output above shows that the latest version of MariaDB is available, version 10.11. We'll use the latest version of MariaDB by resetting the default module to use the latest version:
```
dnf module reset mariadb
```
Then run the following command to install the latest version of MariaDB:
```
dnf module install mariadb:10.11
```
Enable and activate the MariaDB service:
```
systemctl enable --now mariadb
systemctl status mariadb
```
Before using it for production or testing, it is best to secure the MariaDB installation first by running the following command:
```
mysql_secure_installation
```
Then follow the instructions that appear:

- Enter current password for root (enter for none) → **[ENTER]**
- Switch to unix_socket authentication → **Y**
- Change the root password? → **Y**
- Remove anonymous users? → **Y**
- Disallow root login remotely? **Y**
- Remove test database and access to it? **Y**
- Reload privilege tables now? **Y**

## Install WordPress

Before installing WordPress, we'll first create a virtual host and database. Run the following command to create a virtual host:
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
mysql
```

Then run the following command to create a database, user, and password:
```
create database wordpress_db;
create user 'wordpress_user'@'localhost' identified by 'U99cy7LjOpBJnAUC';
grant all on wordpress_db.* to 'wordpress_user'@'localhost';
flush privileges;
quit;
```

Download the WordPress file and place it in the appropriate virtualhost directory:
```
cd /var/www/focusnic.biz.id/public_html
wget https://wordpress.org/latest.zip
unzip latest.zip
mv wordpress/* .
```
Adjust permissions:
```
chown -R apache:apache /var/www/focusnic.biz.id
```
Access the WordPress installation via a browser, for example: `http://focusnic.biz.id` then click "Continue"
![](/img/almalinux8-lamp-apps-wp1.jpg)<br/>

Enter the previously created database information and then click "Submit"
![](/img/almalinux8-lamp-apps-wp2.jpg)<br/>

Click "Run the installation"
![](/img/almalinux8-lamp-apps-wp3.jpg)<br/>

Enter your site information, user and password for WordPress administration purposes, then click "Install WordPress"
![](/img/almalinux8-lamp-apps-wp4.jpg)<br/>

Here's what it looks like if WordPress has been successfully installed.
![](/img/almalinux8-lamp-apps-wp5.jpg)<br/>

Please login to the WordPress admin page via the following URL: `http://$DOMAIN/wp-admin` and here is the WordPress admin dashboard display
![](/img/almalinux8-lamp-apps-wp6.jpg)<br/>

## Troubleshooting

1. Apache Cannot Be Accessed from a Browser <br/>

**Common Causes:**

- Apache is not running
- Firewall has not opened ports 80/443
- SELinux is blocking access

**Solution**:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
setsebool -P httpd_can_network_connect 1
```

2. Blank WordPress Page or Error 500 <br/>

**Common causes:**

- Incompatible PHP version
- Incomplete PHP modules
- Incorrect file permissions

**Solution:**
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json
chown -R apache:apache /var/www/focusnic.biz.id
systemctl restart httpd
```

3. Unable to Connect to Database <br/>

**Common causes:**

- Incorrect username/password in `wp-config.php`
- The database has not been created
- The user has not been granted access to the database

4. Failed to Save Settings or Images Not Showing <br/>

Insufficient permissions on the `wp-content` directory. Solution:
```
chown -R apache:apache /var/www/focusnic.biz.id
chmod -R 755 /var/www/focusnic.biz.id/public_html/wp-content
```

## Conclusion

Installing WordPress using **LAMP stack on AlmaLinux 8** is a powerful and efficient solution for running high-performance PHP and MySQL-based websites. By following this guide thoroughly, you can deploy your WordPress site with a stable operating system, a reliable web server, and a fast database.

Q: Is AlmaLinux 8 suitable for WordPress production? <br/>
A: Yes, AlmaLinux 8 is a stable RHEL-based operating system that is well-suited for WordPress production server environments.

Q: Should I use MariaDB or can MySQL also be used? <br/>
A: Both are compatible, but MariaDB is more common in modern Linux distributions like AlmaLinux.

Q: Can WordPress run without a domain? <br/>
A: Yes, WordPress can run using an IP address, but it's better to use a domain for optimal configuration.

Q: Does Focusnic provide WordPress migration or installation services? <br/>
A: Yes. Focusnic provides server installation, WordPress setup, hosting migration, and cloud VPS services with full support. You can simply focus on developing your content, while Focusnic handles the technical aspects.


Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
