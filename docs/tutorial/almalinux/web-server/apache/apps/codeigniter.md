---
title: Panduan Lengkap Cara Install PHP Framework CodeIgniter menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install PHP Framework CodeIgniter menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: CodeIgniter
---

CodeIgniter adalah salah satu **framework PHP** paling populer dan powerfull yang digunakan secara luas untuk membangun aplikasi web modern, cepat, dan aman. Dalam panduan ini, kita akan membahas secara menyeluruh **cara menginstal CodeIgniter menggunakan LAMP (Linux, Apache, MySQL/MariaDB, PHP) Stack di AlmaLinux 8**, sebuah distribusi Linux berbasis Red Hat Enterprise Linux (RHEL) yang sangat stabil untuk keperluan produksi.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi CodeIgniter, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install CodeIgniter

Sebelum menginstall CodeIgniter versi 4 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur CodeIgniter) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/ciapp/public

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
create database ci_db;
create user 'ci_user'@'localhost' identified by 'EkZx5OIslz59uTe4';
grant all on ci_db.* to 'ci_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen CodeIgniter seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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

Download file CodeIgniter dan letakkan pada direktori sesuai virtualhost, kita akan mendownload CodeIgniter dan membuat project dengan nama `ciapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id/
composer create-project codeigniter4/appstarter ciapp
cd ciapp
cp env .env
```
Ubah beberapa parameter pada file `.env` untuk koneksi database pada CodeIgniter:
```
nano /var/www/focusnic.biz.id/ciapp/.env
```
Sesuaikan dengan informasi database yang sudah dibuat sebelumnya termasuk db, username, dan password. Untuk `app.baseURL` silahkan isi IP atau domain yang valid:
```
CI_ENVIRONMENT = development
app.baseURL = 'http://focusnic.biz.id'
database.default.hostname = localhost
database.default.database = ci_db
database.default.username = ci_user
database.default.password = EkZx5OIslz59uTe4
database.default.DBDriver = MySQLi
database.default.port = 3306
```
Sesuaikan permission pada direktori CodeIgniter:
```
find /var/www/focusnic.biz.id/ciapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/ciapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi CodeIgniter melalui browser, misalnya: `http://focusnic.biz.id`. Jika instalasi berhasil, maka akan tampil default page dari CodeIgniter berikut
![](/img/almalinux8-lamp-apps-codeigniter1.jpg)<br/>

## Trobleshooting

1. Page not found atau 404 error saat membuka halaman utama <br/>

Pastikan direktori root Apache mengarah ke `public/` milik CodeIgniter dan `.htaccess` aktif.

2. Permission denied pada folder writable <br/>

Pastikan `apache` adalah owner dan folder memiliki permission 775.

3.Koneksi Database Gagal (Error: Unable to connect to your database) <br/>

Username, password, atau nama database salah. Pastikan membuat database dan menguji secara manual:
```
mariadb -u ci_user -p
```

4. PHP Extension Tidak Lengkap <br/>

Beberapa ekstensi PHP yang dibutuhkan belum terinstal (seperti mbstring, intl, pdo, dll). Instal semua ekstensi yang dibutuhkan:
```
dnf install php-mbstring php-intl php-pdo php-mysqlnd
systemctl restart httpd php-fpm
```

## Kesimpulan 

Dengan mengikuti langkah-langkah detail di atas, kita telah berhasil menginstal framework **CodeIgniter** secara lengkap di atas **LAMP Stack** berbasis **AlmaLinux 8**. Kombinasi ini memberikan performa tinggi, stabilitas, serta kemudahan dalam pengembangan aplikasi berbasis PHP. Konfigurasi ini sangat cocok untuk digunakan di server produksi maupun pengembangan.

Q: Apakah saya bisa menggunakan Nginx sebagai pengganti Apache? <br/>
A: Ya, CodeIgniter dapat dijalankan di atas Nginx, namun konfigurasi berbeda. Panduan ini fokus pada LAMP Stack dengan Apache.

Q: Bagaimana cara menampilkan error detail saat development? <br/>
A: Ubah environment di file `.env`:
```
CI_ENVIRONMENT = development
```

Q: Apa perbedaan antara direktori `app/`, `public/`, dan `writable/` di CodeIgniter? <br/>
A:

- `app/`: berisi kode utama aplikasi (controller, model, konfigurasi).
- `public/`: root yang diakses web browser, tempat index.php berada.
- `writable/`: tempat log, cache, dan file sementara.

Q: Apakah CodeIgniter 4 kompatibel dengan PHP 8? <br/>
A: Ya, CodeIgniter 4 dirancang untuk bekerja dengan baik pada PHP 7.4 hingga 8.x.

Q: Apa yang harus dilakukan jika saya ingin mempublikasikan aplikasi ke internet? <br/>
A: Anda perlu mengatur domain, SSL (HTTPS), serta keamanan tambahan.

Q: Bagaimana cara mengupdate CodeIgniter ke versi terbaru? <br/>
A: Jika Anda menggunakan Composer jalankan perintah berikut:
```
composer update
```

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity

