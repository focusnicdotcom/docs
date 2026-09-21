---
title: Panduan Lengkap Cara Install Drupal menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Drupal menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Drupal
---

Drupal adalah salah satu **Content Management System (CMS)** terpopuler di dunia yang banyak digunakan untuk membangun situs web berskala kecil hingga besar, termasuk portal pemerintahan, media berita, hingga situs komunitas besar. Di panduan ini, kita akan membahas secara **lengkap dan rinci cara menginstall Drupal menggunakan LAMP Stack (Linux, Apache, MariaDB, dan PHP)** di **AlmaLinux 8**, sistem operasi enterprise-grade yang menjadi alternatif CentOS.

Jika Anda sedang mencari panduan **praktis dan profesional untuk install Drupal di server AlmaLinux**, maka panduan ini adalah referensi yang tepat. Ikuti langkah-langkah berikut untuk memastikan instalasi berjalan sempurna dan Drupal siap digunakan.

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

## Install Drupal

Sebelum menginstall Drupal versi 11 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Drupal) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <Directory /var/www/focusnic.biz.id/public_html>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Lalu buat direktori pada virtualhost diatas:
```
mkdir -p /var/www/focusnic.biz.id/public_html
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
create database drupal_db;
create user 'drupal_user'@'localhost' identified by 'nrbL5B2HDEqPpnro';
grant all on drupal_db.* to 'drupal_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Drupal seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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
Download file Drupal dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://www.drupal.org/download-latest/tar.gz -O drupal.tar.gz
tar -xf drupal.tar.gz 
mv drupal-11.2.2/* .
```
Untuk mengaktifkan clean URL, Drupal menggunakan `.htaccess`. Pastikan `mod_rewrite` aktif secara default di virtualhost. Jika `.htaccess` tidak ada pada direktori silahkan salin dengan perintah berikut:
```
cd /var/www/focusnic.biz.id/public_html
cp drupal-11.2.2/.htaccess .
```
Sesuaikan permission:
```
cd /var/www/focusnic.biz.id/public_html
find . -type d -exec chmod u=rwx,g=rx,o= '{}' \;
find . -type f -exec chmod u=rw,g=r,o= '{}' \;
chown -R apache:apache /var/www/focusnic.biz.id
```
Akses instalasi Drupal melalui browser, misalnya: `http://focusnic.biz.id` lalu pilih bahasa dan klik "Save and continue"
![](/img/almalinux8-lamp-apps-drupal1.jpg)<br/>
Pilih profile Drupal dan klik "Save and continue"
![](/img/almalinux8-lamp-apps-drupal2.jpg)<br/>
Lalu setting database MySQL dengan nama db, user, dan password yang sudah dibuat sebelumnya, lanjutkan dengan klik "Save and continue"
![](/img/almalinux8-lamp-apps-drupal3.jpg)<br/>
Tunggu proses instalasi hingga selesai
![](/img/almalinux8-lamp-apps-drupal4.jpg)<br/>
Konfigurasi Drupal admin, jika sudah sesuai silahkan klik "Save and continue"
![](/img/almalinux8-lamp-apps-drupal5.jpg)<br/>
Berikut tampilan instalasi Drupal. Jika ingin mengakses dashboard administrator Drupal silahkan menuju ke `http://$DOMAIN/admin`.
![](/img/almalinux8-lamp-apps-drupal6.jpg)<br/>

## Troubleshooting

1. Error: Cannot connect to the database <br/>

**Penyebab:**

- Nama database, user, atau password salah.
- MariaDB belum berjalan.
- User database belum diberikan hak akses.

**Solusi:**

Pastikan MariaDB aktif dengan perintah:
```
systemctl status mariadb
```
Uji koneksi manual ke database:
```
mariadb -u drupal_user -p
```

2. 403 Forbidden atau 500 Internal Server Error <br/>

**Penyebab:**

- Hak akses direktori atau file salah.
- `.htaccess` tidak terbaca karena `AllowOverride` belum disetel.
- Modul `mod_rewrite` tidak aktif.

**Solusi:**

Pastikan file dan folder milik user apache:
```
chown -R apache:apache /var/www/focusnic.biz.id.id
```

Edit konfigurasi VirtualHost:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<Directory /var/www/focusnic.biz.id/public_html>
    AllowOverride All
</Directory>
```

3. Halaman Putih (White Screen of Death) <br/>

**Penyebab:**

- Masalah pada modul PHP atau ekstensi yang belum terinstal.
- Error PHP disembunyikan.

**Solusi:**

Aktifkan log error PHP:
```
nano /etc/php.ini
```
Ubah parameter berikut:
```
display_errors = On
error_reporting = E_ALL
```
Restart php-fpm dan cek log pada web server:
```
systemctl restart php-fpm
tail -f /var/log/httpd/focusnic.biz.id-error.log
```

4. Gagal Mengakses Drupal dari Domain <br/>

**Penyebab:**

- Nama domain belum diarahkan ke IP server.
- VirtualHost belum disesuaikan.

**Solusi:**

- Tambahkan record A di DNS Anda yang mengarah ke IP server.
- Pastikan ServerName pada VirtualHost sesuai dengan domain Anda.
- Atau gunakan file `hosts` pada client

## Kesimpulan

Instalasi Drupal menggunakan **LAMP Stack di AlmaLinux 8** memberikan solusi yang stabil dan efisien untuk membangun situs web profesional. Dengan memadukan **Apache sebagai web server, MariaDB sebagai database, dan PHP sebagai interpreter** aplikasi, kita menciptakan fondasi kuat untuk mengelola konten melalui platform Drupal. Seluruh proses dimulai dari **update sistem, instalasi LAMP, konfigurasi database, setup virtual host Apache, hingga instalasi dan konfigurasi Drupal**. Langkah-langkah ini memberikan kontrol penuh bagi Anda untuk menjalankan CMS yang sangat fleksibel, aman, dan cocok untuk proyek web skala besar maupun kecil.

Jika Anda menginginkan **instalasi yang cepat, bebas error, dan langsung siap produksi**, **jangan ragu untuk menggunakan layanan install server atau cloud VPS dari Focusnic**. Tim kami siap membantu Anda dari awal setup hingga optimasi performa server.


Q: Apakah saya bisa menggunakan PHP versi lain selain 8.1? <br/>
A: Bisa. Drupal mendukung beberapa versi PHP, tetapi disarankan untuk menggunakan versi terbaru yang didukung stabil (PHP 8.1 atau 8.2). Cek PHP requirements pada website resmi Drupal https://www.drupal.org/docs/getting-started/system-requirements/php-requirements

Q: Apakah saya harus menggunakan MariaDB? <br/>
A: Tidak harus. Anda bisa menggunakan MySQL atau PostgreSQL, tetapi MariaDB lebih umum digunakan di distribusi seperti AlmaLinux.

Q: Apakah Composer wajib digunakan untuk Drupal? <br/>
A: Composer sangat disarankan terutama untuk proyek besar dan kompleks karena membantu mengelola dependensi, tema, dan modul. Namun, untuk instalasi dasar, Anda masih bisa mengelola Drupal tanpa Composer.

Q: Apakah saya bisa menggunakan kontrol panel seperti aaPanel atau CyberPanel? <br/>
A: Bisa, tapi tidak disarankan untuk pengguna tingkat lanjut yang ingin kontrol penuh. Tutorial ini berfokus pada setup manual untuk keamanan dan fleksibilitas maksimum.

Q: Berapa minimal resource server untuk Drupal? <br/>
A: Untuk pengembangan atau testing, 2GB RAM dan 1 core CPU sudah cukup. Untuk produksi, disarankan minimal 4GB RAM.

Q: Apakah saya bisa menggunakan Nginx sebagai pengganti Apache? <br/>
A: Bisa, namun konfigurasi sedikit berbeda. Panduan ini menggunakan Apache karena lebih umum di LAMP Stack.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
