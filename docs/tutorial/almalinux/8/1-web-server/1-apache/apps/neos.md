---
title: Panduan Lengkap Cara Install Neos CMS menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Neos CMS menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Neos
---

**Neos CMS** adalah salah satu *Content Management System* modern berbasis PHP yang fleksibel, cepat, dan mendukung arsitektur konten yang kompleks. Untuk mendapatkan performa terbaik saat menggunakan Neos, salah satu pilihan paling stabil adalah menjalankannya di atas **LAMP Stack** (*Linux, Apache, MySQL/MariaDB, PHP*). Pada panduan ini, kita akan membahas secara **mendalam** langkah demi langkah **cara install Neos menggunakan LAMP Stack di AlmaLinux 8** hingga siap digunakan di server produksi.

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

## Install Neos

Sebelum menginstall Neos versi 9 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Neos) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/neosapp/Web

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
create database neos_db;
create user 'neos_user'@'localhost' identified by 'jvJQsxPXWnAD2024';
grant all on neos_db.* to 'neos_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Neos seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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

Download file Neos dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Neos dan membuat project dengan nama `neosapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id
composer create-project neos/neos-base-distribution neosapp
```
Berikut adalah output jika instalasi Neos berhasil
```
    ....######          .######
    .....#######      ...######
    .......#######   ....######
    .........####### ....######
    ....#......#######...######
    ....##.......#######.######
    ....#####......############
    ....#####  ......##########
    ....#####    ......########
    ....#####      ......######
    .#######         ........

          Welcome to Neos.

Basic system requirements
All basic requirements are fullfilled.

Database
Please configure your database in the settings or use the command ./flow setup:database

Neos setup not complete.
You can rerun this command anytime via ./flow setup
```
Setup database Neos:
```
cp /var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml.example /var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml
nano /var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml
```
Kemudian set db, user, dan password yang sudah dibuat sebelumnya:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml"
Neos:
  Flow:
    persistence:
      backendOptions:
        driver: 'pdo_mysql'  
        charset: 'utf8mb4'
        host: '127.0.0.1'
        user: 'neos_user'
        password: 'jvJQsxPXWnAD2024'
        dbname: 'neos_db'
```
Jalankan perintah berikut untuk migrate db Neos:
```
cd /var/www/focusnic.biz.id/neosapp
chmod +x flow
sudo -u apache ./flow setup:database
sudo -u apache ./flow doctrine:migrate
```
Berikut contoh outputnya:
```
DB Driver (pdo_mysql): 
  [pdo_mysql] MySQL/MariaDB via PDO
  [mysqli   ] MySQL/MariaDB via mysqli
 > pdo_mysql
Host (127.0.0.1):     
Database (neos_db): 
Username (neos_user): 
Password (jvJQsxPXWnAD2024): 

Database neos_db was connected sucessfully.

Neos:
  Flow:
    persistence:
      backendOptions:
        driver: pdo_mysql
        host: 127.0.0.1
        dbname: neos_db
        user: neos_user
        password: jvJQsxPXWnAD2024

The new database settings were written to /var/www/focusnic.biz.id/neosapp/Configuration/Development/Settings.Database.yaml
```
Kemudian buat user Administrator Neos:
```
cd /var/www/focusnic.biz.id/neosapp
sudo -u apache ./flow user:create --roles Administrator
```
Contoh output:
```
Please specify the required argument "username": admin
Please specify the required argument "password": fU0RgEKskA3ezAS1
Please specify the required argument "firstName": Focusnic
Please specify the required argument "lastName": Administrator
Created user "admin" and assigned the following role: Neos.Neos:Administrator.
```
Set image handler dan neos content repository:
```
sudo -u apache ./flow setup:imagehandler
sudo -u apache ./flow cr:setup --content-repository default
```
Lalu setup Neos dengan perintah berikut:
```
cd /var/www/focusnic.biz.id/neosapp
sudo -u apache ./flow setup
sudo -u ./flow site:importall --package-key Neos.Demo
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/neosapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/neosapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```
Refresh cache Neos:
```
cd /var/www/focusnic.biz.id/neosapp
chmod +x flow
sudo -u apache ./flow flow:cache:warmup
sudo -u apache ./flow flow:doctrine:compileproxies
```

Akses instalasi Neos melalui browser, misalnya: `http://focusnic.biz.id'. Berikut adalah tampilan default dari Neos CMS
![](/img/almalinux8-lamp-apps-neos1.jpg)<br/>
Berikut adalah tampilan dashboard admin Neos dapat diakses melalui `http://$DOMAIN/neos`. Gunakan username dan password yang sudah dibuat diatas
![](/img/almalinux8-lamp-apps-neos2.jpg)<br/>

## Troubleshooting

1. Error `Permission denied` saat menjalankan perintah `flow` <br/>

**Penyebab:** Perintah `./flow` dijalankan dengan user root atau user biasa, sedangkan web server (Apache) berjalan dengan user apache.

**Solusi:** 

Jalankan perintah menggunakan user Apache:
```
cd /var/www/focusnic.biz.id/neosapp
sudo -u apache ./flow
```

2. Neos tidak bisa terhubung ke database <br/>

**Penyebab:** Konfigurasi database di file `Settings.yaml` salah atau database tidak berjalan.

**Solusi:**

Pastikan MariaDB/MySQL berjalan:
```
systemctl status mariadb
```
Periksa file konfigurasi `/var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml`:
```
Neos:
  Flow:
    persistence:
      backendOptions:
        driver: 'pdo_mysql'
        host: 'localhost'
        dbname: 'neos_db'
        user: 'neos_user'
        password: 'jvJQsxPXWnAD2024'
        charset: 'utf8mb4'
```

3. Halaman Neos menampilkan error `500 Internal Server Error` <br/>

**Penyebab:** Biasanya akibat ekstensi PHP yang belum terinstal atau konfigurasi PHP tidak sesuai.

**Solusi:**

Pastikan semua ekstensi PHP yang dibutuhkan terinstal:
```
dnf install php-mbstring php-intl php-xml php-gd php-zip php-bcmath php-opcache -y
```
Restart Apache:
```
systemctl restart httpd
```

4. Cache tidak terupdate setelah perubahan konfigurasi <br/>

Cache Neos tidak dihapus setelah mengubah file konfigurasi atau database. Solusi:
```
cd /var/www/focusnic.biz.id/neosapp
chmod +x flow
sudo -u apache ./flow flow:cache:flush
```

## Kesimpulan

Instalasi **Neos CMS 9 di AlmaLinux 8 dengan LAMP Stack** membutuhkan penyesuaian versi PHP (minimal 8.2), instalasi ekstensi yang lengkap, serta konfigurasi database melalui file `Settings.yaml`. Penggunaan perintah `sudo -u apache ./flow` sangat penting untuk menjaga konsistensi hak akses antara web server dan CLI, sehingga menghindari error izin file.

Dengan mengikuti panduan ini secara runtut, Anda bisa menjalankan Neos CMS 9 dengan performa optimal dan stabil di server produksi. Untuk instalasi lebih cepat, aman, dan teroptimasi, **jangan ragu memilih Focusnic sebagai penyedia jasa install server dan cloud VPS**.

Q: Apakah Neos CMS 9 bisa menggunakan MySQL 5.7? <br/>
A: Tidak direkomendasikan. Versi minimal yang disarankan adalah MariaDB 10.4 atau MySQL 8.0.

Q: Di mana lokasi file konfigurasi database Neos? <br/>
A: File konfigurasi database ada di:
```
/var/www/focusnic.biz.id/neosapp/Configuration/Settings.yaml
```

Q: Mengapa harus menjalankan perintah `flow` dengan `sudo -u apache`?
A: Karena web server Apache berjalan dengan user `apache`. Jika menjalankan flow dengan user root, akan ada perbedaan hak akses file yang bisa menyebabkan error.

Q: Apakah Neos CMS 9 bisa diinstal tanpa Composer? <br/>
A: Tidak, Composer wajib digunakan karena Neos berbasis PHP modern dengan dependency management.


Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
