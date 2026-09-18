---
title: Panduan Lengkap Cara Install EspoCRM menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install EspoCRM  menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: EspoCRM
---

**EspoCRM** adalah solusi **Customer Relationship Management (CRM)** berbasis open-source yang ringan, cepat, dan dapat diandalkan untuk berbagai kebutuhan bisnis. Dengan fitur lengkap seperti **manajemen penjualan, otomatisasi pemasaran, pelacakan prospek, hingga laporan mendalam**, EspoCRM menjadi pilihan tepat untuk perusahaan yang ingin mengoptimalkan hubungan dengan pelanggan. Panduan ini membahas secara detail langkah-langkah **instalasi EspoCRM menggunakan LAMP Stack (Linux, Apache, MariaDB, PHP)** pada **AlmaLinux 8**, sehingga dapat diimplementasikan dengan mudah dan optimal.

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

## Install EspoCRM

Sebelum menginstall EspoCRM, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur EspoCRM) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/espocrmapp/public

    Alias /client/ /var/www/focusnic.biz.id/espocrmapp/client/

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
mkdir -p /var/www/focusnic.biz.id/espocrmapp
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
create database espocrm_db;
create user 'espocrm_user'@'localhost' identified by '1AUw92jrNHN6yCk2';
grant all on espocrm_db.* to 'espocrm_user'@'localhost';
flush privileges;
quit;
```

Download file EspoCRM dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/espocrmapp
wget https://www.espocrm.com/downloads/EspoCRM-9.1.8.zip
unzip EspoCRM-9.1.8.zip
mv EspoCRM-9.1.8/* .
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/espocrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/espocrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup EspoCRM melalui `http://$DOMAIN`. Anda bisa mengatur bahasa dan tema jika pada langkah awal ini
![](/img/almalinux8-lamp-apps-espocrm1.jpg) <br/>
Baca dan setujui perjanjian lisensi EspoCRM untuk melanjutkan instalasi
![](/img/almalinux8-lamp-apps-espocrm2.png) <br/>
Kemudian isi informasi database dengan database yang sudah dibuat diatas, lalu test koneksi db sebelum melanjutkan
![](/img/almalinux8-lamp-apps-espocrm3.png) <br/>
EspoCRM akan melakukan pengecekan requirements, pastikan hasilnya adalah "Success"
![](/img/almalinux8-lamp-apps-espocrm4.png) <br/>
Buat user administrator untuk mengelola EspoCRM
![](/img/almalinux8-lamp-apps-espocrm5.png) <br/>
Kemudian sesuaikan system settings, yang paling terpenting disini adalah bahasa, mata uang, dan juga timezone
![](/img/almalinux8-lamp-apps-espocrm6.png) <br/>
Instalasi EspoCRM sudah berhasil, serta terdapat informasi untuk menambahkan cron job pada server agar EspoCRM dapat menjalankan *scheduled tasks* dengan lancar
![](/img/almalinux8-lamp-apps-espocrm7.png) <br/>

Silahkan masuk ke server dan tambahkan cron job menggunakan perintah berikut:
```
crontab -e
```
Isi dengan parameter berikut:
```
* * * * * cd /var/www/focusnic.biz.id/espocrmapp; /usr/bin/php -f cron.php > /dev/null 2>&1
```

Berikut adalah tampilan dashboard EspoCRM yang dapat diakses melalui `http://$DOMAIN`
![](/img/almalinux8-lamp-apps-espocrm8.png) <br/>

## Troubleshooting

1. Error "500 Internal Server Error" Setelah Instalasi EspoCRM <br/>

Permission folder tidak sesuai atau `mod_rewrite` belum aktif. Jalankan perintah berikut untuk menyesuaikan permission:
```
find /var/www/focusnic.biz.id/espocrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/espocrmapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Gagal Terhubung ke Database <br/>

Kredensial database salah atau user belum diberikan hak akses penuh. Jalankan perintah berikut untuk memberikan akses database:
```
mariadb
grant all on espocrm_db.* to 'espocrm_user'@'localhost';
flush privileges;
exit;
```

3. Frontend EspoCRM tidak muncul dengan benar ketika instalasi <br/>

Pastikan `Alias` pada virtualhost apache sudah ada. Sesuaikan denga virtualhost berikut dengan miliki Anda:

```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/espocrmapp/public

    Alias /client/ /var/www/focusnic.biz.id/espocrmapp/client/

    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

## Kesimpulan

Menggunakan **EspoCRM di AlmaLinux 8 dengan LAMP Stack** memberikan fleksibilitas tinggi, keamanan terjamin, dan performa yang optimal untuk manajemen pelanggan. Proses instalasi mencakup persiapan server, instalasi Apache, MariaDB, PHP, konfigurasi VirtualHost, hingga pengamanan dengan SSL.

Dengan panduan ini, diharapkan implementasi **EspoCRM** berjalan lancar tanpa kendala berarti. Untuk perusahaan yang ingin fokus pada bisnis tanpa direpotkan masalah teknis, **Focusnic** hadir sebagai solusi **layanan instalasi server dan cloud VPS yang profesional dan terpercaya**.

Q: Apakah EspoCRM Gratis <br/>
A: Ya, EspoCRM adalah software open-source dan dapat digunakan tanpa biaya lisensi. Namun, beberapa modul tambahan bersifat berbayar.

Q: Berapa Spesifikasi Minimum Server untuk EspoCRM?<br/>
A: Disarankan minimal 2 vCPU, 2GB RAM, dan 10GB storage untuk performa optimal. Untuk jumlah pengguna lebih dari 20, gunakan minimal 4GB RAM.

Q: Apa Perbedaan EspoCRM dengan SuiteCRM atau Vtiger? <br/>
A: EspoCRM lebih ringan, cepat, dan mudah disesuaikan dibanding CRM lain seperti SuiteCRM atau Vtiger, sehingga cocok untuk bisnis skala kecil hingga menengah.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
