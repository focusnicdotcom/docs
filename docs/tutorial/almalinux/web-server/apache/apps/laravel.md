---
title: Panduan Lengkap Cara Install PHP Framework Laravel menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install PHP Framework Laravel menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Laravel
---

Laravel adalah salah satu **framework PHP** paling populer dan powerfull yang digunakan secara luas untuk membangun aplikasi web modern, cepat, dan aman. Dalam panduan ini, kita akan membahas secara menyeluruh **cara menginstal Laravel menggunakan LAMP (Linux, Apache, MySQL/MariaDB, PHP) Stack di AlmaLinux 8**, sebuah distribusi Linux berbasis Red Hat Enterprise Linux (RHEL) yang sangat stabil untuk keperluan produksi.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Laravel, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Laravel

Sebelum menginstall Laravel versi 12 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Laravel) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/laravelapp/public

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
create database laravel_db;
create user 'laravel_user'@'localhost' identified by 'uKpCZmSAXY9HMu7E';
grant all on laravel_db.* to 'laravel_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Laravel seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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

Download file Laravel dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Laravel dan membuat project dengan nama `laravelapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id/
composer create-project --prefer-dist laravel/laravel laravelapp
```
Ubah beberapa parameter pada file `.env` untuk koneksi database pada Laravel:
```
nano /var/www/focusnic.biz.id/laravelapp/.env
```
Sesuaikan dengan informasi database yang sudah dibuat sebelumnya termasuk db, username, dan password:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=uKpCZmSAXY9HMu7E
```
Jalankan perintah berikut untuk inisialisasi dan migrasi database proyek laravelapp:
```
cd /var/www/focusnic.biz.id/laravelapp
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:clear
sudo -u apache php artisan migrate
sudo -u apache php artisan db:seed
```
Sesuaikan permission pada direktori Laravel:
```
find /var/www/focusnic.biz.id/laravelapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/laravelapp -type d -exec chmod 755 {} \;
chmod -R 775 /var/www/focusnic.biz.id/laravelapp/storage
chmod -R 775 /var/www/focusnic.biz.id/laravelapp/bootstrap/cache
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi Laravel melalui browser, misalnya: `http://focusnic.biz.id`. Jika instalasi sudah benar dan sesuai maka akan tampil default page Laravel seperti berikut
![](/img/almalinux8-lamp-apps-laravel1.jpg)<br/>

## Troubleshooting

1. 403 Forbidden setelah install Laravel <br/>

**Penyebab:**

- Permission atau ownership direktori tidak sesuai.
- SELinux menghalangi akses ke direktori Laravel.

**Solusi:**

Jalankan perintah berikut untuk menyesuaikan permission dan SELinux:
```
chown -R apache:apache /var/www/focusnic.biz.id/laravelapp
chmod -R 755 /var/www/focusnic.biz.id/laravelapp
chcon -R -t httpd_sys_content_t /var/www/focusnic.biz.id/laravelapp
chcon -R -t httpd_sys_rw_content_t /var/www/focusnic.biz.id/laravelapp/storage
```

2. 500 Internal Server Error <br/>

**Penyebab:**

- File `.env` belum dikonfigurasi.
- Permission `storage/` atau `bootstrap/cache/` salah.
- Composer autoload belum dijalankan.

**Solusi:**

Jalankan perintah berikut
```
cd /var/www/focusnic.biz.id/laravelapp
php artisan config:clear
php artisan config:cache
chmod -R 775 storage bootstrap/cache
composer install --optimize-autoloader --no-dev
```

3. Perubahan route atau config tidak terdeteksi <br/>

Penyebabnya Laravel masih menggunakan cache lama. Solusi clear cache dengan perintah berikut:
```
cd /var/www/focusnic.biz.id/laravelapp
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

4. Error saat migrate atau db:seed <br/>

**Penyebab:**

- Database belum dikonfigurasi dengan benar di .env
- User database tidak memiliki akses
- Perintah dijalankan bukan oleh user web server

**Solusi:**

Periksa isi `.env` dan pastikan sesuai dengan kredensial database. Gunakan perintah berikut untuk migrasi db:
```
sudo -u apache php artisan migrate
sudo -u apache php artisan db:seed
```

## Kesimpulan

Melalui panduan ini, kita telah membahas secara lengkap **cara install Laravel Framework menggunakan LAMP Stack di AlmaLinux 8**, mulai dari konfigurasi sistem, instalasi Apache, MariaDB, PHP 8, Composer, hingga Laravel berhasil dijalankan dan dapat diakses melalui browser. Dengan penerapan langkah-langkah ini, server Anda akan siap digunakan untuk mengembangkan dan menjalankan aplikasi Laravel yang stabil dan optimal.


Q: Apakah Laravel bisa dijalankan tanpa Composer? <br/>
A: Tidak. Composer adalah dependency manager resmi Laravel dan dibutuhkan untuk menginstal serta mengelola dependensi aplikasi.

Q: Apakah MariaDB dan MySQL sama untuk Laravel? <br/>
A: Secara umum ya, Laravel mendukung keduanya. MariaDB adalah fork dari MySQL dan digunakan secara default pada AlmaLinux.

Q: Kapan sebaiknya saya menjalankan `php artisan migrate` dan `db:seed`? <br/>
A: 
- Jalankan `migrate` saat deploy awal atau saat menambahkan tabel baru.
- Jalankan `db:seed` jika Anda ingin mengisi data awal (admin, role, kategori, dll).

Q: Bagaimana cara membuat Laravel saya lebih aman di production? <br/>
A: 
- Jangan aktifkan debug di `.env` (`APP_DEBUG=false`)
- Gunakan permission minimal yang dibutuhkan.
- Aktifkan SSL untuk enkripsi trafik.
- Gunakan firewall dan SELinux dengan benar.

Q: Kenapa pakai `sudo -u apache`? <br/>
A: 
- Karena file yang dibuat dan digunakan Laravel harus bisa dibaca/ditulis oleh user `apache`.
- Mencegah masalah permission (misalnya file `storage/logs/laravel.log` tidak bisa ditulis).

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
