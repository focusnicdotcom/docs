---
title: Panduan Lengkap Cara Install PHP Framework Laminas/Zend Framework menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install PHP Framework Laminas/Zend Framework menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Laminas
---

Dalam panduan ini, kita akan membahas secara menyeluruh **cara install Laminas menggunakan LAMP Stack di AlmaLinux 8**. Panduan ini dirancang agar siapa pun yang ingin menjalankan framework Laminas di server berbasis AlmaLinux dapat mengikuti langkah demi langkah dengan mudah, cepat, dan tepat. Kita akan mengonfigurasi **Linux, Apache, MariaDB, dan PHP (LAMP)** terlebih dahulu, kemudian melanjutkan instalasi Laminas dan seluruh dependensinya.

**Laminas** adalah framework PHP berbasis **komponen** (component-based framework) yang bersifat **open source**, dikembangkan oleh **Laminas Project** di bawah naungan **Linux Foundation**. Laminas secara resmi dirilis pada tahun **2020** sebagai rebranding dan penggabungan dari:

- **Zend Framework**
- **Apigility**
- **Expressive (middleware-based framework)**

Ketiga proyek ini digabung dan dikembangkan ulang menjadi Laminas, dengan tujuan agar lebih **modular, modern, dan sesuai standar PSR (PHP Standards Recommendations)**.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Laminas, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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
Aktifkan modul PHP versi yang diinginkan. Misalnya, untuk PHP 8.3 jalankan perintah berikut:
```
dnf module reset php -y
dnf module enable php:remi-8.3 -y
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

## Install Laminas

Sebelum menginstall Laminas, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Laminas) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/laminasapp/public

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
create database laminas_db;
create user 'laminas_user'@'localhost' identified by 'd0h4ghIn9IotMLV7';
grant all on laminas_db.* to 'laminas_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Laminas seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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
PHP version 8.3.24 (/usr/bin/php)
```

Download file Laminas dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Laminas dan membuat project dengan nama `laminasapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id/
composer create-project -s dev laminas/laminas-mvc-skeleton laminasapp
cd laminasapp
composer require laminas/laminas-db
```
Ubah beberapa parameter pada file berikut untuk koneksi database pada Laminas:
```
/var/www/focusnic.biz.id/laminasapp/config/autoload/global.php
```
Sesuaikan dengan informasi database yang sudah dibuat sebelumnya termasuk db, username, dan password:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/laminasapp/config/autoload/global.php"
return [
    'db' => [
        'driver'   => 'Pdo',
        'dsn'      => 'mysql:dbname=laminas_db;host=localhost;charset=utf8',
        'username' => 'laminas_user',
        'password' => 'd0h4ghIn9IotMLV7',
    ],
    'service_manager' => [
        'factories' => [
            Laminas\Db\Adapter\Adapter::class => Laminas\Db\Adapter\AdapterServiceFactory::class,
        ],
    ],
];
```
Sesuaikan permission pada direktori Laminas:
```
find /var/www/focusnic.biz.id/laminasapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/laminasapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi Laminas melalui browser, misalnya: `http://focusnic.biz.id`. Jika instalasi berhasil, maka akan tampil default page dari Laminas berikut
![](/img/almalinux8-lamp-apps-laminas1.jpg)<br/>

## Troubleshooting

1. Halaman Kosong atau Error 500 <br/>

Penyebabnya bisa saja permission yang salah atau `mod_rewrite` tidak aktif. Solusi:
```
find /var/www/focusnic.biz.id/laminasapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/laminasapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Izinkan `mod_rewrite` pada virtualhost:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>
```

## Kesimpulan

Melalui panduan ini, kita telah berhasil menginstal dan mengonfigurasi **Laminas MVC Framework** menggunakan **LAMP Stack di AlmaLinux 8** secara lengkap dan terstruktur. Laminas memberikan kekuatan penuh kepada developer berpengalaman untuk membangun aplikasi skala besar dengan arsitektur modular, meskipun memerlukan setup manual lebih detail dibanding framework seperti Laravel.

Kita telah membahas:

- Instalasi Apache, MariaDB, dan PHP 8.3
- Instalasi Composer dan Laminas MVC Skeleton
- Setup koneksi database dengan cara yang sesuai dokumentasi resmi
- Penambahan modul dan konfigurasi service manager
- Troubleshooting error umum


Q: Apakah Laminas memiliki fitur migration bawaan? <br/>
A: Tidak. Laminas tidak memiliki sistem migration bawaan seperti Laravel. Anda bisa menggunakan tools eksternal seperti Doctrine Migrations atau Phinx jika ingin pengelolaan database yang versioned.

Q: Apakah Laminas wajib menggunakan ORM seperti Doctrine? <br/>
A: Tidak wajib. Anda bisa menggunakan Laminas\Db untuk akses database langsung menggunakan SQL builder, atau mengintegrasikan ORM seperti Doctrine jika dibutuhkan.

Q: Kenapa instalasi tidak langsung tersambung ke database? <br/>
A: Laminas dirancang modular. Anda harus menambahkan sendiri konfigurasi database di file autoload, dan mendaftarkan modul Laminas\Db di `modules.config.php`.

Q: Apakah bisa pakai SQLite, PostgreSQL, atau SQL Server? <br/>
A: Bisa. Laminas mendukung berbagai driver database melalui PDO. Cukup ganti dsn dan pastikan PHP extension sesuai terinstal.

Q: Apakah Laminas cocok untuk aplikasi startup kecil? <br/>
A: Laminas lebih cocok untuk enterprise application dan proyek besar yang membutuhkan fleksibilitas tinggi. Untuk startup kecil, mungkin Laravel lebih cepat dalam pengembangan awal.

Q: Bagaimana cara deploy Laminas ke production? <br/>
A: Gunakan server LAMP/LEMP dengan PHP-FPM, optimasi permission, aktifkan caching `OPcache`, dan pastikan `.htaccess` bekerja dengan benar.

Q: Apakah Laminas hanya bisa diinstal menggunakan Composer? <br/>
A: Ya. Composer adalah satu-satunya cara resmi dan direkomendasikan untuk instalasi Laminas Framework.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
