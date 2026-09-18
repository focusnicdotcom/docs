---
title: Panduan Lengkap Cara Install OJS menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install OJS menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: OJS
---

Open Journal Systems (**OJS**) adalah salah satu platform **open source** terpopuler yang digunakan untuk pengelolaan jurnal ilmiah secara digital. Banyak universitas, lembaga penelitian, hingga penerbit jurnal internasional yang mempercayakan OJS sebagai sistem publikasi online mereka. Pada panduan ini kita akan membahas **cara install OJS menggunakan LAMP Stack di AlmaLinux 8** secara rinci dan menyeluruh.

Dengan mengikuti panduan ini, kita dapat membangun sistem manajemen jurnal ilmiah yang stabil, aman, dan memiliki performa optimal.

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

## Install OJS

Sebelum menginstall OJS versi 3.5, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur OJS) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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

    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Lalu buat direktori pada virtualhost diatas dan direktori `files` untuk upload data yang ada pada OJS:
```
mkdir -p /var/www/focusnic.biz.id/public_html
mkdir /var/www/focusnic.biz.id/files
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Ubah konfigurasi `php.ini` dengan perintah berikut:
```
nano /etc/php.ini
```
Sesuikan dengan parameter berikut:
```jsx showLineNumbers title="/etc/php.ini"
max_execution_time = 180
max_input_time = 180
memory_limit = 256M
post_max_size = 50M
upload_max_filesize = 50M
```
Lalu restart `php-fpm` untuk menyimpan perubahan dengan perintah berikut:
```
systemctl restart php-fpm
```
Buat database dengan menjalankan perintah berikut:
```
mariadb
```

Lalu jalankan perintah berikut untuk membuat database, user, dan password:
```
create database ojs_db;
create user 'ojs_user'@'localhost' identified by 'aAHldpnbfY4GSGa3';
grant all on ojs_db.* to 'ojs_user'@'localhost';
flush privileges;
quit;
```

Download file OJS dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://pkp.sfu.ca/ojs/download/ojs-3.5.0-1.tar.gz
tar -xf ojs-3.5.0-1.tar.gz
mv ojs-3.5.0-1/* .
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Lanjutkan instalasi OJS melalui browser dengan mengetik nama domain atau IP. Kemudian, OJS akan melakukan pengecekan sistem, pastikan direktori sudah `writeable`
![](/img/almalinux8-lamp-apps-ojs1.png) <br/>

Lalu, buat akun administrator untuk OJS dan dilanjutkan dengan setting bahasa dan timezone
![](/img/almalinux8-lamp-apps-ojs2.png) <br/>

Setting direktori untuk upload data dan konfigurasi database yang sudah dibuat sebelumnya. Kemudian klik "Install Open Journal Systems"
![](/img/almalinux8-lamp-apps-ojs3.png) <br/>

Anda akan mendapatkan hasil berikut apabila OJS sudah berhasil di install
![](/img/almalinux8-lamp-apps-ojs4.png) <br/>

Berikut adalah tampilan dashboard OJS yang dapat diakses melalui `http://$DOMAIN/index.php/index/login`
![](/img/almalinux8-lamp-apps-ojs5.png) <br/>

## Troubleshooting

1. Error 500 Internal Server Error setelah instalasi OJS <br/>

Biasanya terjadi karena izin file dan folder yang salah atau modul PHP yang belum diaktifkan. Sesuaikan permission dengan perintah berikut:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Halaman OJS Kosong (Blank Page) <br/>

Biasanya karena PHP tidak menampilkan error atau modul penting tidak aktif. Aktifkan debug PHP dengan menambahkan pada `config.inc.php`:
```
nano /var/www/focusnic.biz.id/public_html/config.inc.php
```
Berikut adalah parameter yang harus disesuaikan:
```
display_errors = On
```

3. Masalah dengan Upload File (File tidak bisa diunggah) <br/>

Direktori `files` tidak dapat diakses oleh Apache. Pastikan folder `files` berada di luar direktori web root dan atur permission dengan perintah berikut:
```
mkdir /var/www/focusnic.biz.id/files
chmod -R 755 /var/www/focusnic.biz.id/files
chown -R apache:apache /var/www/focusnic.biz.id/files
```

## Kesimpulan

Proses **install OJS menggunakan LAMP Stack di AlmaLinux 8** membutuhkan beberapa langkah mulai dari instalasi Apache, MariaDB, PHP, hingga konfigurasi OJS itu sendiri. Dengan panduan lengkap ini, kita bisa membangun sistem manajemen jurnal ilmiah yang handal, aman, dan siap digunakan untuk publikasi.

Q: Apakah bisa menggunakan Nginx sebagai pengganti Apache? <br/>
A: Bisa. OJS dapat dijalankan di atas Nginx, namun konfigurasi lebih kompleks. Untuk pemula, Apache lebih direkomendasikan karena dokumentasi lebih lengkap.

Q: Bagaimana cara mengubah tampilan di OJS? <br/>
A: Masuk ke menu Administration > Site Settings > Appearance. OJS juga mendukung custom theme dengan memodifikasi file CSS dan template.

Q: Apakah bisa menggunakan OJS di shared hosting? <br/>
A: Bisa, tetapi tidak disarankan. OJS lebih stabil dan aman dijalankan di VPS atau dedicated server. Dengan shared hosting, performa terbatas dan kendala teknis sulit diatasi.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
