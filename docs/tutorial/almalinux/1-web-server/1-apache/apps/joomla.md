---
title: Panduan Lengkap Cara Install Joomla menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Joomla menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Joomla
---

**Joomla** merupakan salah satu **Content Management System (CMS)** open-source paling populer yang digunakan untuk membuat situs web dinamis dan profesional. Dengan dukungan ekosistem yang besar, Joomla sangat cocok untuk blog, website perusahaan, hingga e-commerce. Dalam panduan ini, kita akan membahas **cara install Joomla menggunakan LAMP Stack di AlmaLinux 8**, langkah demi langkah secara **komprehensif**, agar situs Joomla berjalan **optimal dan aman**.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Joomla, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Joomla

Sebelum menginstall Joomla versi 5 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Joomla) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
create database joomla_db;
create user 'joomla_user'@'localhost' identified by 'bfhWbTcFFg93wc5s';
grant all on joomla_db.* to 'joomla_user'@'localhost';
flush privileges;
quit;
```

Download file Joomla dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://downloads.joomla.org/cms/joomla5/5-3-2/Joomla_5-3-2-Stable-Full_Package.zip?format=zip -O joomla.zip
unzip joomla.zip
cp htaccess.txt .htaccess
```

Sesuaikan permission:
```
cd /var/www/focusnic.biz.id/public_html
find . -type d -exec chmod u=rwx,g=rx,o= '{}' \;
find . -type f -exec chmod u=rw,g=r,o= '{}' \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi Joomla melalui browser, misalnya: `http://focusnic.biz.id` lalu sesuikan bahasa yang ingin digunakan dan isi nama situs lalu klik "Setup Login Data"
![](/img/almalinux8-lamp-apps-joomla1.jpg)<br/>
Kemudian setup nama administrator, username, password, dan email untuk Joomla. Lanjutkan dengan klik "Setup Database Connection"
![](/img/almalinux8-lamp-apps-joomla2.jpg)<br/>
Setup database, sesuaikan dengan database yang sudah dibuat sebelumnya seperti nama db, user, dan password lalu klik "Install Joomla"
![](/img/almalinux8-lamp-apps-joomla3.jpg)<br/>
Tunggu hingga instalasi selesai
![](/img/almalinux8-lamp-apps-joomla4.jpg)<br/>
Berikut adalah tampilan Joomla
![](/img/almalinux8-lamp-apps-joomla5.jpg)<br/>
Tampilan dashboard admnistarator silahkan massukkan username dan password yang dibuat sebelumnya, lalu silahkan buka halaman administrator Joomla di `http://$DOMAIN/administrator/`
![](/img/almalinux8-lamp-apps-joomla6.jpg)<br/>

## Troubleshooting

1. Halaman Joomla Kosong (Blank Screen / White Page) <br/>

**Penyebab:**

- Konfigurasi PHP tidak sesuai
- Ekstensi PHP yang dibutuhkan belum terpasang
- Error PHP tidak terlihat karena `display_errors` mati

**Solusi:**

- Periksa log PHP dan Apache:
```
tail -f /var/log/httpd/focusnic.biz.id-error.log
```
- Aktifkan error display:
```
nano /etc/php.ini
```
Sesuaikan parameter berikut:
```
display_errors = On
error_reporting = E_ALL
```
Restart php-fpm:
```
systemctl restart php-fpm
```

Kemudian coba akses dan cek apakah ada error yang muncul

2. Error “Cannot connect to the database” <br/>

Nama database, user, atau password salah. Pastikan MariaDB sudah running serta database, user, dan password sudah dibuat

3. Error 403 Forbidden <br/>

Permission direktori dan SELinux yang kurang tepat.

**Solusi:**
```
chown -R apache:apache /var/www/focusnic.biz.id
setsebool -P httpd_unified 1
setsebool -P httpd_can_network_connect_db 1
```

4. Joomla Tidak Menyimpan Konfigurasi <br/>

File `configuration.php` permission tidak sesuai.

**Solusi:**
```
chmod 644 /var/www/focusnic.biz.id/public_html/configuration.php
```

## Kesimpulan

Instalasi **Joomla dengan LAMP Stack di AlmaLinux 8** adalah proses yang relatif mudah jika dilakukan secara sistematis dan sesuai panduan. Dengan menyiapkan **Apache, MariaDB, dan PHP** secara benar, serta mengonfigurasi permission dan database dengan tepat, Joomla dapat berjalan **stabil, cepat, dan aman**. Menjalankan Joomla di atas AlmaLinux memberikan keuntungan stabilitas, keamanan tingkat enterprise, serta dukungan jangka panjang (LTS). Kombinasi ini menjadikan Joomla pilihan solid untuk situs bisnis, organisasi, dan kebutuhan profesional lainnya.

Q: Apa perbedaan antara Joomla dan CMS lainnya seperti WordPress? <br/>
A: Joomla menawarkan struktur yang lebih fleksibel dalam hal manajemen konten dan kontrol akses. Cocok untuk website yang membutuhkan sistem multiuser kompleks.

Q: Bisakah saya menggunakan Nginx sebagai pengganti Apache? <br/>
A: Ya, namun panduan ini menggunakan Apache karena kompatibilitasnya tinggi dan lebih mudah dikonfigurasi untuk pemula.

Q: Apakah Joomla aman digunakan untuk website e-commerce? <br/>
A: Ya. Dengan pengaturan keamanan yang tepat, update rutin, serta penggunaan ekstensi terpercaya, Joomla dapat digunakan untuk e-commerce secara aman.

Q: Apakah saya wajib menggunakan SSL/HTTPS? <br/>
A: Sangat disarankan untuk keamanan dan kepercayaan pengguna. Joomla mendukung SSL, dan Anda bisa mengaktifkannya dengan mudah menggunakan Let’s Encrypt.

Q: Apakah saya bisa install Joomla di server lokal (localhost)? <br/>
A: Bisa, Joomla bisa dijalankan di localhost untuk pengembangan dan testing. Namun, untuk produksi tetap disarankan menggunakan server atau VPS.

Q: Apakah saya wajib menggunakan domain untuk Joomla? <br/>
A: Tidak, Anda bisa menjalankan Joomla di localhost atau IP publik, tetapi untuk produksi sangat disarankan menggunakan domain dan SSL.

Q: Berapa minimum RAM untuk server Joomla? <br/>
A: Minimal RAM 1 GB, namun disarankan 2 GB atau lebih untuk performa optimal, apalagi jika situs menggunakan banyak ekstensi.

Q: Apakah Joomla bisa berjalan di PHP 8? <br/>
A: Ya, Joomla versi terbaru sudah mendukung PHP 8.x. Pastikan semua ekstensi PHP kompatibel.

Q: Apakah MariaDB aman digunakan untuk Joomla? <br/>
A: MariaDB adalah pilihan default yang sangat stabil dan didukung penuh oleh Joomla.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
