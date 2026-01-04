---
title: LAMP Stack
description: Cara Install dan Konfigurasi LAMP Stack di AlmaLinux 8
sidebar_position: 18
sidebar_label: LAMP Stack
---

Dalam dunia pengembangan web, **LAMP Stack** (Linux, Apache, MySQL/MariaDB, dan PHP) merupakan fondasi utama yang sering digunakan untuk menjalankan aplikasi berbasis web. AlmaLinux 8 sebagai distribusi Linux berbasis Red Hat Enterprise Linux (RHEL) menawarkan stabilitas, keamanan, dan kinerja yang sangat andal, menjadikannya pilihan ideal untuk server berbasis LAMP. Dalam panduan ini, kita akan membahas **cara install dan konfigurasi LAMP Stack AlmaLinux 8** secara lengkap, rinci, dan terstruktur agar Anda dapat mengimplementasikannya secara efisien.


**LAMP** adalah singkatan dari empat komponen perangkat lunak utama yang digunakan secara bersamaan untuk membangun dan menjalankan aplikasi berbasis web. Istilah ini merupakan akronim dari:

- **L** = **Linux** (sistem operasi)
- **A** = **Apache** (web server)
- **M** = **MySQL** atau **MariaDB** (database)
- **P** = **PHP** (bahasa pemrograman server side)

## Prerequisite

- Akses full `root`
- Basic Linux Command Line
- Domain (opsional)

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Update server dan install repository EPEL dan beberapa paket serta tools basic yang diperlukan untuk mengelola server:
```
dnf update -y && dnf install epel-release -y
dnf update -y && dnf -y install git traceroute nmap bash-completion bc bmon bzip2 curl dmidecode ethtool htop ifstat iftop iotop make multitail nano bind-utils net-tools rsync screen sudo tree unzip wget yum-utils zip zlib-devel tar screen dnf-plugins-core sysstat
```

Sinkronisasi waktu. Hal ini sangat berguna untuk sistem atau aplikasi yang akan di hosting pada server ini. Selain itu berguna untuk melihat log, dan juga sinkronisasi waktu:

```
timedatectl set-timezone Asia/Jakarta
```

## Install Apache

**Apache HTTP Server** atau disingkat Apache adalah **perangkat lunak server web** yang bertugas menerima permintaan (request) dari pengguna melalui protokol HTTP atau HTTPS, kemudian mengirimkan kembali responsnya dalam bentuk halaman HTML, data JSON, atau hasil eksekusi skrip PHP.

Apache sangat fleksibel karena memiliki sistem modular yang dapat dikonfigurasi sesuai kebutuhan, seperti dukungan untuk SSL, rewrite URL, keamanan, kompresi, dan lain-lain.

Jalankan perintah berikut untuk menginstall Apache:
```
dnf install httpd -y
```

Aktifkan dan cek service Apache:
```
systemctl enable --now httpd
systemctl status httpd
```

Berikut contoh outputnya:
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

Kali ini kita akan menginstal **MariaDB** sebagai database,tetapi LAMP Stack juga dapat menggunakan MySQL. MariaDB merupakan pengembangan yang semakin populer dari aplikasi MySQL asli dengan beberapa keunggulan performa.

:::info 
Untuk menginstal MySQL, bukan MariaDB, ganti perintah pertama dengan `dnf install mysql-server`, lalu ikuti petunjuk selanjutnya. Untuk menjalankan skrip `mysql_secure_installation` di MySQL, pertama-tama tambahkan kata sandi baru untuk akun root.
:::

MariaDB secara default sudah tersedia pada base repository AlmaLinux dengan nama repository **Appstream**. Jalankan perintah berikut untuk melihat versi terbaru MariaDB yang tersedia:
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

Dari output diatas terlihat bahwa tersedia versi terbaru MariaDB yaitu versi 10.11. Kita akan menggunakan versi terbaru dari MariaDB dengan me-reset default module agar dapat menggunakan versi terbaru:
```
dnf module reset mariadb
```

Lalu jalankan perintah berikut untuk menginstall MariaDB versi terbaru:
```
dnf module install mariadb:10.11
```

Kemudian enable service MariaDB dan cek statusnya:
```
systemctl enable --now mariadb
systemctl status mariadb
```

Berikut contoh outputnya:
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

Sebelum digunakan untuk produksi atau testing, sebaiknya amankan terlebih dahulu instalasi MariaDB dengan menjalankan perintah berikut:
```
mysql_secure_installation
```

Kemudian ikuti petunjuk yang muncul:

- Enter current password for root (enter for none) → **[ENTER]**
- Switch to unix_socket authentication → **Y**
- Change the root password? → **Y**
- Remove anonymous users? → **Y**
- Disallow root login remotely? **Y**
- Remove test database and access to it? **Y**
- Reload privilege tables now? **Y**

Dengan langkah ini, server MariaDB akan lebih aman dari sisi konfigurasi dasar.

Untuk mencoba koneksi MySQL silahkan ketik perintah berikut:
:::info
Dengan UNIX auth maka tidak perlu memasukkan password.
:::

```
mysql
```
Contoh output:
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

PHP (Hypertext Preprocessor) merupakan bahasa pemrograman server-side yang sangat penting dalam stack ini. Kita akan menginstal PHP 8 dari **Remi** Repository agar dapat menggunakan versi terbaru dari PHP.

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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json
```

Periksa versi PHP yang terinstal:
```
php -v
```

Contoh output:
```
PHP 8.4.10 (cli) (built: Jul  2 2025 02:22:42) (NTS gcc x86_64)
Copyright (c) The PHP Group
Built by Remi's RPM repository <https://rpms.remirepo.net/> #StandWithUkraine
Zend Engine v4.4.10, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.10, Copyright (c), by Zend Technologies
```

## phpMyAdmin (opsional)

Agar kita bisa mengelola database MariaDB/MySQL melalui web, kita perlu menginstal phpMyAdmin. Ini adalah alat berbasis PHP yang sangat populer dan memudahkan kita mengelola database tanpa harus menggunakan command line.

phpMyAdmin tidak tersedia langsung di repositori resmi AlmaLinux, tetapi tersedia dari EPEL/Remi:
```
dnf --enablerepo=remi install phpmyadmin
```

Secara default, phpMyAdmin hanya bisa diakses dari localhost. Jika ingin bisa diakses dari IP tertentu (misalnya jaringan lokal), ubah konfigurasi:
```
nano /etc/httpd/conf.d/phpMyAdmin.conf
```
Ubah bagian berikut (default):
```jsx showLineNumbers title="etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require local
</Directory>
```

Misalnya dapat diakses oleh semua IP:
```jsx {4} showLineNumbers title="etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require all granted
</Directory>
```

Atau hanya diakses oleh beberapa IP:
```jsx {4-5} showLineNumbers title="etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require ip 192.168.2.3
   Require ip 192.168.5.0/24
</Directory>
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Untuk mengakses phpMyAdmin silahkan masukkan IP/domain `http://$DOMAIN/phpmyadmin`

## Virtualhost (opsional)

Jika menggunakan domain dan ingin menghosting banyak website/domain pada server dengan konfigurasi LAMP, maka Anda wajib menggunakan virtualhost.

Jalankan perintah berikut untuk membuat virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Kemudian isi parameter berikut dan sesuaikan domain yang ingin digunakan:
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

Buat direktori virtualhost untuk menyimpan asset website dan sesuaikan permission:

:::info
Anda dapat menyimpan atau membuat file website Anda pada direktori `/var/www/focusnic.biz.id/public_html`
:::

```
mkdir -p /var/www/focusnic.biz.id/public_html
chown -R apache:apache /var/www/focusnic.biz.id
```

Restart Apache untuk menyimpan perubahan
```
apachectl configtest
systemctl restart httpd
```

## Menguji LAMP Stack

Setelah semua layanan diinstal dan dijalankan, kita bisa menguji Apache, MySQL, dan juga PHP. Dengan menggunakan virtualhost diatas dan juga skrip PHP sederhana untuk melakukan pengecekan koneksi database dan juga menampilkan versi PHP.

Buat database untuk testing:
```
mysql
```

Lalu jalankan perintah berikut untuk membuat user dan database:
```
create database mydb;
create user 'myuser'@'localhost' identified by 'ZGS5lnI6MU3Fv2A1';
grant all on mydb.* to 'myuser'@'localhost';
flush privileges;
quit;
```

Kemudian buat file `lamp-test.php` pada direktori virtualhost yang sudah dibuat sebelumnya:
```
nano /var/www/focusnic.biz.id/public_html/lamp-test.php
```
Isi dengan skrip berikut:
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

Kemudian akses melalui browser dengan mengetik `http://$NAMA_DOMAIN/lamp-test.php`
![](/img/almalinux8-lamp-stack-phptest.jpg)<br/>

## Troubleshooting

1. Apache tidak bisa diakses <br/>

- Pastikan firewall sudah mengizinkan HTTP/HTTPS
- Periksa konfigurasi Apache, bisa menggunakan `httpd -t`

2. PHP tidak dijalankan, malah ditampilkan sebagai teks <br/>

- Cek apakah file PHP berada di direktori yang benar
- Pastikan modul PHP telah aktif dan Apache direstart

3. MariaDB tidak bisa login sebagai root <br/>

- Gunakan `mysql -u root -p` lalu periksa hak akses
- Jika perlu, reset password root dengan `--skip-grant-tables`


## Kesimpulan

**LAMP Stack di AlmaLinux 8** merupakan solusi yang kuat dan efisien untuk pengembangan maupun produksi situs web. Dengan mengikuti langkah demi langkah instalasi dan konfigurasi di atas, kita telah berhasil menginstal Apache, MariaDB, PHP, dan menyiapkannya secara optimal. Selalu pastikan server tetap up-to-date dan diamankan dengan konfigurasi yang sesuai agar performa dan stabilitas tetap terjaga.

Q: Apakah LAMP Stack cocok untuk website skala besar? <br/>
A: Ya, dengan konfigurasi yang tepat, LAMP Stack sangat stabil dan mampu menangani traffic besar.

Q: Mana yang lebih baik, MySQL atau MariaDB? <br/>
A: MariaDB cenderung lebih cepat dan opensource, serta kompatibel dengan MySQL, sehingga sering menjadi pilihan utama.

Q: Apakah bisa menambahkan domain lain dengan konfigurasi ini? <br/>
A: Bisa, cukup tambahkan VirtualHost baru untuk setiap domain.

Q: Bagaimana cara mengamankan server lebih lanjut? <br/>
A: Gunakan firewall, SSL/TLS, nonaktifkan root login SSH, dan lakukan audit log secara berkala.


Referensi konfigurasi lanjutan:
- VirtualHost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- SSL: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security#ssltls
- Multi PHP Version: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/multi-php
- Security: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- ModSecurity (WAF): https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
- Tuning (Optimasi Apache): https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/tuning
