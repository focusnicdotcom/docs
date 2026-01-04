---
title: Panduan Lengkap Cara Install PHP Framework CakePHP menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install PHP Framework CakePHP menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: CakePHP
---

CakePHP adalah salah satu **framework PHP** paling populer yang memungkinkan pengembangan aplikasi web dengan cepat, efisien, dan terstruktur. Dalam panduan ini, kita akan membahas **cara install CakePHP di AlmaLinux 8 menggunakan LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP)** secara lengkap dan mendalam. Seluruh tahapan dijelaskan dengan jelas untuk memastikan bahwa Anda dapat membangun lingkungan pengembangan yang stabil dan optimal.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi CakePHP, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install CakePHP

Sebelum menginstall CakePHP versi 5 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur CakePHP) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/cakephpapp/webroot

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
create database cakephp_db;
create user 'cakephp_user'@'localhost' identified by 'VrwaQghBw1EFQ6d8';
grant all on cakephp_db.* to 'cakephp_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen CakePHP seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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

Download file CakePHP dan letakkan pada direktori sesuai virtualhost, kita akan mendownload CakePHP dan membuat project dengan nama `cakephpapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id/
composer create-project --prefer-dist cakephp/app:5 cakephpapp
```
Ubah beberapa parameter pada file berikut untuk koneksi database pada CakePHP:
```
nano /var/www/focusnic.biz.id/cakephpapp/config/app_local.php
```
Sesuaikan dengan informasi database yang sudah dibuat sebelumnya termasuk db, username, dan password:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/cakephpapp/config/app_local.php"
    'Datasources' => [
        'default' => [
            'host' => 'localhost',
            /*
             * CakePHP will use the default DB port based on the driver selected
             * MySQL on MAMP uses port 8889, MAMP users will want to uncomment
             * the following line and set the port accordingly
             */
            //'port' => 'non_standard_port_number',

            'username' => 'cakephp_user',
            'password' => 'VrwaQghBw1EFQ6d8',

            'database' => 'cakephp_db',
            /*
```
Lalu populate DB atau migration dengan perintah berikut:
```
cd /var/www/focusnic.biz.id/cakephpapp/
sudo -u apache bin/cake migrations migrate
```
Sesuaikan permission pada direktori CakePHP:
```
find /var/www/focusnic.biz.id/cakephpapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/cakephpapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi CakePHP melalui browser, misalnya: `http://focusnic.biz.id`. Jika instalasi berhasil, maka akan tampil default page dari CakePHP berikut
![](/img/almalinux8-lamp-apps-cakephp1.jpg)<br/>

## Troubleshooting

1. Error Permission Denied Saat Menjalankan Migration <br/>

Pastikan direktori logs dimiliki oleh user apache:
```
chown -R apache:apache /var/www/focusnic.biz.id/cakephpapp/logs
chmod -R 755 /var/www/focusnic.biz.id/cakephpapp/logs
```

2. Error No such file or directory pada schema-dump-default.lock Saat Menjalankan Migration <br/>

Buat direktori Migrations secara manual:
```
mkdir -p /var/www/focusnic.biz.id/cakephpapp/config/Migrations
chown -R apache:apache /var/www/focusnic.biz.id/cakephpapp/config/Migrations
chmod -R 755 /var/www/focusnic.biz.id/cakephpapp/config/Migrations
```

3. Halaman Web Blank atau Internal Server Error <br/>

- Periksa log error Apache:
```
tail -f /var/log/httpd/focusnic.biz.id-error.log
```
- Periksa permission direktori `webroot/`
- Pastikan `.htaccess` aktif dan `mod_rewrite` tersedia

4. CakePHP Tidak Terkoneksi ke Database <br/>

- Periksa konfigurasi di `config/app_local.php`
- Cek apakah MariaDB aktif:
```
systemctl status mariadb
```
- Coba koneksi manual ke database menggunakan `mysql` CLI

## Kesimpulan 

Instalasi **CakePHP versi 5** menggunakan **LAMP Stack di AlmaLinux 8** membutuhkan perhatian khusus pada:

- Versi PHP yang kompatibel (**PHP 8.1 ke atas**)
- Struktur direktori terbaru CakePHP yaitu `webroot`
- Pengaturan permission file/direktori agar aplikasi bisa berjalan optimal
- Penggunaan Composer dan konfigurasi `app_local.php` untuk database

Dengan mengikuti panduan ini, Anda sudah memiliki **lingkungan pengembangan CakePHP yang stabil dan siap untuk deployment**. Jika ingin mempercepat proses setup server atau aplikasi berbasis PHP secara profesional, **jangan ragu untuk menghubungi Focusnic — penyedia jasa install server dan cloud VPS yang siap membantu Anda dengan cepat dan efisien.**

Q: Apakah CakePHP 5 masih menggunakan file .env? <br/>
A: Tidak secara default. CakePHP 5 mengutamakan konfigurasi di `config/app_local.php`. Namun Anda tetap bisa menggunakan `.env` jika menginstal `vlucas/phpdotenv`.

Q: Apa versi minimal PHP untuk CakePHP 5? <br/>
A: PHP 8.1 adalah versi minimum yang didukung.

Q: Apakah bisa menggunakan MySQL selain MariaDB? <br/>
A: Bisa. CakePHP 5 kompatibel dengan MySQL maupun MariaDB. Namun di AlmaLinux 8, MariaDB lebih direkomendasikan karena tersedia langsung di repository resmi.

Q: Bagaimana jika saya ingin deploy ke cloud VPS? <br/>
A: Sangat disarankan untuk menggunakan provider cloud yang stabil. Untuk konfigurasi profesional dan siap produksi, jangan ragu untuk menggunakan layanan dari Focusnic — ahli dalam jasa install server dan cloud VPS.

Q: Apakah Composer harus selalu digunakan? <br/>
A: Ya, karena CakePHP 5 bergantung pada Composer untuk mengelola dependensi framework dan plugin.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
