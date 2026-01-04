---
title: Panduan Lengkap Cara Install TYPO3 CMS menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install TYPO3 CMS menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: TYPO3
---

**TYPO3** adalah salah satu **Content Management System (CMS)** berbasis PHP yang digunakan secara luas untuk membangun website profesional, portal perusahaan, dan sistem manajemen konten berskala besar. Kombinasi **TYPO3** dengan **LAMP Stack** (Linux, Apache, MySQL/MariaDB, PHP) di **AlmaLinux 8** menawarkan stabilitas, performa, dan keamanan yang optimal. Panduan ini akan membahas **langkah demi langkah** instalasi TYPO3 dengan konfigurasi yang tepat agar website berjalan maksimal.

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

## Install TYPO3

Sebelum menginstall TYPO3, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur TYPO3) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/typo3app/public

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
create database typo3_db;
create user 'typo3_user'@'localhost' identified by 'BcBDAg8S8EsAMbk5';
grant all on typo3_db.* to 'typo3_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen TYPO3 seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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

Download file TYPO3 dan letakkan pada direktori sesuai virtualhost, kita akan mendownload TYPO3 dan membuat project dengan nama `typo3app` menggunakan composer:
```
cd /var/www/focusnic.biz.id
composer create-project "typo3/cms-base-distribution:^13.4" typo3app
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/typo3app -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/typo3app -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
chmod -R +x  /var/www/focusnic.biz.id/typo3app/vendor/bin/
```

Lalu jalankan perintah berikut untuk setup TYPO3:
```
sudo -u apache /var/www/focusnic.biz.id/typo3app/vendor/bin/typo3 setup
```

Berikut contoh output instruksi TYPO3:

:::info
Untuk instruksi password akan di hidden secara otomatis oleh installer TYPO3.
:::

```
Which web server is used?
  [apache] Apache
  [iis   ] Microsoft IIS
  [other ] Other (use for anything else)
 > apache
Configuration already exists do you want to overwrite it [default: no] ? yes
Database driver?
  [mysqli        ] [MySQLi] Manually configured MySQL TCP/IP connection
  [mysqliSocket  ] [MySQLi] Manually configured MySQL socket connection
  [pdoMysql      ] [PDO] Manually configured MySQL TCP/IP connection
  [pdoMysqlSocket] [PDO] Manually configured MySQL socket connection
  [postgres      ] Manually configured PostgreSQL connection
  [sqlite        ] Manually configured SQLite connection
 > mysqli
Enter the database "username" [default: db] ? typo3_user
Enter the database "password" ? 
Enter the database "port" [default: 3306] ? [ENTER]
Enter the database "host" [default: db] ? localhost
Select which database to use: 
  [typo3_db] typo3_db (Tables 0 ✓)
 > typo3_db
Admin username (user will be "system maintainer") ? admin
Admin user and installer password ? 
Admin user email ? admin@focusnic.biz.id
Give your project a name [default: New TYPO3 Project] ? 
Create a basic site? Please enter a URL [default: no] 
✓ Congratulations - TYPO3 Setup is done.
```

Berikut adalah tampilan dashboard admin TYPO3 dapat diakses melalui `http://$DOMAIN/typo3`. Gunakan username dan password yang sudah dibuat diatas
![](/img/almalinux8-lamp-apps-typo31.jpg)<br/>

## Troubleshooting

1. Error 500 Internal Server Error <br/>

Pastikan semua file dan folder di `/var/www/focusnic.biz.id/typo3app` dimiliki oleh `apache:apache` dan memiliki permission 755. Jalankan perintah berikut: 
```
find /var/www/focusnic.biz.id/typo3app -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/typo3app -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
chmod -R +x  /var/www/focusnic.biz.id/typo3app/vendor/bin/
```

2. Database Connection Failed <br/>

Periksa informasi database atau ulangi wizard instalasi.

3. Lambat Saat Akses Website <br/>

Aktifkan Opcache di `php.ini` dan tingkatkan nilai `memory_limit` serta `max_execution_time`.

## Kesimpulan

Menggunakan **TYPO3 dengan LAMP Stack di AlmaLinux 8** adalah pilihan tepat untuk membangun website skala besar yang memerlukan kestabilan, keamanan, dan fleksibilitas tinggi. Dengan langkah instalasi yang terstruktur, konfigurasi PHP yang optimal, serta pengaturan permission yang benar, sistem akan berjalan lancar dan aman.

Q: Apakah TYPO3 bisa diinstal di server shared hosting? <br/>
A: Bisa, tetapi disarankan menggunakan VPS atau Dedicated Server agar performa lebih stabil, apalagi untuk website dengan trafik tinggi.

Q: Versi PHP berapa yang direkomendasikan untuk TYPO3? <br/>
A: TYPO3 versi terbaru biasanya mendukung PHP 8.1 atau lebih baru. Gunakan versi sesuai rekomendasi resmi.

Q: Bagaimana cara update TYPO3 ke versi terbaru? <br/>
A: Update dapat dilakukan melalui Composer atau mengganti source code lalu menjalankan script update di backend TYPO3.

Q: Apakah MariaDB lebih baik daripada MySQL untuk TYPO3? <br/>
A: Keduanya kompatibel, namun MariaDB biasanya lebih cepat dan ringan di Linux.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
