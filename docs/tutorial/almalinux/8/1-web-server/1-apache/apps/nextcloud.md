---
title: Panduan Lengkap Cara Install Nextcloud menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Nextcloud menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Nextcloud
---

**Nextcloud** adalah solusi **cloud storage** yang dapat digunakan untuk menyimpan, mengelola, dan berbagi data secara mandiri tanpa bergantung pada layanan pihak ketiga. Dengan menggunakan **LAMP Stack** (Linux, Apache, MariaDB/MySQL, PHP) di **AlmaLinux 8**, kita dapat membangun platform **private cloud** yang aman, stabil, dan dapat disesuaikan dengan kebutuhan bisnis maupun pribadi.

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

## Install Nextcloud

Sebelum menginstall Nextcloud, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Nextcloud) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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

    <IfModule mod_dav.c>
      Dav off
    </IfModule>

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
create database nextcloud_db;
create user 'nextcloud_user'@'localhost' identified by 'mjAVU3Jv9hTCQsg3';
grant all on nextcloud_db.* to 'nextcloud_user'@'localhost';
flush privileges;
quit;
```

Download file Nextcloud dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://download.nextcloud.com/server/releases/latest.zip
unzip latest.zip
mv nextcloud/* .
mv nextcloud/.htaccess .
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup Nextcloud melalui `http://$DOMAIN`. Buat user untuk administrasi Nextcloud, dan juga koneksi database yang telah dibuat sebelumnya

:::info
Untuk meningkatkan tingkat keamanan pada instalasi Nextcloud, sangat disarankan untuk menyimpan direktori `data` di lokasi yang terpisah dari `public_html`. Dengan cara ini, Anda dapat melindungi data sensitif dari akses yang tidak sah melalui web.
:::

![](/img/almalinux8-lamp-apps-nextcloud1.jpg)<br/>
Lanjutkan instalasi dengan menginstall Recommended Apps
![](/img/almalinux8-lamp-apps-nextcloud2.jpg)<br/>
Berikut adalah tampilan dashboard admin Nextcloud
![](/img/almalinux8-lamp-apps-nextcloud3.jpg)<br/>

## Troubleshooting

1. Error 500 Internal Server Error <br/>

Biasanya disebabkan oleh permission file yang salah atau modul PHP yang tidak terpasang. Solusi:
```
find /var/www/focusnic.biz.id/public_html -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/public_html -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
dnf install php-mbstring php-gd php-intl php-xml -y
systectl restart httpd
```

2. Tidak Bisa Upload File Lebih dari 2MB <br/>

Pengaturan default PHP membatasi ukuran upload. Solusinya adalah mengubah value `php.ini`:
```
nano /etc/php.ini
```
Cari parameter `upload_max_filesize` dan `post_max_size` lalu sesuikan dengan value berikut atau bisa disesuaikan dengan kebutuhan:
```
upload_max_filesize = 1G
post_max_size = 1G
```
Restart php-fpm untuk menyimpan perubahan:
```
systemctl restart php-fpm
```

3. Cron Job Tidak Berjalan <br/>

Cron belum diatur atau user Apache tidak memiliki hak akses. Jalankan perintah berikut:
```
sudo crontab -u apache -e
```
Tambahkan parameter berikut:
```
*/5 * * * * php -f /var/www/focusnic.biz.id/public_html/cron.php
```

## Kesimpulan

Panduan ini membahas secara detail **cara install Nextcloud menggunakan LAMP Stack di AlmaLinux 8**, mulai dari persiapan server, instalasi Apache, MariaDB, dan PHP. Dengan konfigurasi yang benar, **Nextcloud** dapat menjadi solusi **private cloud** yang aman, stabil, dan dapat diandalkan. Kelebihan utama menggunakan LAMP di AlmaLinux adalah **stabilitas, keamanan, dan dukungan jangka panjang**.

Q: Apakah Nextcloud gratis digunakan? <br/>
A: Ya, Nextcloud adalah software open-source dan dapat digunakan secara gratis. Namun, ada juga layanan berbayar dengan dukungan enterprise.

Q: Apakah Nextcloud bisa diakses dari Android/iOS? <br/>
A: Ya, tersedia aplikasi resmi Nextcloud di Google Play Store dan Apple App Store untuk memudahkan sinkronisasi data.

Q: Apakah Nextcloud bisa menggunakan HTTPS? <br/>
A: Bisa, dan sangat direkomendasikan. Gunakan Certbot untuk mendapatkan sertifikat SSL gratis dari Let’s Encrypt.

Q: Bagaimana cara backup data Nextcloud? <br/>
A: Backup dapat dilakukan dengan mengarsipkan folder instalasi Nextcloud `/var/www/focusnic.biz.id/` dan dump database MariaDB menggunakan `mysqldump`.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
