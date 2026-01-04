---
title: Panduan Lengkap Cara Install WordPress menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install WordPress menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: WordPress
---

WordPress merupakan salah satu CMS (Content Management System) paling populer di dunia. Kombinasi antara WordPress dan LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP) menjadi pilihan ideal bagi pengguna yang ingin membangun situs web yang cepat, fleksibel, dan dapat diandalkan. Dalam panduan ini, kita akan membahas **cara install WordPress menggunakan LAMP Stack di AlmaLinux 8** secara lengkap, mulai dari instalasi server hingga konfigurasi akhir WordPress.

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
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json
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
Dari output diatas terlihat bahwa tersedia versi terbaru MariaDB yaitu versi 10.11. Kita akan menggunakan versi terbaru dari MariaDB dengan me-reset default module agar dapat menggunakan versi terbaru:
```
dnf module reset mariadb
```
Lalu jalankan perintah berikut untuk menginstall MariaDB versi terbaru:
```
dnf module install mariadb:10.11
```
Enable dan aktifkan service MariaDB:
```
systemctl enable --now mariadb
systemctl status mariadb
```
Sebelum digunakan untuk produksi atau testing, sebaiknya amankan terlebih dahulu instalasi MariaDB dengan menjalankan perintah berikut:
```
mysql_secure_installation
```
Kemudian ikuti petunjuk yang muncul:

- Enter current password for root (enter for none) → **[ENTER]**
- Switch to unix_socket authentication → **Y**
- Change the root password? → **Y**
- Remove anonymous users? → **Y**
- Disallow root login remotely? **Y**
- Remove test database and access to it? **Y**
- Reload privilege tables now? **Y**

## Install WordPress

Sebelum menginstall WordPress, kita akan membuat virtualhost dan database terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
:::info
Pastikan gunakan domain yang valid (FQDN) dan juga DNS A record sudah di arahkan atau di pointing sesuai dengan IP server yang digunakan pada server.
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
mysql
```

Lalu jalankan perintah berikut untuk membuat database, user, dan password:
```
create database wordpress_db;
create user 'wordpress_user'@'localhost' identified by 'U99cy7LjOpBJnAUC';
grant all on wordpress_db.* to 'wordpress_user'@'localhost';
flush privileges;
quit;
```

Download file WordPress dan letakkan pada direktori sesuai virtualhost:
```
cd /var/www/focusnic.biz.id/public_html
wget https://wordpress.org/latest.zip
unzip latest.zip
mv wordpress/* .
```
Sesuaikan permission:
```
chown -R apache:apache /var/www/focusnic.biz.id
```
Akses instalasi WordPress melalui browser, misalnya: `http://focusnic.biz.id` kemudian klik "Continue"
![](/img/almalinux8-lamp-apps-wp1.jpg)<br/>

Masukkan informasi database yang sudah dibuat sebelumnya lalu klik "Submit"
![](/img/almalinux8-lamp-apps-wp2.jpg)<br/>

Klik "Run the installation"
![](/img/almalinux8-lamp-apps-wp3.jpg)<br/>

Masukkan informasi situs, user dan password untuk keperluan administrasi WordPress, lalu klik "Install WordPress"
![](/img/almalinux8-lamp-apps-wp4.jpg)<br/>

Berikut tampilan jika WordPress sudah berhasil diinstall
![](/img/almalinux8-lamp-apps-wp5.jpg)<br/>

Silahkan login halaman admin WordPress melalui URL seperti berikut: `http://$DOMAIN/wp-admin` dan berikut adalah tampilan dashboard admin WordPress
![](/img/almalinux8-lamp-apps-wp6.jpg)<br/>

## Troubleshooting

1. Apache Tidak Bisa Diakses dari Browser <br/>

**Penyebab umum:**

- Apache belum berjalan
- Firewall belum membuka port 80/443
- SELinux menghalangi akses

**Solusi**:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
setsebool -P httpd_can_network_connect 1
```

2. Halaman WordPress Kosong atau Error 500 <br/>

**Penyebab umum:**

- Versi PHP tidak kompatibel
- Modul PHP kurang lengkap
- Permission file tidak tepat

**Solusi:**
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json
chown -R apache:apache /var/www/focusnic.biz.id
systemctl restart httpd
```

3. Tidak Bisa Terkoneksi ke Database <br/>

**Penyebab umum:**

- Nama user/password salah di `wp-config.php`
- Database belum dibuat
- Hak akses user ke database belum diberikan

4. Gagal Menyimpan Pengaturan atau Gambar Tidak Muncul <br/>

Kurang permission pada direktori `wp-content`. Solusi:
```
chown -R apache:apache /var/www/focusnic.biz.id
chmod -R 755 /var/www/focusnic.biz.id/public_html/wp-content
```

## Kesimpulan

Menginstall WordPress menggunakan **LAMP Stack pada AlmaLinux 8** merupakan solusi yang kuat dan efisien untuk menjalankan website berbasis PHP dan MySQL dengan performa tinggi. Dengan mengikuti panduan ini secara menyeluruh, Anda dapat men-deploy situs WordPress Anda dengan sistem operasi yang stabil, web server yang handal, dan database yang cepat.

Q: Apakah AlmaLinux 8 cocok untuk produksi WordPress? <br/>
A: Ya, AlmaLinux 8 adalah sistem operasi stabil berbasis RHEL yang sangat cocok untuk lingkungan server produksi WordPress.

Q: Apakah saya harus menggunakan MariaDB atau bisa juga MySQL? <br/>
A: Keduanya kompatibel, tetapi MariaDB lebih umum di distribusi Linux modern seperti AlmaLinux.

Q: Bisakah WordPress dijalankan tanpa domain? <br/>
A: Ya, WordPress bisa dijalankan menggunakan alamat IP, tetapi lebih baik menggunakan domain untuk konfigurasi optimal.

Q: Apakah Focusnic menyediakan layanan migrasi atau instalasi WordPress? <br/>
A: Tentu. Focusnic menyediakan jasa install server, setup WordPress, migrasi hosting, dan cloud VPS dengan dukungan penuh. Anda cukup fokus mengembangkan konten, biarkan Focusnic menangani teknisnya.


Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
