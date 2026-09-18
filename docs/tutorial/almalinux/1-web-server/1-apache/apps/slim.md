---
title: Panduan Lengkap Cara Install PHP Framework Slim menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install PHP Framework Slim menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Slim
---

Framework **PHP Slim** merupakan salah satu micro-framework yang ringan, cepat, dan efisien untuk membangun aplikasi web serta API berbasis RESTful. Dalam panduan ini, kita akan membahas secara **komprehensif, terstruktur, dan mendalam** tentang bagaimana cara **menginstall Slim Framework** menggunakan **LAMP Stack (Linux, Apache, MySQL, PHP)** di sistem operasi **AlmaLinux 8**, sebuah distro enterprise yang menjadi penerus dari CentOS.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Slim, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Slim

Sebelum menginstall Slim, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Slim) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
:::info
Karena Slim Framework bersifat minimalis, ia tidak memiliki ORM atau koneksi database bawaan seperti Laravel atau Symfony.
:::

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
    DocumentRoot /var/www/focusnic.biz.id/slimapp/public

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

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Slim seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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

Download file Slim dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Slim dan membuat project dengan nama `slimapp` menggunakan composer:

```
cd /var/www/focusnic.biz.id/
composer create-project slim/slim-skeleton slimapp
```
Sesuaikan permission pada direktori Slim:
```
find /var/www/focusnic.biz.id/slimapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/slimapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi Slim melalui browser, misalnya: `http://focusnic.biz.id`. Jika instalasi berhasil, maka akan tampil default page dari Slim berikut <br/>
![](/img/almalinux8-lamp-apps-slim1.jpg)<br/>

## Troubleshooting

1. 404 Not Found <br/>
Pastikan `mod_rewrite` Apache diaktifkan dan `.htaccess` digunakan.

2. Slim Tidak Menanggapi <br/>
Pastikan file `index.php` ditulis dengan benar dan dependency melalui Composer berhasil diinstall.

3. Permission Denied <br/>
Pastikan direktori milik user Apache `apache:apache` atau telah di-chown ke user Anda.

4. Error Autoload <br/>
Jalankan ulang composer install jika file vendor hilang.

## Kesimpulan

Framework PHP Slim memberikan solusi **cepat, ringan, dan powerful** untuk membangun aplikasi berbasis web dan API. Dengan mengikuti panduan lengkap ini, kita telah berhasil menginstall **Slim Framework menggunakan LAMP Stack di AlmaLinux 8** dengan konfigurasi yang **optimal dan aman**.

Langkah demi langkah mulai dari pemasangan LAMP, Composer, hingga konfigurasi virtual host Apache dijelaskan secara **mendetail dan sistematis** agar siapa pun, bahkan pemula, dapat mengikuti tanpa hambatan.

Q: Apakah Slim Framework cocok untuk aplikasi besar? <br/>
A: Slim dirancang sebagai micro-framework, namun dengan arsitektur modular, sangat memungkinkan digunakan pada aplikasi besar dengan tambahan komponen eksternal.

Q: Apakah bisa menggunakan Nginx? <br/>
A: Ya, Slim dapat dijalankan di atas Nginx, namun dalam panduan ini difokuskan pada penggunaan Apache sebagai bagian dari LAMP Stack.

Q: Apakah Composer wajib digunakan? <br/>
A: Wajib. Composer adalah dependency manager utama dalam ekosistem PHP modern, termasuk Slim.

Q: Bagaimana deployment ke production? <br/>
A: Gunakan domain valid, aktifkan HTTPS, optimalkan konfigurasi Apache, dan jalankan aplikasi di bawah mode production.

Q: Apakah AlmaLinux cocok untuk produksi? <br/>
A: Sangat cocok. AlmaLinux merupakan penerus CentOS yang stabil dan didukung komunitas enterprise.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
