---
title: Panduan Lengkap Cara Install PHP Framework Symfony menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install PHP Framework Symfony menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Symfony
---

Symfony merupakan salah satu **framework PHP** paling kuat dan fleksibel untuk pengembangan aplikasi web berskala besar. Dengan performa tinggi, dokumentasi lengkap, serta komunitas aktif, Symfony menjadi pilihan ideal untuk developer profesional. Dalam panduan ini, kita akan membahas secara menyeluruh **cara install Symfony menggunakan LAMP Stack di AlmaLinux 8** – panduan ini dirancang sedemikian rupa agar dapat diikuti dengan mudah, bahkan oleh pemula yang baru mengenal Linux dan Symfony.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Symfony, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Symfony

Sebelum menginstall Symfony versi 7 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Symfony) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/symfonyapp/public

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
create database symfony_db;
create user 'symfony_user'@'localhost' identified by 'b0mIt1N4kuzUTRE1';
grant all on symfony_db.* to 'symfony_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Symfony seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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
Download dan install `symfony-cli` dengan perintah berikut:
:::info
Symfony CLI adalah tool untuk membantu Anda build, run, dan mengelola aplikasi Symfony langsung dari terminal.
:::
```
wget https://get.symfony.com/cli/installer -O - | bash
mv /root/.symfony5/bin/symfony /usr/local/bin/symfony
```
Lalu cek instalasi `symfony-cli` dengan perintah berikut:
```
symfony -v
```
Contoh output:
```
Symfony CLI version 5.12.0 (c) 2021-2025 Fabien Potencier (2025-06-16T09:40:30Z - stable)
Symfony CLI helps developers manage projects, from local code to remote infrastructure
```
Download file Symfony dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Symfony dan membuat project dengan nama `symfonyapp` menggunakan `symfony-cli`:
```
cd /var/www/focusnic.biz.id/
symfony check:req
symfony new symfonyapp
cd symfonyapp
composer fund
composer update
composer install
composer require symfony/orm-pack
composer require symfony/maker-bundle --dev
cp env .env
```
Ubah beberapa parameter pada file `.env` untuk koneksi database pada Symfony:
```
nano /var/www/focusnic.biz.id/symfonyapp/.env
```
Tambahkan parameter berikut dan sesuaikan dengan informasi database yang sudah dibuat sebelumnya termasuk db, username, dan password:
```
DATABASE_URL="mysql://symfony_user:b0mIt1N4kuzUTRE1@127.0.0.1:3306/symfony_db"
```
Jalankan perintah berikut untuk populate db:
```
php bin/console make:migration
php bin/console doctrine:migrations:migrate
```
Sesuaikan permission pada direktori Symfony:
```
find /var/www/focusnic.biz.id/symfonyapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/symfonyapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi Symfony melalui browser, misalnya: `http://focusnic.biz.id`. Jika instalasi berhasil, maka akan tampil default page dari Symfony berikut
![](/img/almalinux8-lamp-apps-symfony1.jpg)<br/>

## Troubleshooting

1. Symfony CLI Command Not Found <br/>

Pastikan Anda telah memindahkan binary ke direktori global setelah mendownload:
```
mv /root/.symfony5/bin/symfony /usr/local/bin/symfony
```
Lalu verifikasi dengan perintah berikut:
```
symfony -v
```

2. Can't create database `symfony_db`; database exists <br/>

Abaikan error ini dan lanjutkan ke langkah migrasi:
```
php bin/console doctrine:migrations:migrate
```

3. Error: The version "latest" couldn't be reached, there are no registered migrations. <br/>

Penyebabnya adalah tidak ada file migrasi yang terdeteksi oleh Doctrine.

Solusi:

- Buat entity terlebih dahulu:

:::info
Pada saat generate entity isi value berikut: <br/>
// Class name<br/>
Post <br/>

// Field 1 <br/>
title<br/>
string<br/>
150<br/>

// Field 2<br/>
content<br/>
text
:::

```
cd /var/www/focusnic.biz.id/symfonyapp
php bin/console make:entity
php bin/console doctrine:schema:validate
```
- Generate migration:
```
php bin/console make:migration
```
- Lalu jalankan perintah berikut:
```
php bin/console doctrine:migrations:migrate
```

4. 403 Forbidden <br/>

Pastikan permission direktori `public` sudah benar dan `AllowOverride All` telah diaktifkan.

## Kesimpulan

Instalasi Symfony menggunakan **LAMP Stack di AlmaLinux 8** membutuhkan beberapa tahapan mulai dari konfigurasi server, instalasi dependensi, setup database, hingga konfigurasi Apache dan Doctrine. Jika semua langkah diikuti dengan benar, maka Symfony siap digunakan untuk membangun aplikasi web yang profesional dan skalabel.

Q: Apakah Symfony bisa diinstal tanpa Composer? <br/>
A: Tidak disarankan. Composer adalah dependency manager utama untuk Symfony.

Q: Apakah bisa pakai Nginx sebagai pengganti Apache? <br/>
A: Bisa. Namun dalam panduan ini difokuskan pada LAMP (Linux, Apache, MySQL/MariaDB, PHP).

Q: Symfony mendeteksi tidak ada perubahan, padahal entity sudah dibuat? <br/>
A: Pastikan Anda sudah menyimpan file entitas, dan struktur entitas benar. Jalankan perintah berikut:
```
php bin/console doctrine:schema:validate
```
Q: Apakah Symfony cocok untuk pemula? <br/>
A: Symfony memang lebih cocok untuk project besar atau developer berpengalaman, tapi dengan dokumentasi dan tooling seperti `make:entity`, `make:controller`, dan `symfony server:start`, pemula pun bisa belajar secara bertahap.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity

