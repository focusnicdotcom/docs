---
title: Complete Guide on How to Install Magento Using LAMP Stack on AlmaLinux 8
description: Complete Guide on How to Install Magento Using LAMP Stack on AlmaLinux 8
sidebar_label: Magento
---

Magento is one of the world's most popular and powerful **open source** e-commerce platforms, suitable for small to large-scale online stores. In this guide, we will cover in depth **how to install Magento with a LAMP Stack (Linux, Apache, MySQL, PHP)** on **AlmaLinux 8**, a stable RHEL distribution ideal for production servers.

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

## Install Elasticsearch

Magento 2.4+ uses OpenSearch or Elasticsearch as the default search engine. However, before installing Elasticsearch, we'll install OpenJDK 11 (Java):
```
dnf install java-11-openjdk -y
```
Verify Java installation
```
java -version
```
Output example
```
openjdk version "11.0.25" 2024-10-15 LTS
OpenJDK Runtime Environment (Red_Hat-11.0.25.0.9-1) (build 11.0.25+9-LTS)
OpenJDK 64-Bit Server VM (Red_Hat-11.0.25.0.9-1) (build 11.0.25+9-LTS, mixed mode, sharing)
```
Add the Elasticsearch repository version 7.17.x to be compatible with Magento version 2.4.x. Run the following command:
```
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch

cat <<EOF | sudo tee /etc/yum.repos.d/elasticsearch.repo
[elasticsearch-7.x]
name=Elasticsearch repository for 7.x packages
baseurl=https://artifacts.elastic.co/packages/7.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
EOF
```
Then install Elasticsearch with the following command:
```
dnf install elasticsearch -y
```
Enable service Elasticsearch:
```
systemctl enable --now elasticsearch
```
Then test the Elasticsearch connection with the following command:
```
curl -X GET http://localhost:9200
```
Output example:
```
{
  "name" : "localhost.localdomain",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "72CpnzboRvOQqcoN1Oyq7g",
  "version" : {
    "number" : "7.17.29",
    "build_flavor" : "default",
    "build_type" : "rpm",
    "build_hash" : "580aff1a0064ce4c93293aaab6fcc55e22c10d1c",
    "build_date" : "2025-06-19T01:37:57.847711500Z",
    "build_snapshot" : false,
    "lucene_version" : "8.11.3",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```
## Install Magento

Before installing Magento, we'll first create a virtual host and database. Run the following command to create a virtual host:
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
mariadb
```

Then run the following command to create a database, user, and password:
```
create database magento_db;
create user 'magento_user'@'localhost' identified by 'pBpEWfEVOOdk9GP9';
grant all on magento_db.* to 'magento_user'@'localhost';
flush privileges;
quit;
```

Download composer and install it with the following command:
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
Download the Magento file and place it in the appropriate directory on the virtual host:
```
cd /var/www/focusnic.biz.id/public_html
wget https://github.com/magento/magento2/archive/refs/tags/2.4.8-p1.zip
unzip 2.4.8-p1.zip
mv magento2-2.4.8-p1/* .
```
Install packages or dependencies required by Magento using Composer:
```
cd /var/www/focusnic.biz.id/public_html
composer update
composer install
```
Adjust permissions:
```
cd /var/www/focusnic.biz.id/public_html
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +
chmod u+x bin/magento
chown -R apache:apache /var/www/focusnic.biz.id
```
Then install Magento using the following command and adjust the following parameters including domain, user, and password:
```
cd /var/www/focusnic.biz.id/public_html
bin/magento setup:install \
--base-url=http://"focusnic.biz.id" \
--db-host=localhost \
--db-name="magento_db" \
--db-user="magento_user" \
--db-password="pBpEWfEVOOdk9GP9" \
--admin-firstname="Admin" \
--admin-lastname="Focusnic" \
--admin-email="admin@focusnic.biz.id" \
--admin-user="admin" \
--admin-password="Admin123!" \
--language=id_ID \
--currency=IDR \
--timezone="Asia/Jakarta" \
--use-rewrites=1 \
--cleanup-database
```
Output example:
```
[SUCCESS]: Magento installation complete.
[SUCCESS]: Magento Admin URI: /admin_ckqrrht
Nothing to import.
```
Access the Magento installation via a browser, for example: `http://focusnic.biz.id`

:::info
If Magento won't open, make sure the `.htaccess` file is present in `public_html`. If not, add the following rewrite:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/.htaccess"
RewriteEngine on
RewriteCond %{REQUEST_URI} !^/pub/
RewriteCond %{REQUEST_URI} !^/setup/
RewriteCond %{REQUEST_URI} !^/update/
RewriteCond %{REQUEST_URI} !^/dev/
RewriteRule .* /pub/$0 [L]
DirectoryIndex index.php
```
:::

![](/img/almalinux8-lamp-apps-magento1.jpg)<br/>
Here is the admin area page, enter the password that was created previously and also the Admin URI of each installation that is generated will be different.
![](/img/almalinux8-lamp-apps-magento2.jpg)<br/>
## Troubleshooting

1. 500 Internal Server Error <br/>
Make sure the permissions and `.htaccess` configuration are correct.

2. PHP Memory Limit <br/>
Increase the limit by editing `/etc/php.ini` and set memory_limit = 2G.

3. Could not validate a connection to the Elasticsearch. No alive nodes found in your cluster <br/>
Cause: Elasticsearch is not running, is configured incorrectly, or the port is closed. Make sure Elasticsearch is installed.

4. Error: .htaccess not working or URL still contains index.php <br/>
Make sure the directory in Apache allows overriding:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id"
<Directory /var/www/focusnic.biz.id/public_html>
    AllowOverride All
</Directory>
```
Re-download the .htaccess file from the Magento Github repo if it was deleted.

## Conclusion

The Magento installation process described above is quite lengthy, but it's well worth the effort to build an online store with comprehensive features and the ability to expand in the future. By using the **LAMP Stack on AlmaLinux 8**, we get a stable, secure, and high-performance system combination to run Magento optimally.

Q: Can Magento run on shared hosting? <br/>
A: Not recommended. Magento requires high resources, so it's better to use a VPS or dedicated server.

Q: Can you use Nginx? <br/>
A: Yes. However, in this guide, we'll focus on Apache because of its higher compatibility for beginners.

Q: What are alternative databases to MariaDB? <br/>
A: You can use MySQL Community Edition, but MariaDB is already very compatible.

Q: Is Elasticsearch required for Magento 2.4? <br/>
A: Yes. Starting with Magento 2.4 and above, Elasticsearch (or OpenSearch) is a required component. Without it, the installation will fail.

Q: I've installed everything, but the Magento page is still blank. Why? <br/>
A: Try running the following command:
```
cd /var/www/focusnic.biz.id/public_html
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:clean
bin/magento cache:flush
```

Check file permissions:
```
cd /var/www/focusnic.biz.id/public_html
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +
chmod u+x bin/magento
chown -R apache:apache /var/www/focusnic.biz.id
```

Further References:
- SSL and Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
