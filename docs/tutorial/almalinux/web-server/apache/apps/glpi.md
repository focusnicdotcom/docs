---
title: Panduan Lengkap Cara Install GLPI menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install GLPI menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: GLPI
---

**GLPI (Gestionnaire Libre de Parc Informatique)** adalah aplikasi open-source berbasis web yang digunakan untuk **manajemen aset TI, helpdesk, dan IT service management (ITSM)**. Dengan fitur yang kaya seperti pencatatan perangkat keras, perangkat lunak, tiket dukungan, hingga manajemen kontrak, GLPI menjadi solusi andal bagi organisasi yang ingin meningkatkan efisiensi operasional TI. Panduan ini akan membahas secara detail **cara install GLPI menggunakan LAMP Stack di AlmaLinux 8** dengan langkah-langkah yang komprehensif sehingga dapat membangun sistem manajemen TI yang profesional.

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

## Install GLPI

Sebelum menginstall GLPI, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur GLPI) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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

Lalu buat direktori pada virtualhost diatas:
```
mkdir -p /var/www/focusnic.biz.id/public_html
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
create database glpi_db;
create user 'glpi_user'@'localhost' identified by 'V4xSxIvyLacVmv69';
grant all on glpi_db.* to 'glpi_user'@'localhost';
flush privileges;
quit;
```

Download file GLPI dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://github.com/glpi-project/glpi/releases/download/10.0.19/glpi-10.0.19.tgz
tar -xf glpi-10.0.19.tgz
mv glpi/* .
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses GLPI melalui browser dengan mengetik nama domain atau IP. Pilih bahasa untuk GLPI
![](/img/almalinux8-lamp-apps-glpi1.png) <br/>
Setuju perjanjian lisensi GLPI
![](/img/almalinux8-lamp-apps-glpi2.png) <br/>
Kemudian pilih "Install"
![](/img/almalinux8-lamp-apps-glpi3.png) <br/>
GLPI akan melakukan compability checker sebelum melakukan proses instalasi, pastikan sudah aman semuanya
![](/img/almalinux8-lamp-apps-glpi4.png) <br/>
Silahkan isi dengan username dan password MySQL yang sudah dibuat sebelumnya
![](/img/almalinux8-lamp-apps-glpi5.png) <br/>
Kemudian pilih database yang sudah dibuat yaitu `glpi_db`. Tunggu hingga proses inisialisasi selesai lalu klik "Continue"
![](/img/almalinux8-lamp-apps-glpi6.png) <br/>
Berikut adalah beberapa informasi akses penting yang dapat disimpan untuk manajemen GLPI nantinya
![](/img/almalinux8-lamp-apps-glpi7.png) <br/>
Berikut adalah tampilan dashboard admin GLPI yang dapat diakses melalui `http://$DOMAIN` dan gunakan username default yaitu `glpi/glpi`
![](/img/almalinux8-lamp-apps-glpi8.png) <br/>

## Troubleshooting

1. Error 500 Internal Server Error GLPI <br/>
Biasa disebabkan karena permission yang salah. Jalankan perintah berikut untuk menyesuaikan permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Halaman Kosong (Blank Page) <br/>
Modul PHP yang dibutuhkan belum terinstal dengan benar. Jalankan perintah berikut untuk menginstall modul PHP dengan benar:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap php-ldap
```

## Kesimpulan

Q: Apa itu GLPI? <br/>
A: GLPI adalah aplikasi open-source berbasis web untuk manajemen aset TI, helpdesk, dan ITSM.

Q: Apakah GLPI gratis digunakan? <br/>
A: Ya, GLPI sepenuhnya gratis dan open-source, namun memerlukan server dengan spesifikasi memadai.

Q: Apakah GLPI bisa digunakan dengan Nginx? <br/>
A: Bisa, namun dokumentasi lebih luas tersedia untuk LAMP Stack sehingga lebih direkomendasikan.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
