---
title: Panduan Lengkap Cara Install SuiteCRM menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install SuiteCRM  menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: SuiteCRM
---

SuiteCRM merupakan salah satu **Customer Relationship Management (CRM)** berbasis open source yang sangat populer karena fleksibilitas dan fitur yang lengkap. Dengan menggunakan **SuiteCRM**, perusahaan dapat mengelola data pelanggan, otomatisasi penjualan, kampanye pemasaran, serta layanan pelanggan dengan lebih efisien. Pada artikel ini akan dibahas secara detail bagaimana cara melakukan **instalasi SuiteCRM di AlmaLinux 8 menggunakan LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP)**.

Dengan mengikuti panduan ini, Anda dapat membangun server CRM yang stabil, aman, dan siap digunakan untuk kebutuhan bisnis.

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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap php-ldap
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

## Install SuiteCRM

Sebelum menginstall SuiteCRM, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur SuiteCRM) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/suitecrmapp/public

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
mkdir -p /var/www/focusnic.biz.id/suitecrmapp
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Ubah konfigurasi `memory_limit` dan `upload_max_filesize` pada PHP.ini:
```
nano /etc/php.ini
```
Sesuikan dengan parameter berikut:
```jsx showLineNumbers title="/etc/php.ini"
upload_max_filesize = 20M
memory_limit = 256M
```
Lalu restart `php-fpm` untuk menyimpan perubahan dengan perintah berikut:
```
systemctl restar php-fpm
```
Buat database dengan menjalankan perintah berikut:
```
mariadb
```

Lalu jalankan perintah berikut untuk membuat database, user, dan password:
```
create database suitecrm_db;
create user 'suitecrm_user'@'localhost' identified by 'cTcJMQUff5jANn46';
grant all on suitecrm_db.* to 'suitecrm_user'@'localhost';
flush privileges;
quit;
```

Download file SuiteCRM dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/suitecrmapp
wget https://github.com/SuiteCRM/SuiteCRM-Core/releases/download/v8.8.1/SuiteCRM-8.8.1.zip
unzip SuiteCRM-8.8.1.zip
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/suitecrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/suitecrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup SuiteCRM melalui `http://$DOMAIN`. SuiteCRM akan melakukan pengecekan pada server-side sebelum melakukan proses instalasi. Pastikan PHP, Server, dan Permission sudah dalam keadaan *checklist*
![](/img/almalinux8-lamp-apps-suitecrm1.jpg)<br/>
Buat user untuk administrasi SuiteCRM, dan juga koneksi database yang telah dibuat sebelumnya
![](/img/almalinux8-lamp-apps-suitecrm2.png)<br/>
Berikut adalah tampilan dashboard SuiteCRM. Silahkan akses melalui `http://$DOMAIN/#/Login`
![](/img/almalinux8-lamp-apps-suitecrm3.png)<br/>

## Troubleshooting

1. Error 500 Internal Server SuiteCRM<br/>

Permission direktori SuiteCRM salah atau modul Apache belum aktif. Jalankan perintah berikut untuk memperbaiki permission:
```
find /var/www/focusnic.biz.id/suitecrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/suitecrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. SuiteCRM Lambat Saat di Akses <br/>

OPcache belum diaktifkan atau server resource terbatas. Aktifkan OPcache di file `/etc/php.d/10-opcache.ini` dan tambah resource server (RAM/CPU).

3. SuiteCRM Email Not Working <br/>

Pastikan pengaturan SMTP di Admin > Email Settings sesuai dengan server email Anda.

## Kesimpulan

Instalasi **SuiteCRM di AlmaLinux 8 menggunakan LAMP Stack** adalah solusi terbaik untuk perusahaan yang membutuhkan sistem CRM open source dengan fitur lengkap, fleksibel, dan hemat biaya. Dengan konfigurasi yang tepat pada **Apache, MariaDB, dan PHP**, sistem SuiteCRM dapat berjalan dengan lancar dan siap digunakan untuk menunjang kebutuhan bisnis sehari-hari.

Q: Apa itu SuiteCRM? <br/>
A: SuiteCRM adalah software Customer Relationship Management (CRM) open source yang dapat digunakan untuk mengelola pelanggan, penjualan, pemasaran, dan layanan purna jual.

Q: Apakah SuiteCRM gratis digunakan? <br/>
A: Ya, SuiteCRM adalah open source dan dapat digunakan secara gratis. Namun, ada juga opsi dukungan berbayar jika perusahaan membutuhkan support resmi.

Q: Apakah SuiteCRM bisa diintegrasikan dengan email? <br/>
A: Bisa. SuiteCRM mendukung integrasi dengan SMTP server seperti Gmail, Microsoft Exchange, atau server email perusahaan.

Q: Apakah saya bisa menggunakan Nginx daripada Apache? <br/>
A: Bisa, tetapi instalasi default SuiteCRM lebih mudah menggunakan Apache. Jika ingin menggunakan Nginx, perlu penyesuaian konfigurasi.

Q: Apakah SuiteCRM bisa berjalan di VPS kecil (1 GB RAM)? <br/>
A: Bisa, tetapi performanya akan terbatas. Disarankan menggunakan minimal 2 GB RAM atau lebih agar SuiteCRM berjalan lancar.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
