---
title: Panduan Lengkap Cara Install Mautic menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Mautic  menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Mautic
---

**Mautic** adalah salah satu **platform otomasi pemasaran open-source** yang populer karena fleksibilitas, skalabilitas, dan fitur canggihnya yang dapat disesuaikan sesuai kebutuhan bisnis. Dengan menggunakan Mautic, perusahaan dapat mengelola kampanye email, membangun form, membuat landing page, hingga melacak perilaku pelanggan. Dalam panduan ini, kita akan membahas **cara install Mautic menggunakan LAMP Stack di AlmaLinux 8** secara lengkap dan detail, sehingga Anda dapat menjalankannya di server dengan performa optimal.  

Jika Anda membutuhkan bantuan untuk instalasi server atau ingin memiliki **cloud VPS** yang siap digunakan, jangan ragu untuk menghubungi **Focusnic**.


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
Aktifkan modul PHP versi yang diinginkan. Misalnya, untuk PHP 8.3 jalankan perintah berikut:
```
dnf module reset php -y
dnf module enable php:remi-8.3 -y
```
Setelah repositori aktif, kita dapat melanjutkan dengan menginstal PHP beserta modul-modul penting yang umum digunakan:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap
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

## Install Mautic

Sebelum menginstall Mautic, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Mautic) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
create database mautic_db;
create user 'mautic_user'@'localhost' identified by 'x5NqrmKZfisDmQG8';
grant all on mautic_db.* to 'mautic_user'@'localhost';
flush privileges;
quit;
```

Download file Mautic dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://github.com/mautic/mautic/releases/download/6.0.4/6.0.4.zip
unzip 6.0.4.zip
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup Mautic melalui `http://$DOMAIN/installer`
![](/img/almalinux8-lamp-apps-mautic1.jpg)<br/>
Setup database Mautic, pastikan gunakan db, user, dan password yang sudah dibuat sebelumnya. Lanjutkan hingga proses pembuatan tabel database berhasil.
![](/img/almalinux8-lamp-apps-mautic2.jpg)<br/>
Kemudian buat user administrasi untuk Mautic
![](/img/almalinux8-lamp-apps-mautic3.jpg)<br/>
Berikut tampilan dashboard admin Mautic dapat diakses melalui `http://$DOMAIN/s/login`
![](/img/almalinux8-lamp-apps-mautic4.jpg)<br/>

## Troubleshooting

1. PHP Extension Missing <br/>

Periksa kembali apakah semua ekstensi PHP sudah terpasang. Jalankan perintah berikut untuk menginstall ekstensi PHP yang diperlukan:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json php-soap php-bcmath php-zip php-intl php-posix php-imap
```

2. Database Connection Failed <br/>

Pastikan database sudah dibuat dan user memiliki hak akses penuh. Jalankan perintah berikut untuk menguji koneksi database secara manual:
```
mariadb -u matomo_user -p
```

3. Email Tidak Terkirim <br/>

Gunakan SMTP server yang valid untuk mengirim email marketing. Pastikan server juga mengizinkan outbound SMTP port 25, 465, dan 587

## Kesimpulan

Menginstal **Mautic menggunakan LAMP Stack di AlmaLinux 8** memberikan Anda kontrol penuh terhadap sistem pemasaran digital. Dengan kombinasi AlmaLinux yang stabil, LAMP Stack yang kuat, dan Mautic yang fleksibel, bisnis Anda dapat membangun sistem otomasi marketing yang andal.

Namun, jika Anda tidak ingin membuang waktu untuk konfigurasi teknis, Anda bisa langsung mempercayakan instalasi server dan Mautic ke **Focusnic** yang siap memberikan solusi terbaik untuk bisnis Anda.

Q: Apakah Mautic gratis digunakan? <br/>
A: Ya, Mautic adalah platform open-source sehingga bisa digunakan tanpa biaya lisensi.

Q: Apakah AlmaLinux cocok untuk menjalankan Mautic? <br/>
A: Ya, AlmaLinux 8 sangat stabil, kompatibel dengan RHEL, dan mendukung semua dependensi Mautic.

Q: Berapa spesifikasi server minimal untuk Mautic? <br/>
A: Minimal 2 CPU, 4GB RAM, dan 20GB storage. Namun untuk campaign besar, disarankan lebih tinggi.

Q: Apakah Mautic bisa diintegrasikan dengan CRM lain? <br/>
A: Ya, Mautic mendukung integrasi dengan banyak sistem seperti Salesforce, HubSpot, dan lainnya.

Q: Bagaimana jika tidak ingin repot melakukan instalasi? <br/>
A: Anda bisa langsung menghubungi Focusnic untuk layanan jasa instalasi server dan cloud VPS.


Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
