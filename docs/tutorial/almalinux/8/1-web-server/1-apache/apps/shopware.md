---
title: Panduan Lengkap Cara Install Shopware menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Shopware menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Shopware
---

**Shopware** merupakan salah satu platform e-commerce modern berbasis **PHP** yang menawarkan fleksibilitas tinggi, fitur lengkap, dan performa optimal. Untuk menjalankannya secara maksimal, diperlukan konfigurasi server yang tepat, salah satunya menggunakan **LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP)**. Pada panduan ini, kita akan membahas langkah demi langkah **cara install Shopware di AlmaLinux 8 menggunakan LAMP Stack** secara detail hingga siap digunakan di lingkungan produksi.

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

## Install Shopware

Sebelum menginstall Shopware versi 6 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Shopware) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/shopwareapp/public

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
mkdir -p /var/www/focusnic.biz.id/
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
create database shopware_db;
create user 'shopware_user'@'localhost' identified by 'g4bJ9u0opOiNKWbs';
grant all on shopware_db.* to 'shopware_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Shopware seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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
PHP version 8.4.10 (/usr/bin/php)
```

Download file Shopware dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Shopware dan membuat project dengan nama `shopwareapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id
composer create-project shopware/production shopwareapp
```
Tweak konfigurasi PHP `memory_limit` ke `512M`:
```
nano /etc/php.ini
```
Sesuaikan parameter berikut atau berikan komentar pada parameter berikut dan buat value baru:
```jsx showLineNumbers title="/etc/php.ini"
;memory_limit = 128M
memory_limit = 512M
```
Tweak konfigurasi PHP `opcache.memory_consumption` ke `256M`:
```
nano /etc/php.d/10-opcache.ini
```
Sesuaikan parameter berikut atau berikan komentar pada parameter berikut dan buat value baru:
```jsx showLineNumbers title="/etc/php.d/10-opcache.ini"
;opcache.memory_consumption=128
opcache.memory_consumption=256
```
Restart php-fpm untuk menyimpan perubahan:
```
systemctl restart php-fpm
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/shopwareapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/shopwareapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```
Akses instalasi Shopware melalui browser, misalnya: `http://focusnic.biz.id/installer` lalu klik "Next"
![](/img/almalinux8-lamp-apps-shopware1.jpg)<br/>
Pastikan requirements Shopware sudah terpenuhi seperti berikut
![](/img/almalinux8-lamp-apps-shopware2.jpg)<br/>
Setujui perjanjian lisensi Shopware
![](/img/almalinux8-lamp-apps-shopware3.jpg)<br/>
Isi informasi database yang sudah dibuat sebelumnya seperti db, username, dan password
![](/img/almalinux8-lamp-apps-shopware4.jpg)<br/>
Tunggu proses instalasi Shopware hingga selesai, lalu klik "Next"
![](/img/almalinux8-lamp-apps-shopware5.jpg)<br/>
Kemudian isi informasi Shopware dan user admin
![](/img/almalinux8-lamp-apps-shopware6.jpg)<br/>
Berikut adalah tampilan dashboard admin Shopware melalui `http://$DOMAIN/admin`
:::info
Pastikan untuk masuk ke halaman admin terlebih dahulu untuk setup Store Shopware agar Store Front dapat tampil dengan baik.
:::
![](/img/almalinux8-lamp-apps-shopware7.jpg)<br/>
Kemudian akses halaman store front Shopeware
![](/img/almalinux8-lamp-apps-shopware8.jpg)<br/>

## Troubleshooting

1. Akses Admin blank page <br/>

- Cek error log di `/var/log/httpd/focusnic.biz.id-error.log`
- Pastikan PHP extension lengkap

2. Instalasi tidak dapat dilanjutkan atau stuck pada parameter `memory_limit` <br/>

Berikut adalah solusinya. Tweak konfigurasi PHP `memory_limit` ke `512M`:
```
nano /etc/php.ini
```
Sesuaikan parameter berikut atau berikan komentar pada parameter berikut dan buat value baru:
```jsx showLineNumbers title="/etc/php.ini"
;memory_limit = 128M
memory_limit = 512M
```
Restart php-fpm:
```
systemctl restart php-fpm
```

3. 500 Internal Error pada Shopware <br/>

Pastikan folder dimiliki user web server `apache`:
```
find /var/www/focusnic.biz.id/shopwareapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/shopwareapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

## Kesimpulan

Proses instalasi **Shopware di AlmaLinux 8 menggunakan LAMP Stack** memerlukan konfigurasi yang tepat agar berjalan optimal. Mulai dari instalasi Apache, MariaDB, PHP, hingga konfigurasi virtual host, semuanya harus dilakukan dengan teliti untuk memastikan toko online Anda siap melayani pelanggan dengan cepat dan aman.

Q: Bisa install Shopware 6 tanpa Composer? <br/>
A: Bisa, dengan download paket ZIP dari Shopware, tapi update & dependency management lebih sulit.

Q: Apakah instalasi ini cocok untuk production? <br/>
A: Ya, asal menggunakan Apache/Nginx production setup, SSL aktif, dan permission file benar.

Q: Bisa langsung pakai HTTPS? <br/>
A: Bisa, pastikan sertifikat SSL sudah terpasang di server.

Q: Apakah wajib menggunakan Composer untuk Shopware 6? <br/>
A: Tidak wajib, tapi Composer memudahkan update dan instalasi dependensi.


Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
