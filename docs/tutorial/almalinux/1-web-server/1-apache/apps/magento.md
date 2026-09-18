---
title: Panduan Lengkap Cara Install Magento Menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Magento Menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Magento
---

Magento merupakan salah satu platform e-commerce **open source** yang paling populer dan kuat di dunia, cocok untuk toko online skala kecil hingga besar. Pada panduan kali ini, kita akan membahas secara mendalam dan terperinci **cara menginstal Magento dengan LAMP Stack (Linux, Apache, MySQL, PHP)** pada sistem operasi **AlmaLinux 8**, distribusi turunan dari RHEL yang stabil dan ideal untuk server produksi.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai proses instalasi, pastikan bahwa server AlmaLinux 8 telah diperbarui ke versi terbaru. Gunakan perintah berikut untuk memastikan sistem telah menggunakan paket terbaru:
```
dnf update -y
dnf install epel-release -y
```

### Install Apache

Apache adalah web server yang andal dan digunakan secara luas dalam lingkungan produksi. Untuk menginstalnya, jalankan perintah berikut:
```
dnf install httpd -y
```
Setelah instalasi selesai, aktifkan dan mulai layanan Apache dengan perintah berikut:
```
systemctl enable --now httpd
```
Untuk mengizinkan akses ke server melalui HTTP dan HTTPS, izinkan firewall:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

### Install PHP

PHP (Hypertext Preprocessor) merupakan bahasa pemrograman server-side yang sangat penting dalam stack ini. Kita akan menginstal PHP 8 dari Remi Repository agar dapat menggunakan versi terbaru dari PHP.

Jalankan perintah berikut untuk menginstall Remi Repository:
```
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
```
Kemudian list PHP yang tersedia menggunakan perintah berikut:
```
dnf module list php
```
Contoh ouput:
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
Aktifkan modul PHP versi yang diinginkan. Misalnya, untuk PHP 8.4 jalankan perintah berikut:
```
dnf module reset php -y
dnf module enable php:remi-8.4 -y
```
Setelah repositori aktif, kita dapat melanjutkan dengan menginstal PHP beserta modul-modul penting yang umum digunakan:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath
```
Periksa versi PHP yang terinstal dengan perintah berikut:
```
php -v
```

### Install MariaDB

MariaDB merupakan pengganti dari MySQL dan kompatibel untuk aplikasi berbasis MySQL. Jalankan perintah berikut untuk menginstalnya:
```
dnf module list mariadb
```
Contoh output:
```
AlmaLinux 8 - AppStream
Name                                Stream                               Profiles                                               Summary                                   
mariadb                             10.3 [d]                             client, galera, server [d]                             MariaDB Module                            
mariadb                             10.5                                 client, galera, server [d]                             MariaDB Module                            
mariadb                             10.11                                client, galera, server [d]                             MariaDB Module                            

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```
Dari output diatas terlihat bahwa tersedia versi default yang tersedia MariaDB yaitu versi 10.11 (terbaru dari bawaan OS). Namun, kita akan menggunakan MariaDB versi 11.4.7 dengan menggunakan repository resmi https://mariadb.org/download/ lalu reset mariadb agar tidak menggunakan default repository dari OS:
```
dnf module reset mariadb
```
Jalankan perintah berikut untuk menambahkan repository MariaDB versi 11.4.7:
```
nano /etc/yum.repos.d/MariaDB.repo
```
Tambahkan parameter berikut:
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
Lalu jalankan perintah berikut untuk menginstall MariaDB:
```
dnf install MariaDB-server MariaDB-client
```
Enable dan aktifkan service MariaDB:
```
systemctl enable --now mariadb
systemctl status mariadb
```
Sebelum digunakan untuk produksi atau testing, sebaiknya amankan terlebih dahulu instalasi MariaDB dengan menjalankan perintah berikut:
```
mariadb-secure-installation
```
Kemudian ikuti petunjuk yang muncul:

- Enter current password for root (enter for none) → **[ENTER]**
- Switch to unix_socket authentication → **Y**
- Change the root password? → **Y**
- Remove anonymous users? → **Y**
- Disallow root login remotely? **Y**
- Remove test database and access to it? **Y**
- Reload privilege tables now? **Y**

## Install Elasticsearch

Magento 2.4+ menggunakan OpenSearch atau Elasticsearch sebagai search engine default. Namun, sebelum melakukan instalasi Elasticsearch, kita akan menginstall OpenJDK 11 (Java):
```
dnf install java-11-openjdk -y
```
Verifikasi instalasi Java
```
java -version
```
Contoh output:
```
openjdk version "11.0.25" 2024-10-15 LTS
OpenJDK Runtime Environment (Red_Hat-11.0.25.0.9-1) (build 11.0.25+9-LTS)
OpenJDK 64-Bit Server VM (Red_Hat-11.0.25.0.9-1) (build 11.0.25+9-LTS, mixed mode, sharing)
```
Tambahkan repository Elasticsearch versi 7.17.x agar kompatibel dengan Magento versi 2.4.x. Jalankan perintah berikut:
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
Kemudian install Elasticsearch dengan perintah berikut:
```
dnf install elasticsearch -y
```
Enable service Elasticsearch:
```
systemctl enable --now elasticsearch
```
Lalu test koneksi Elasticsearch dengan perintah berikut:
```
curl -X GET http://localhost:9200
```
Contoh output:
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

Sebelum menginstall Magento, kita akan membuat virtualhost dan database terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
:::info
Pastikan menggunakan domain yang valid (FQDN) dan juga DNS A record sudah di arahkan atau di pointing sesuai dengan IP server yang digunakan pada server.
:::

```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi parameter berikut:
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

Lalu buat direktori pada virtualhost diatas:
```
mkdir -p /var/www/focusnic.biz.id/public_html
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Buat database dengan menjalankan perintah berikut:
```
mariadb
```

Lalu jalankan perintah berikut untuk membuat database, user, dan password:
```
create database magento_db;
create user 'magento_user'@'localhost' identified by 'pBpEWfEVOOdk9GP9';
grant all on magento_db.* to 'magento_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:
```
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```
Cek versi composer:
```
composer --version
```
Contoh output:
```
Composer version 2.8.10 2025-07-10 19:08:33
PHP version 8.4.10 (/usr/bin/php)
```
Download file Magento dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://github.com/magento/magento2/archive/refs/tags/2.4.8-p1.zip
unzip 2.4.8-p1.zip
mv magento2-2.4.8-p1/* .
```
Install paket atau dependensi yang diperlukan oleh Magento menggunakan Composer:
```
cd /var/www/focusnic.biz.id/public_html
composer update
composer install
```
Sesuaikan permission:
```
cd /var/www/focusnic.biz.id/public_html
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +
chmod u+x bin/magento
chown -R apache:apache /var/www/focusnic.biz.id
```
Kemudian install Magento menggunakan perintah berikut dan sesuaikan parameter berikut termasuk domain, user, dan password:
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
Contoh output:
```
[SUCCESS]: Magento installation complete.
[SUCCESS]: Magento Admin URI: /admin_ckqrrht
Nothing to import.
```
Akses instalasi Magento melalui browser, misalnya: `http://focusnic.biz.id`

:::info
Jika Magento tidak bisa dibuka, pastikan file `.htaccess` sudah ada pada `public_html`. Jika belum silahkan tambahkan rewrite berikut:
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
Berikut halaman admin area, masukkan password yang sudah dibuat sebelumnya dan juga Admin URI dari masing-masing instalasi yang dihasilkan akan berbeda
![](/img/almalinux8-lamp-apps-magento2.jpg)<br/>
## Troubleshooting

1. 500 Internal Server Error <br/>
Pastikan permission dan konfigurasi `.htaccess` sudah benar.

2. PHP Memory Limit <br/>
Tingkatkan limit dengan mengedit `/etc/php.ini` dan set memory_limit = 2G.

3. Could not validate a connection to the Elasticsearch. No alive nodes found in your cluster <br/>
Penyebab: Elasticsearch belum berjalan, konfigurasi salah, atau port tertutup. Pastikan untuk menginstall Elasticsearch.

4. Error: .htaccess not working atau URL masih mengandung index.php <br/>
Pastikan direktori di Apache mengizinkan override:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id"
<Directory /var/www/focusnic.biz.id/public_html>
    AllowOverride All
</Directory>
```
Unduh ulang file .htaccess dari repo Github Magento jika terhapus.

## Kesimpulan

Proses instalasi Magento di atas memang cukup panjang, namun sangat layak dilakukan untuk membangun toko online dengan fitur yang lengkap dan dapat dikembangkan di masa depan. Dengan menggunakan **LAMP Stack pada AlmaLinux 8**, kita mendapatkan kombinasi sistem yang stabil, aman, dan performa tinggi untuk menjalankan Magento secara optimal.

Q: Apakah Magento bisa berjalan di shared hosting? <br/>
A: Tidak disarankan. Magento memerlukan resource tinggi, jadi lebih baik gunakan VPS atau dedicated server.

Q: Apakah bisa menggunakan Nginx? <br/>
A: Bisa. Namun dalam panduan ini kita fokus menggunakan Apache karena kompatibilitas yang lebih tinggi untuk pemula.

Q: Apa alternatif database selain MariaDB? <br/>
A: Anda bisa menggunakan MySQL Community Edition, namun MariaDB sudah sangat kompatibel.

Q: Apakah Elasticsearch wajib di Magento 2.4? <br/>
A: Ya. Mulai Magento 2.4 ke atas, Elasticsearch (atau OpenSearch) adalah komponen wajib. Tanpa itu, instalasi akan gagal.

Q: Saya sudah install semua tapi halaman Magento masih kosong, kenapa? <br/>
A: Coba jalankan perintah berikut:

```
cd /var/www/focusnic.biz.id/public_html
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:clean
bin/magento cache:flush
```

Cek permission file:
```
cd /var/www/focusnic.biz.id/public_html
find var generated vendor pub/static pub/media app/etc -type f -exec chmod g+w {} +
find var generated vendor pub/static pub/media app/etc -type d -exec chmod g+ws {} +
chmod u+x bin/magento
chown -R apache:apache /var/www/focusnic.biz.id
```

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
