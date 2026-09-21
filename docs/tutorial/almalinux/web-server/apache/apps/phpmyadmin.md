---
title: Panduan Lengkap Cara Install phpMyAdmin menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install phpMyAdmin  menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: phpMyAdmin
---

Mengelola database **MySQL atau MariaDB** sering kali membutuhkan antarmuka grafis yang mudah digunakan. Salah satu tool paling populer adalah **phpMyAdmin**, yang dapat diakses melalui browser untuk memudahkan administrasi database. Pada panduan ini akan dibahas secara rinci bagaimana cara melakukan **install phpMyAdmin di AlmaLinux 8 menggunakan LAMP Stack**.

**phpMyAdmin** adalah aplikasi berbasis PHP yang digunakan untuk mengelola database MySQL/MariaDB melalui browser. Keunggulannya terletak pada tampilan grafis yang intuitif, sehingga pengguna tidak perlu selalu mengandalkan perintah SQL manual. Sedangkan **AlmaLinux 8** adalah distribusi Linux berbasis RHEL (Red Hat Enterprise Linux) yang dirancang untuk stabilitas jangka panjang, sehingga sangat cocok untuk server produksi Jika digabungkan dengan **LAMP Stack (Linux, Apache, MySQL/MariaDB, PHP)**, phpMyAdmin akan menjadi tool yang sangat powerful untuk mengelola database website maupun aplikasi.

Dengan mengikuti langkah-langkah berikut, server Anda akan siap digunakan untuk mengelola database secara aman, cepat, dan efisien.

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

## Install phpMyAdmin

:::info
Pastikan menggunakan domain yang valid (FQDN) dan juga DNS A record sudah di arahkan atau di pointing sesuai dengan IP server yang digunakan pada server.
:::

Untuk menginstall phpMyAdmin kita akan menggunakan repository dari Remi menggunakan perintah berikut:
```
dnf --enablerepo=remi install phpmyadmin
```

Kemudian konfigurasi virtualhost phpMyAdmin:
```
nano /etc/httpd/conf.d/phpMyAdmin.conf
```
Ubah parameter berikut untuk mengizinkan semua IP address mengakses phpMyAdmin:

:::warning
Ketika sudah produksi, pastikan untuk mengizinkan IP tertentu saja. Berikut contoh konfigurasinya:
```
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

   Require ip 192.168.2.3
   Require ip 192.168.5.0/24
</Directory>
```
:::

```jsx showLineNumbers title="/etc/httpd/conf.d/phpMyAdmin.conf"
<Directory /usr/share/phpMyAdmin/>
   AddDefaultCharset UTF-8

#   Require local
    Require all granted
</Directory>
```
Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Berikut adalah tampilan phpMyAdmin, dapat di akses melalui `http://$DOMAIN/phpmyadmin` atau `http://$IP-ADDRESS/phpmyadmin`
:::info
Anda dapat menggunakan password `root` atau user yang sudah dibuat pada database Mariadb diatas.
:::

![](/img/almalinux8-lamp-apps-phpmyadmin1.jpg)<br/>

## Troubleshooting

1. Error 403 Forbidden <br/>

Biasanya karena konfigurasi Apache masih membatasi akses hanya untuk localhost. Periksa kembali konfigurasi `/etc/httpd/conf.d/phpMyAdmin.conf` untuk mengizinkan IP yang Anda gunakan.
2. Login gagal meskipun password benar <br/>

Bisa jadi karena `auth_socket` plugin aktif di MariaDB. Ubah metode autentikasi ke `mysql_native_password`.
```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password-change-2025';
FLUSH PRIVILEGES;
```

3. Halaman kosong setelah login <br/>

Pastikan ekstensi PHP seperti `php-mbstring` dan `php-xml` sudah terpasang.


## Kesimpulan
Dengan mengikuti panduan di atas, kini Anda sudah berhasil melakukan **install phpMyAdmin menggunakan LAMP Stack di AlmaLinux 8**. phpMyAdmin memudahkan pengelolaan database MySQL/MariaDB secara visual, sehingga tidak perlu selalu menggunakan command line.

Q: Apakah phpMyAdmin aman digunakan di server produksi? <br/>
A: Ya, aman jika dikonfigurasi dengan benar. Pastikan menggunakan HTTPS, membatasi akses hanya dari IP tertentu, serta mengganti URL default /phpMyAdmin agar tidak mudah ditebak.

Q: Bagaimana jika lupa password root MariaDB? <br/>
A: Gunakan perintah berikut untuk reset:
```
systemctl stop mariadb
mysqld_safe --skip-grant-tables &
mysql -u root
```
Kemudian jalankan:
```
ALTER USER 'root'@'localhost' IDENTIFIED BY 'password-new-2025';
FLUSH PRIVILEGES;
```
Lalu restart MariaDB:
```
systemctl restart mariadb
```
Q: Apakah bisa menggunakan MySQL alih-alih MariaDB di AlmaLinux 8? <br/>
A: Bisa. Secara default AlmaLinux menggunakan MariaDB, tetapi MySQL tetap bisa diinstal dari repository resmi Oracle atau repo pihak ketiga.

Q: Apakah perlu memberi akses write ke direktori `/usr/share/phpMyAdmin/`? <br/>
A: Tidak perlu. Direktori ini sebaiknya tetap dengan owner `root` dan permission read-only untuk Apache. Hal ini menjaga keamanan dari exploit.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
