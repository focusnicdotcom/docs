---
title: Panduan Lengkap Cara Install Paymenter menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Paymenter menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Paymenter
---

**Paymenter** adalah sebuah platform **billing hosting open-source** yang dirancang untuk mempermudah pengelolaan pembayaran, penagihan, hingga otomatisasi layanan hosting. Dengan dukungan **plugin ekstensi, marketplace, dan API modern**, Paymenter banyak digunakan oleh penyedia hosting, developer, maupun perusahaan yang ingin menghadirkan sistem pembayaran yang fleksibel dan dapat diandalkan.

Pada panduan ini, kita akan membahas secara rinci cara **install Paymenter menggunakan LAMP Stack (Linux, Apache, MariaDB/MySQL, PHP)** di **AlmaLinux 8**. Panduan ini ditulis untuk kebutuhan server produksi dengan konfigurasi lengkap agar sistem berjalan optimal dan aman.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Paymenter, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-redis
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

### Install Redis

Jalankan perintah berikut untuk menginstall Redis server:
```
dnf install redis
```
Aktifkan service Redis:
```
systemctl enable --now redis
systemctl status redis
```

## Install Paymenter

Sebelum menginstall Paymenter, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Paymenter) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:

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
    DocumentRoot /var/www/focusnic.biz.id/paymenterapp/public

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
mkdir -p /var/www/focusnic.biz.id/paymenterapp
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
create database paymenter_db;
create user 'paymenter_user'@'localhost' identified by 'ubMH9tfmpWgGLJm8';
grant all on paymenter_db.* to 'paymenter_user'@'localhost';
flush privileges;
quit;
```
Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Paymenter seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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
Download file Paymenter dengan perintah berikut:
```
cd /var/www/focusnic.biz.id/paymenterapp
curl -Lo paymenter.tar.gz https://github.com/paymenter/paymenter/releases/latest/download/paymenter.tar.gz
tar -xf paymenter.tar.gz
```
Jalankan perintah berikut untuk menginstall dependensi yang diperlukan:
```
cd /var/www/focusnic.biz.id/paymenterapp
composer install --no-dev --optimize-autoloader
```
Kemudian salin environment dan setting beberapa parameter termasuk database:
```
cd /var/www/focusnic.biz.id/paymenterapp
cp .env.example .env
nano .env
```
Isi parameter pada environment berikut sesuai dengan database yang sudah dibuat:
```
DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=paymenter_db
DB_USERNAME=paymenter_user
DB_PASSWORD=ubMH9tfmpWgGLJm8
```
Generate encryption key:
```
cd /var/www/focusnic.biz.id/paymenterapp
php artisan key:generate --force
php artisan storage:link
```
Contoh output:
```
   INFO  Application key set successfully.  

   INFO  The [public/storage] link has been connected to [storage/app/public].  
```

Jalankan perintah berikut untuk migrate db, inisialisasi Paymenter, dan membuat user Paymenter:
```
cd /var/www/focusnic.biz.id/paymenterapp
php artisan migrate --force --seed
php artisan app:init
php artisan app:user:create
```
Berikut contoh output dari perintah `php artisan app:init`:
```
 ┌ What is the name of your company? ───────────────────────────┐
 │ Focusnic                                                     │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the URL of your application? ────────────────────────┐
 │ http://focusnic.biz.id                                       │
 └──────────────────────────────────────────────────────────────┘

Thanks for installing Paymenter!
Now you're all set up!
Visit Paymenter at http://focusnic.biz.id
```
Berikut contoh output dari perintah `php artisan app:user:create`:
```
 ┌ What is the user's first name? ──────────────────────────────┐
 │ admin                                                        │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's last name? ───────────────────────────────┐
 │ focusnic                                                     │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's email address? ───────────────────────────┐
 │ admin@focusnic.biz.id                                        │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's password? ────────────────────────────────┐
 │ •••••••••                                                    │
 └──────────────────────────────────────────────────────────────┘

 ┌ What is the user's role? ────────────────────────────────────┐
 │ admin                                                        │
 └──────────────────────────────────────────────────────────────┘
```
Sesuaikan permission pada direktori Paymenter:
```
cd /var/www/focusnic.biz.id/paymenterapp
chmod -R 755 storage/* bootstrap/cache/
find /var/www/focusnic.biz.id/paymenterapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/paymenterapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Buat cronjob setiap menit untuk menjalankan queue worker Paymenter:
```
crontab -e
```
Isi dengan parameter berikut:
```
* * * * * sudo -u apache php /var/www/paymenter/artisan schedule:run >> /dev/null 2>&1
```

Akses instalasi Paymenter melalui browser, misalnya: `http://$DOMAIN`. Jika instalasi berhasil, maka akan tampil default page dari Paymenter berikut <br/>
![](/img/almalinux8-lamp-apps-paymenter1.jpg)<br/>
Berikutnya adalah tampilan dashboard Administrator Paymenter. Dapat diakses melalui domain berikut `http://$DOMAIN/admin` 
![](/img/almalinux8-lamp-apps-paymenter2.jpg)<br/>
Tampilan dashboard client Paymenter seperti berikut
![](/img/almalinux8-lamp-apps-paymenter3.jpg)<br/>


## Troubleshooting

1. Error 500 Internal Server Error <br/>

Permission pada direktori `storage` atau `bootstrap/cache` salah. Jalankan perintah berikut untuk menyesuaikan permission:
```
cd /var/www/focusnic.biz.id/paymenterapp
chmod -R 755 storage/* bootstrap/cache/
find /var/www/focusnic.biz.id/paymenterapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/paymenterapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Tidak Bisa Terhubung ke Database <br/>

Konfigurasi `.env` salah, salah input username/password database. Solusi cek file `.env` pada baris berikut:
```
DB_DATABASE=paymenter
DB_USERNAME=paymenteruser
DB_PASSWORD=password
```

3. Composer Error / Gagal Install Dependency <br/>

PHP belum dilengkapi dengan semua ekstensi yang dibutuhkan. Jalankan perintah berikut untuk install php yang diperlukan:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-redis
```

4. Halaman Paymenter Kosong Setelah Instalasi <br/>

Pastikan `AllowOverride All` sudah ditambahkan di konfigurasi VirtualHost Apache.

## Kesimpulan

Dengan mengikuti langkah-langkah di atas, kita telah berhasil melakukan instalasi **Paymenter menggunakan LAMP Stack di AlmaLinux 8**. Mulai dari persiapan server, instalasi Apache, MariaDB, PHP, hingga konfigurasi Composer, migrasi database, dan Virtual Host Apache, semuanya telah dijelaskan secara lengkap.

Paymenter memberikan solusi billing hosting yang fleksibel, open-source, dan aman untuk bisnis digital maupun penyedia layanan hosting. Namun, proses instalasi membutuhkan ketelitian
tinggi agar sistem benar-benar stabil dan aman di lingkungan produksi.

Q: Apa itu Paymenter? <br/>
A: Paymenter adalah aplikasi billing hosting open-source yang dapat digunakan untuk mengelola sistem pembayaran, invoice, user, serta integrasi layanan hosting.

Q: Apa perbedaan Paymenter dengan WHMCS? <br/>
A: Paymenter merupakan alternatif open-source dan gratis dari WHMCS, dengan kelebihan fleksibilitas tinggi, plugin ekstensi, serta dukungan komunitas.

Q: Apakah Paymenter bisa dijalankan di AlmaLinux 8? <br/>
A: Ya. Meskipun dokumentasi resminya lebih banyak untuk Ubuntu/Debian, Paymenter bisa dijalankan di AlmaLinux 8 menggunakan LAMP Stack.

Q: Apa versi PHP minimal untuk Paymenter? <br/>
A: Paymenter membutuhkan PHP 8.2 atau lebih baru agar kompatibel dengan framework Laravel yang digunakannya.

Q: Bagaimana cara mempercepat performa Paymenter? <br/>
A: Anda bisa mengoptimasi PHP, database MariaDB, caching, dan konfigurasi Apache. Untuk performa maksimal, gunakan server dengan SSD dan minimal RAM 4GB.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
