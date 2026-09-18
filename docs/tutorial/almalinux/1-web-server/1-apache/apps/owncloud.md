---
title: Panduan Lengkap Cara Install ownCloud menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install ownCloud menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: ownCloud
---

**ownCloud** adalah salah satu platform **file sharing** dan **cloud storage** populer berbasis **open source** yang memungkinkan kita untuk menyimpan, mengelola, dan berbagi data secara aman. Dengan kombinasi **LAMP Stack** (Linux, Apache, MySQL/MariaDB, dan PHP) di **AlmaLinux 8**, kita dapat membangun solusi cloud pribadi yang handal, aman, dan bisa diakses dari mana saja.

Panduan ini akan membahas **instalasi ownCloud menggunakan LAMP Stack di AlmaLinux 8** secara **lengkap, terstruktur, dan detail** sehingga dapat diimplementasikan baik untuk kebutuhan pribadi maupun perusahaan.

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

:::info
Saat panduan ini dibuat, ownCloud v10 masih menggunakan PHP 7.4. Oleh karena itu, kami akan menginstal versi PHP 7.4 meskipun sudah mencapai EoL https://central.owncloud.org/t/announcement-owncloud-10-and-php-versions/40251.
:::

PHP (Hypertext Preprocessor) merupakan bahasa pemrograman server-side yang sangat penting dalam stack ini. Kita akan menginstal PHP 7.4 dari Remi Repository agar dapat menggunakan versi terbaru dari PHP.

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
Aktifkan modul PHP versi yang diinginkan. Misalnya, untuk PHP 7.4 jalankan perintah berikut:
```
dnf module reset php -y
dnf module enable php:remi-7.4 -y
```
Setelah repositori aktif, kita dapat melanjutkan dengan menginstal PHP beserta modul-modul penting yang umum digunakan:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix
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

## Install ownCloud

Sebelum menginstall ownCloud, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur ownCloud) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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

    <IfModule mod_dav.c>
      Dav off
    </IfModule>

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
create database owncloud_db;
create user 'owncloud_user'@'localhost' identified by 'rRPDBeJ5q1L6BZB8';
grant all on owncloud_db.* to 'owncloud_user'@'localhost';
flush privileges;
quit;
```

Download file ownCloud dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://download.owncloud.com/server/stable/owncloud-complete-latest.tar.bz2
tar -xf owncloud-complete-latest.tar.bz2 
mv owncloud/* .
mv owncloud/.htaccess .
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup ownCloud melalui `http://$DOMAIN`. Buat user untuk administrasi ownCloud, dan juga koneksi database yang telah dibuat sebelumnya

:::info
Untuk meningkatkan tingkat keamanan pada instalasi ownCloud, sangat disarankan untuk menyimpan direktori `data` di lokasi yang terpisah dari `public_html`. Dengan cara ini, Anda dapat melindungi data sensitif dari akses yang tidak sah melalui web.
:::

![](/img/almalinux8-lamp-apps-owncloud1.jpg)<br/>
Berikut adalah tampilan dashboard admin ownCloud
![](/img/almalinux8-lamp-apps-owncloud2.jpg)<br/>

## Troubleshooting

1. Error Permission Denied <br/>

Jika muncul error permission denied, pastikan folder ownCloud dimiliki oleh user apache dan permission sudah diatur dengan benar. Jalankan perintah berikut untuk mengatur permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. PHP Version Error <br/>

Karena instalasi Nextcloud 10 pada panduan kali ini masih menggunakan PHP 7.4. Maka, pastikan versi PHP sesuai yang direkomendasikan oleh ownCloud.

3. HTTP 500 Error <br/>

Periksa log error Apache di `/var/log/httpd/focusnic.biz.id-error.log`.

4. Cron Job Tidak Berjalan <br/>

Cron belum diatur atau user Apache tidak memiliki hak akses. Jalankan perintah berikut:
```
sudo crontab -u apache -e
```
Tambahkan parameter berikut:
```
*/5 * * * * php -f /var/www/focusnic.biz.id/public_html/cron.php
```

## Kesimpulan

Menggunakan **ownCloud di AlmaLinux 8 dengan LAMP Stack** memberikan kontrol penuh terhadap data pribadi maupun perusahaan. Proses instalasi melibatkan pemasangan Apache, MariaDB, PHP, serta konfigurasi ownCloud secara manual agar optimal.

Bagi Anda yang tidak ingin repot melakukan instalasi atau konfigurasi sendiri, **jangan ragu untuk menggunakan layanan Focusnic** yang menyediakan **jasa install server dan cloud VPS** profesional, cepat, dan aman.

Q: Apakah ownCloud gratis digunakan? <br/>
A: Ya, ownCloud memiliki versi komunitas yang gratis dan open source.

Q: Berapa versi PHP yang didukung ownCloud? <br/>
A: ownCloud mendukung PHP 7.4 hingga versi terbaru yang stabil sesuai dokumentasi resmi.

Q: Apakah ownCloud bisa diakses dari smartphone? <br/>
A: Ya, ownCloud memiliki aplikasi mobile resmi untuk Android dan iOS.

Q: Apakah bisa migrasi ownCloud dari server lama ke baru? <br/>
Bisa, dengan memindahkan file data dan database lalu mengatur ulang konfigurasi.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
