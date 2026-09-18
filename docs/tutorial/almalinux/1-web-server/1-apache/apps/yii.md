---
title: Panduan Lengkap Cara Install PHP Framework Yii menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install PHP Framework Yii menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Yii
---

Framework **PHP Yii** adalah salah satu framework terbaik dan tercepat yang banyak digunakan untuk membangun aplikasi web modern. Untuk menjalankan Yii secara optimal, kita membutuhkan lingkungan server yang andal seperti **LAMP Stack** (Linux, Apache, MySQL/MariaDB, dan PHP). Dalam panduan ini, kita akan membahas secara **mendalam dan terstruktur** tentang **cara install framework PHP Yii menggunakan LAMP Stack di AlmaLinux 8**, mulai dari instalasi sistem dasar hingga uji coba aplikasi Yii berjalan dengan sukses.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Yii, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Yii

Sebelum menginstall Yii, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Yii) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/yiiapp/web

    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Lalu buat direktori pada virtualhost diatas:
```
mkdir -p /var/www/focusnic.biz.id
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
create database yii_db;
create user 'yii_user'@'localhost' identified by 'beTeOBAzd7bdY0H0';
grant all on yii_db.* to 'yii_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Yii seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
:::

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
PHP version 8.4.11 (/usr/bin/php)
```

Download file Yii dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Yii dan membuat project dengan nama `yiiapp` menggunakan composer:
:::info
Yii memiliki dua template aplikasi. Perbedaan utamanya adalah pada template advanced, yang sudah dilengkapi dengan fitur frontend dan backend, user register, serta restore/reset password yang lebih modular.
:::

```
cd /var/www/focusnic.biz.id/
composer create-project --prefer-dist --stability=stable yiisoft/yii2-app-basic yiiapp # yii basic
composer create-project --prefer-dist --stability=stable yiisoft/yii2-app-advanced yiiapp # yii advanced
```
Ubah beberapa parameter pada file berikut untuk koneksi database pada Yii:
```
nano /var/www/focusnic.biz.id/yiiapp/config/db.php
```
Sesuaikan dengan informasi database yang sudah dibuat sebelumnya termasuk db, username, dan password:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/yiiapp/config/db.php"
<?php

return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=localhost;dbname=yii_db',
    'username' => 'yii_user',
    'password' => 'beTeOBAzd7bdY0H0',
    'charset' => 'utf8',
];
```
Jalankan perintah berikut untuk populate atau db migration:
```
cd /var/www/focusnic.biz.id/yiiapp
php yii migrate
```
Jika konfigurasi berhasil, dan database dalam kondisi kosong (tanpa migration), maka akan muncul pesan:
```
Creating migration history table "migration"...Done.
No new migrations found. Your system is up-to-date.
```
Sesuaikan permission pada direktori Yii:
```
find /var/www/focusnic.biz.id/yiiapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/yiiapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi Yii melalui browser, misalnya: `http://focusnic.biz.id`. Jika instalasi berhasil, maka akan tampil default page dari Yii berikut
![](/img/almalinux8-lamp-apps-yii1.jpg)<br/>

## Troubleshooting

1. Error: SQLSTATE[HY000] [1045] Access denied for user <br/>

**Penyebab:** Username atau password salah, atau user belum diberi hak akses ke database.

**Solusi:** Periksa kembali konfigurasi di config/db.php. Pastikan username, password, dan nama database sesuai. Jalankan ulang perintah berikut:
```
GRANT ALL PRIVILEGES ON yii_db.* TO 'yii_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Error: could not find driver saat menjalankan `php yii migrate` <br/>

Biasanya disebabkan karena module `pdo_mysql` belum terinstall dengan benar. Jalankan perintah berikut untuk menginstallnya:
```
dnf install php-mysqlnd
```

3. Error: yii\db\Exception atau blank page saat akses dari browser <br/>

Masalah koneksi database atau kesalahan penulisan DSN. Pastikan DSN formatnya benar:
```
mysql:host=localhost;dbname=yiidb
```

## Kesimpulan

Instalasi framework PHP **Yii di AlmaLinux 8 menggunakan LAMP Stack** tidaklah sulit jika dilakukan dengan langkah yang tepat. Dengan kombinasi Apache, MariaDB, dan PHP yang dikonfigurasi secara benar, Yii dapat dijalankan secara efisien dan optimal. Penting juga untuk mengatur environment dan file permission sesuai standar keamanan produksi agar aplikasi tidak mudah dieksploitasi.

Q: Apakah Yii bisa berjalan di shared hosting? <br/>
A: Bisa, namun fitur tertentu seperti Redis, queue, atau advanced URL rewrite mungkin dibatasi oleh penyedia hosting.

Q: Apa perbedaan Yii basic dan advanced? <br/>
A: Versi basic cocok untuk aplikasi sederhana, sedangkan advanced memiliki struktur modular untuk proyek besar.

Q: Bagaimana saya tahu koneksi database berhasil? <br/>
A: Jalankan perintah berikut. Jika tidak muncul error, maka koneksi berhasil:
```
php yii migrate
```

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
