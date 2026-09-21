---
title: Panduan Lengkap Cara Install Matomo Web Analytics menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Matomo Web Analytics  menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Matomo
---

**Matomo** adalah **platform analitik web open-source** yang memberikan kendali penuh atas data pengunjung situs. Dengan **Matomo**, kita dapat memantau statistik lalu lintas website secara akurat tanpa harus bergantung pada pihak ketiga. Pada panduan ini, kita akan membahas **cara instalasi Matomo Web Analytics di AlmaLinux 8 menggunakan LAMP Stack** secara lengkap, mulai dari persiapan server hingga pengaturan akhir di dashboard Matomo.

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

## Install Matomo

Sebelum menginstall Matomo, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Matomo) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
create database matomo_db;
create user 'matomo_user'@'localhost' identified by '2ia1ap2Hfrn1ATX6';
grant all on matomo_db.* to 'matomo_user'@'localhost';
flush privileges;
quit;
```

Download file Matomo dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://builds.matomo.org/matomo-latest.zip
unzip latest.zip
mv matomo/* .
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup Matomo melalui `http://$DOMAIN`
![](/img/almalinux8-lamp-apps-matomo1.jpg)<br/>
System check Matomo, pastikan semua dalam keadaan *checklist*. Lalu, scroll ke bawah dan klik "Next"
![](/img/almalinux8-lamp-apps-matomo2.jpg)<br/>
Setup database Matomo, pastikan gunakan db, user, dan password yang sudah dibuat sebelumnya. Lanjutkan hingga proses pembuatan tabel database berhasil.
![](/img/almalinux8-lamp-apps-matomo3.jpg)<br/>
Kemudian buat user administrasi untuk Matomo
![](/img/almalinux8-lamp-apps-matomo4.jpg)<br/>
Tambahkan domain yang ingin di track
![](/img/almalinux8-lamp-apps-matomo5.jpg)<br/>
Ikuti instruksi yang ada pada halaman ini untuk menambahkan tracker Matomo ke website
![](/img/almalinux8-lamp-apps-matomo6.jpg)<br/>
Matomo telah berhasil diinstall, scroll halaman ke bagian paling bawah dan klik "CONTINUE TO MATOMO"
![](/img/almalinux8-lamp-apps-matomo7.jpg)<br/>
Berikut tampilan dashboard admin Matomo dapat diakses melalui `http://$DOMAIN`
![](/img/almalinux8-lamp-apps-matomo8.jpg)<br/>

## Troubleshooting

1. Error "PHP extension missing" <br/>

Pastikan semua ekstensi PHP terpasang dengan menjalankan perintah berikut:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix
```

2. Error "Database connection failed" <br/>

Edit file konfigurasi `/var/www/focusnic.biz.id/public_html/config/config.ini.php` di folder Matomo dan sesuaikan dengan kredensial database.

3. Permission Denied pada Folder Matomo <br/>

Apache tidak memiliki izin menulis di folder Matomo. Berikan izin ke user Apache:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

## Kesimpulan

Dengan mengikuti panduan ini, kita telah berhasil menginstal **Matomo Web Analytics di AlmaLinux 8 menggunakan LAMP Stack**. Solusi ini memberikan **kontrol penuh atas data analitik** tanpa bergantung pada pihak ketiga, sekaligus menjaga privasi pengguna.

Jika ingin memiliki **server Matomo yang optimal, aman, dan terkelola dengan baik**, gunakan **jasa install server atau cloud VPS dari Focusnic** agar Anda dapat fokus pada pengembangan bisnis tanpa repot urusan teknis.


Q: Apakah Matomo gratis digunakan? <br/>
A: Ya, Matomo adalah software open-source yang dapat digunakan secara gratis. Namun, ada opsi layanan berbayar untuk fitur tambahan.

Q: Apakah Matomo bisa diintegrasikan dengan WordPress atau CMS lainnya? <br/>
A: Bisa. Matomo menyediakan plugin resmi untuk WordPress dan CMS lain seperti Joomla, Drupal, dan PrestaShop.

Q: Berapa minimal spesifikasi server untuk Matomo? <br/>
A: Minimal 2 GB RAM dan prosesor dual-core. Untuk trafik tinggi, disarankan 4 GB RAM atau lebih dengan SSD/NVMe.

Q: Apakah Matomo aman untuk data pengguna? <br/>
A: Ya, Matomo menyimpan semua data di server milik Anda sehingga privasi pengunjung lebih terjaga dibanding layanan analitik pihak ketiga.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
