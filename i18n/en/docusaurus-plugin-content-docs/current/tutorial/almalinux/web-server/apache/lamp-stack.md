---
title: LAMP Stack
description: How to Install and Configure LAMP Stack on AlmaLinux 8
sidebar_position: 18
sidebar_label: LAMP Stack
---

In the world of web development, the **LAMP Stack** (Linux, Apache, MySQL/MariaDB, and PHP) is the primary foundation often used to run web-based applications. AlmaLinux 8, a Linux distribution based on Red Hat Enterprise Linux (RHEL), offers stability, security, and highly reliable performance, making it an ideal choice for LAMP-based servers. In this guide, we will cover **how to install and configure the AlmaLinux 8 LAMP Stack** in a comprehensive, detailed, and structured manner so you can implement it efficiently.


**LAMP** stands for four main software components used together to build and run web-based applications. The term is an acronym for:

- **L** = **Linux** (operating system)
- **A** = **Apache** (web server)
- **M** = **MySQL** or **MariaDB** (database)
- **P** = **PHP** (server-side programming language)

## Prerequisites

- Full `root` access
- Basic Linux Command Line
- Domain (optional)

## Preparation

:::danger
Make sure the firewall and SELinux have been adjusted or temporarily disabled if you want to avoid problems during the initial installation.
:::

Update the server and install the EPEL repository and some basic packages and tools needed to manage the server:
```
dnf update -y && dnf install epel-release -y
dnf update -y && dnf -y install git traceroute nmap bash-completion bc bmon bzip2 curl dmidecode ethtool htop ifstat iftop iotop make multitail nano bind-utils net-tools rsync screen sudo tree unzip wget yum-utils zip zlib-devel tar screen dnf-plugins-core sysstat
```

Time synchronization. This is very useful for systems or applications that will be hosted on this server. It's also useful for viewing logs and time synchronization:

```
timedatectl set-timezone Asia/Jakarta
```

## Install Apache

**Apache HTTP Server**, or simply Apache, is a **web server software** that accepts user requests via HTTP or HTTPS and then returns responses in the form of HTML pages, JSON data, or PHP script execution.

Apache is highly flexible due to its modular system that can be configured according to needs, such as support for SSL, URL rewriting, security, compression, and more.

Run the following command to install Apache:
```
dnf install httpd -y
```

Enable and check Apache service:
```
systemctl enable --now httpd
systemctl status httpd
```

Here is an example of the output:
```
● httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)
   Active: active (running) since Sat 2025-07-26 23:28:00 WIB; 683ms ago
     Docs: man:httpd.service(8)
 Main PID: 6133 (httpd)
   Status: "Started, listening on: port 80"
    Tasks: 213 (limit: 11142)
   Memory: 31.0M
```

## Install MariaDB

This time we'll install **MariaDB** as the database, but the LAMP Stack can also use MySQL. MariaDB is an increasingly popular extension of the native MySQL application with several performance advantages.

:::info 
To install MySQL instead of MariaDB, replace the first command with `dnf install mysql-server`, then follow the instructions. To run the `mysql_secure_installation` script in MySQL, first add a new password for the root account.
:::

MariaDB is available by default in the AlmaLinux base repository under the name **Appstream**. Run the following command to see the latest available MariaDB version:
```
dnf module list mariadb
```

Example output:
```
AlmaLinux 8 - AppStream
Name                                Stream                               Profiles                                               Summary                                   
mariadb                             10.3 [d]                             client, galera, server [d]                             MariaDB Module                            
mariadb                             10.5                                 client, galera, server [d]                             MariaDB Module                            
mariadb                             10.11                                client, galera, server [d]                             MariaDB Module                            

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```

The output above shows that the latest version of MariaDB is available, version 10.11. We will use the latest version of MariaDB by resetting the default module to use the latest version:
```
dnf module reset mariadb
```

Then run the following command to install the latest version of MariaDB:
```
dnf module install mariadb:10.11
```

Then enable the MariaDB service and check its status:
```
systemctl enable --now mariadb
systemctl status mariadb
```

Here is an example of the output:
```
● mariadb.service - MariaDB 10.11 database server
   Loaded: loaded (/usr/lib/systemd/system/mariadb.service; enabled; vendor preset: disabled)
   Active: active (running) since Sat 2025-07-26 23:45:20 WIB; 3s ago
     Docs: man:mysqld(8)
           https://mariadb.com/kb/en/library/systemd/
  Process: 7777 ExecStartPost=/usr/libexec/mysql-check-upgrade (code=exited, status=0/SUCCESS)
  Process: 7532 ExecStartPre=/usr/libexec/mysql-prepare-db-dir mariadb.service (code=exited, status=0/SUCCESS)
  Process: 7508 ExecStartPre=/usr/libexec/mysql-check-socket (code=exited, status=0/SUCCESS)
 Main PID: 7764 (mysqld)
   Status: "Taking your SQL requests now..."
    Tasks: 13 (limit: 11142)
   Memory: 208.7M
```

Before using it for production or testing, it is best to secure the MariaDB installation first by running the following command:
```
mysql_secure_installation
```

Then follow the instructions that appear:

- Enter current password for root (enter for none) → **[ENTER]**
- Switch to unix_socket authentication → **Y**
- Change the root password? → **Y**
- Remove anonymous users? → **Y**
- Disallow root login remotely? **Y**
- Remove test database and access to it? **Y**
- Reload privilege tables now? **Y**

With this step, the MariaDB server will be more secure from the basic configuration side.

To try the MySQL connection, please type the following command:
:::info
With UNIX auth there is no need to enter a password.
:::

```
mysql
```
Example output:
```
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 15
Server version: 10.11.10-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> quit
Bye
```

## Install PHP

PHP (Hypertext Preprocessor) is a server-side programming language that is crucial in this stack. We will install PHP 8 from the **Remi** Repository to use the latest version of PHP.

Run the following command to install the Remi Repository:
```
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
```

Then list the available PHP using the following command:
```
dnf module list php
```
Example output:
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

Check the installed PHP version:
```
php -v
```

Example output:
```
PHP 8.4.10 (cli) (built: Jul  2 2025 02:22:42) (NTS gcc x86_64)
Copyright (c) The PHP Group
Built by Remi's RPM repository <https://rpms.remirepo.net/> #StandWithUkraine
Zend Engine v4.4.10, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.10, Copyright (c), by Zend Technologies
```

## phpMyAdmin (optional)

To manage MariaDB/MySQL databases via the web, we need to install phpMyAdmin. This is a very popular PHP-based tool that makes it easy to manage databases without having to use the command line.

phpMyAdmin is not available directly in the official AlmaLinux repositories, but is available from EPEL/Remi:
```
dnf --enablerepo=remi install phpmyadmin
```

By default, phpMyAdmin is only accessible from localhost. If you want it to be accessible from a specific IP (for example, a local network), change the configuration:
```
nano /etc/httpd/conf.d/phpMyAdmin.conf
```
Change the following sections (default):
```jsx showLineNumbers title="etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require local
</Directory>
```

For example, it can be accessed by all IPs:
```jsx {4} showLineNumbers title="etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require all granted
</Directory>
```

Or only accessed by some IPs:
```jsx {4-5} showLineNumbers title="etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require ip 192.168.2.3
   Require ip 192.168.5.0/24
</Directory>
```

Restart Apache to save changes:
```
apachectl configtest
systemctl restart httpd
```

To access phpMyAdmin please enter the IP/domain `http://$DOMAIN/phpmyadmin`

## Virtualhost (optional)

If you use a domain and want to host multiple websites/domains on a server with a LAMP configuration, then you must use a virtual host.

Run the following command to create a virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Then fill in the following parameters and adjust the domain you want to use:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Create a virtualhost directory to store website assets and adjust permissions:

:::info
You can save or create your website files in the directory `/var/www/focusnic.biz.id/public_html`
:::

```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```

Restart Apache to save changes
```
apachectl configtest
systemctl restart httpd
```

## Testing the LAMP Stack

Once all services are installed and running, we can test Apache, MySQL, and PHP. We'll use the virtual host above and a simple PHP script to check the database connection and display the PHP version.

Create a database for testing:
```
mysql
```

Then run the following commands to create a user and database:
```
create database mydb;
create user 'myuser'@'localhost' identified by 'ZGS5lnI6MU3Fv2A1';
grant all on mydb.* to 'myuser'@'localhost';
flush privileges;
quit;
```

Then create a `lamp-test.php` file in the previously created virtualhost directory:
```
nano /var/www/focusnic.biz.id/public_html/lamp-test.php
```
Fill with the following script:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/lamp-test.php"
<?php
// config database
$host = 'localhost';
$user = 'myuser';
$password = 'ZGS5lnI6MU3Fv2A1';
$database = 'mydb';

// connect to database
$connection = new mysqli($host, $user, $password, $database);

// check connection
if ($connection->connect_error) {
    die("❌ database connection failed: " . $connection->connect_error);
} else {
    echo "<h2>✅ database connection success</h2>";
}

// show PHP
echo "<h3>PHP version: " . phpversion() . "</h3>";

// close connection
$connection->close();
?>
```

Then access via browser by typing `http://$NAMA_DOMAIN/lamp-test.php`
![](/img/almalinux8-lamp-stack-phptest.jpg)<br/>

## Troubleshooting

1. Apache cannot be accessed <br/>

- Make sure your firewall allows HTTP/HTTPS.
- Check your Apache configuration using `httpd -t`.

2. PHP is not executed, but is displayed as text <br/>

- Check that the PHP file is in the correct directory
- Ensure the PHP module is active and Apache is restarted

3. MariaDB cannot log in as root <br/>

- Use `mysql -u root -p` and check the permissions
- If necessary, reset the root password with `--skip-grant-tables`

## Conclusion

The **LAMP Stack on AlmaLinux 8** is a powerful and efficient solution for both website development and production. By following the installation and configuration steps above, we have successfully installed Apache, MariaDB, and PHP, setting them up optimally. Always ensure your server is up-to-date and secured with the appropriate configuration to maintain performance and stability.

Q: Is the LAMP Stack suitable for large-scale websites? <br/>
A: Yes, with the right configuration, the LAMP Stack is very stable and capable of handling large traffic.

Q: Which is better, MySQL or MariaDB? <br/>
A: MariaDB tends to be faster and opensource, and compatible with MySQL, so it is often the first choice.

Q: Can I add another domain with this configuration? <br/>
A: Yes, simply add a new VirtualHost for each domain.

Q: How can I further secure my server? <br/>
A: Use a firewall, SSL/TLS, disable SSH root login, and perform regular log audits.

Next advanced configuration references:
- VirtualHost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- SSL: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security#ssltls
- Multi PHP Version: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/multi-php
- Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- ModSecurity (WAF): https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
- Tuning (Optimasi Apache): https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/tuning
