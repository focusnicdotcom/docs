---
title: Panduan Lengkap Cara Install Moodle menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Moodle menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Moodle
---

Dalam panduan ini, kita akan membahas langkah demi langkah **cara install Moodle menggunakan LAMP Stack di AlmaLinux 8**. Moodle (Modular Object-Oriented Dynamic Learning Environment) adalah salah satu platform **Learning Management System (LMS)** paling populer dan banyak digunakan di dunia pendidikan untuk membuat lingkungan belajar daring yang fleksibel dan kuat. Kita akan mengkonfigurasi Moodle dengan dukungan LAMP Stack (**Linux, Apache, MariaDB/MySQL, dan PHP**), memastikan performa optimal serta keamanan maksimal.

## Prerequisite

- Akses full root
- Domain (opsional)
- Basic Linux Command Line

## Persiapan

:::danger
Pastikan firewall dan SELinux telah disesuaikan atau dinonaktifkan sementara jika ingin menghindari kendala saat instalasi awal.
:::

Sebelum memulai instalasi Moodle, pastikan server AlmaLinux 8 Anda sudah dalam kondisi terbaru dan siap untuk menginstal LAMP Stack (Linux, Apache, MariaDB, PHP).
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

## Install Moodle

Sebelum menginstall Moodle versi 5 yang terbaru, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Moodle) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
create database moodle_db;
create user 'moodle_user'@'localhost' identified by 'kYHjenQ9NuWTULX1';
grant all on moodle_db.* to 'moodle_user'@'localhost';
flush privileges;
quit;
```

Download file Moodle dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Moodle sesuai dengan model administrator dan juga agar mempermudah update untuk kedepannya (referensi https://docs.moodle.org/500/en/Git_for_Administrators):
```
cd /var/www/focusnic.biz.id/public_html
git clone git://git.moodle.org/moodle.git
cd moodle
git branch --track MOODLE_500_STABLE origin/MOODLE_500_STABLE
git branch -a
git checkout MOODLE_500_STABLE
cd ..
mv moodle/* .
```

Ubah konfigurasi tipe database berikut ke mariadb:
```
cd /var/www/focusnic.biz.id/public_html
nano config.php
```
Sesuaikan parameter berikut menjadi mariadb atau berikan komentar pada konfigurasi saat ini dan buat tipe database baru:
```jsx showLineNumbers title="/var/www/focusnic.biz.id/public_html/config.php"
//$CFG->dbtype = 'mysqli';
$CFG->dbtype = 'mariadb';
```
Tweak konfigurasi PHP `max_input_vars` ke 5000:
```
nano /etc/php.ini
```
Sesuaikan parameter berikut menjadi 5000 atau berikan komentar pada konfigurasi saat ini dan buat value baru:
```jsx showLineNumbers title="/etc/php.ini"
;max_input_vars = 1000
max_input_vars=5000
```
Restart php-fpm untuk menyimpan perubahan:
```
systemctl restart php-fpm
```
Sesuaikan permission pada direktori Moodle:
```
chown -R apache:apache /var/www/focusnic.biz.id
```

Akses instalasi Moodle melalui browser, misalnya: `http://focusnic.biz.id` pilih bahasa lalu klik "Next" 
![](/img/almalinux8-lamp-apps-moodle1.jpg)<br/>
Kemudian konfirmasi path untuk direktori Moodle dan Moodle Data. Biasanya Moodle Data direkomendasikan ada diluar `public_html` karena berisi data sensitif yang tidak seharusnya diakses secara publik. Jika sudah mengkonfirmasi path direktori Moodle silahkan klik "Next"
![](/img/almalinux8-lamp-apps-moodle2.jpg)<br/>
Pilih tipe database driver lalu klik "Next"
![](/img/almalinux8-lamp-apps-moodle3.jpg)<br/>
Lalu isi informasi database yang sudah dibuat seperti nama db, username, dan password. Untuk database port dan socket silahkan kosongkan karena kita akan menggunakan local DB dengan server yang sama dengan instalasi Moodle. Jika sudah, lalu klik "Next"
![](/img/almalinux8-lamp-apps-moodle4.jpg)<br/>
Konfirmasi instalasi Moodle dan lisensi agreement, lanjutkan dengan klik "Continue"
![](/img/almalinux8-lamp-apps-moodle5.jpg)<br/>
Sebelum instalasi, Moodle akan melakukan pengecekan pastikan beberapa server side yang dibutuhkan oleh Moodle sudah terpenuhi agar instalasi dapat dilanjutkan. Jika sudah, maka scroll ke bawah lalu klik "Continue" untuk melanjutkan instalasi
![](/img/almalinux8-lamp-apps-moodle6.jpg)<br/>
Lanjutkan dengan membuat user admin untuk Moodle, lalu klik "Update profile"
![](/img/almalinux8-lamp-apps-moodle7.jpg)<br/>
Isi nama home front page Moodle, lalu klik "Save changes"
![](/img/almalinux8-lamp-apps-moodle8.jpg)<br/>
Selanjutnya akan muncul halaman untuk register ke Moodle, ini bersifat opsional silahkan "skip" jika tidak ingin me-registrasikan instalasi Moodle. Berikut adalah tampilan instalasi Moodle. Untuk login ke halaman admin silahkan ketik URL berikut pada browser `http://$DOMAIN/my`
![](/img/almalinux8-lamp-apps-moodle9.jpg)<br/>

## Troubleshooting

1. File Permission <br/>

Tidak bisa mengunggah file, error muncul di interface admin. Solusi:

- Pastikan direktori moodledata berada di luar direktori `public_html`.
- Pastikan permission dan ownership sesuai:
```
chown -R apache:apache /var/www/focusnic.biz.id
chmod -R 770 /var/www/focusnic.biz.id/moodledata
```

2. PHP Extension Tidak Terdeteksi <br/>

Saat instalasi, Moodle memperingatkan bahwa ekstensi PHP seperti intl, soap, atau xmlrpc hilang. Install ekstensi yang diminta:
```
dnf install php-intl php-soap php-xmlrpc
```

Restart php-fpm dan Apache:
```
systemctl restart php-fpm httpd
```

3. Error Database Connection <br/>

Pastikan database MariaDB/MySQL sudah running, dan juga username, password, serta DB sudah dibuat dan sesuai.

## Kesimpulan

Menginstal Moodle di atas **LAMP Stack pada AlmaLinux 8** adalah proses yang cukup teknis namun sangat bisa dilakukan dengan mengikuti panduan langkah demi langkah. Mulai dari instalasi Apache, MariaDB, PHP, hingga konfigurasi Moodle dan optimasi keamanannya, semuanya harus dilakukan dengan teliti agar platform e-learning ini dapat berjalan dengan lancar, aman, dan efisien.

Jika Anda membutuhkan platform e-learning berbasis Moodle yang **siap pakai, optimal, dan aman**, **jangan ragu untuk ke Focusnic**. Kami siap membantu mulai dari penyediaan VPS, instalasi Moodle, hingga optimasi performa server untuk kebutuhan pembelajaran daring Anda.


Q: Apakah Moodle hanya bisa diinstall di AlmaLinux? <br/>
A: Tidak. Moodle juga bisa diinstal di distribusi lain seperti Ubuntu, Debian, CentOS, maupun Windows. Namun, AlmaLinux memberikan kestabilan yang baik untuk kebutuhan server jangka panjang.

Q: Apa perbedaan Moodle dengan LMS lain seperti Google Classroom? <br/>
A: Moodle adalah platform open-source yang sangat fleksibel dan bisa dihosting sendiri. Sedangkan Google Classroom adalah layanan berbasis cloud yang terbatas pada fitur tertentu dan tidak bisa dikustomisasi.

Q: Apakah Moodle gratis digunakan untuk institusi pendidikan? <br/>
A: Ya. Moodle sepenuhnya gratis dan open-source, baik untuk sekolah, kampus, maupun pelatihan perusahaan.

Q: Apakah Moodle bisa menangani ribuan user sekaligus? <br/>
A: Bisa, dengan syarat server Anda memiliki spesifikasi yang memadai (RAM, CPU, disk I/O) dan sudah dioptimasi.

Q: Apakah Moodle bisa diinstall di shared hosting? <br/>
A: Bisa, tetapi tidak direkomendasikan karena keterbatasan sumber daya dan rawan di suspend dari pihak hosting. Sebaiknya coba gunakan VPS agar lebih stabil dan fleksibel.

Q: Berapa minimal RAM yang dibutuhkan untuk Moodle? <br/>
A: Minimal 2 GB RAM untuk instalasi dasar, namun disarankan minimal 4 GB untuk penggunaan aktif.

Q: Apakah bisa pakai Nginx bukan Apache? <br/>
A: Bisa, tapi konfigurasi akan sedikit berbeda. Panduan ini khusus membahas dengan Apache.

Q: Apakah Moodle gratis? <br/>
A: Ya, Moodle adalah open-source dan bebas digunakan.

Q: Bagaimana cara membuat backup Moodle? <br/>
A: Backup terdiri dari dua bagian: file/folder dan database. Gunakan perintah `mysqldump` untuk database dan salin folder `moodle` serta `moodledata`.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
