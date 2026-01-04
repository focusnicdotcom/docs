---
title: Panduan Lengkap Cara Install Krayin CRM menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install Krayin CRM  menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: Krayin CRM
---

Krayin CRM merupakan salah satu sistem **Customer Relationship Management (CRM)** berbasis open-source yang dibangun menggunakan **Laravel**. Dengan desain modular, fleksibel, dan ramah pengguna, Krayin CRM cocok untuk berbagai skala bisnis yang ingin mengelola interaksi pelanggan, pipeline penjualan, serta aktivitas pemasaran dalam satu platform terpusat. Pada panduan ini, kita akan membahas secara **detail langkah-langkah instalasi Krayin CRM menggunakan LAMP Stack di AlmaLinux 8**, lengkap dengan konfigurasi server agar performanya maksimal.

Jika Anda sedang membangun **CRM self-hosted** untuk bisnis, Panduan ini menjadi panduan yang tepat.

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

## Install Krayin CRM

Sebelum menginstall Krayin CRM, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur Krayin CRM) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/krayincrmapp/public

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
mkdir -p /var/www/focusnic.biz.id/
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
create database krayincrm_db;
create user 'krayincrm_user'@'localhost' identified by 'BJr3zrrwqEtkXqA7';
grant all on krayincrm_db.* to 'krayincrm_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen Krayin CRM seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
:::

```
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```
Cek versi composer:
```
composer --version
```
Contoh output:
```
Composer version 2.8.10 2025-07-10 19:08:33
PHP version 8.4.10 (/usr/bin/php)
```

Download file Krayin CRM dan letakkan pada direktori sesuai virtualhost, kita akan mendownload Krayin CRM dan membuat project dengan nama `krayincrmapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id
composer create-project krayin/laravel-crm krayincrmapp
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/krayincrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/krayincrmapp -type d -exec chmod 755 {} \;
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/storage
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/bootstrap/cache
chown -R apache:apache /var/www/focusnic.biz.id
```
Install Krayin CRM mengunakan perintah berikut:

:::info
Langkah instalasi Krayin CRM seperti setup database, migration, serta langkah basic lainnya seperti membuat akun untuk administrasi Krayin CRM dilakukan pada perintah berikut.
:::

```
cd /var/www/focusnic.biz.id/krayincrmapp
php artisan config:clear
php artisan config:cache
php artisan krayin-crm:install
```

Contoh output:
```
Please enter the application name: Krayin CRM
Please enter the application URL: http://focusnic.biz.id
Please select the default application locale: English
Please select the default currency: Indonesian Rupiah
Please select the database connection: mysql
Please enter the database host: 127.0.0.1
Please enter the database port: 3306
Please enter the database name: krayincrm_db
Please enter the database prefix: [ENTER]
Please enter your database username: krayincrm_user
Please enter your database password: ••••••••••••••••

Enter the name of the admin user: admin
Enter the email address of the admin user: admin@focusnic.biz.id
Configure the password for the admin user: 68gYAMTv2CzByYk5

 _   __                _       
| | / /               (_)      
| |/ / _ __ __ _ _   _ _ _ __  
|    \| '__/ _` | | | | | '_ \ 
| |\  \ | | (_| | |_| | | | | |
\_| \_/_|  \__,_|\__, |_|_| |_|
                  __/ |        
                 |___/         



Welcome to the Krayin project! Krayin Community is an open-source CRM solution
which is built on top of Laravel and Vue.js.

Made with 💖  by the Krayin Team. Happy helping :)
```

Berikut adalah tampilan dashboard Krayin CRM yang dapat diakses melalui `http://$DOMAIN/admin/login`
![](/img/almalinux8-lamp-apps-krayincrm1.png) <br/>

## Troubleshooting

1. Error 500 Internal Server Error Krayin CRM <br/>

Permission pada folder storage dan bootstrap/cache tidak sesuai. Jalankan perintah berikut untuk menyesuaikannya:
```
find /var/www/focusnic.biz.id/krayincrmapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/krayincrmapp -type d -exec chmod 755 {} \;
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/storage
chmod 775 /var/www/focusnic.biz.id/krayincrmapp/bootstrap/cache
chown -R apache:apache /var/www/focusnic.biz.id
```

2. Database Connection Error Crayin CRM <br/>

Konfigurasi `.env` salah, terutama pada `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD`.

Solusinya adalah pastikan nama database, username, dan password sudah benar sesuai dengan informasi database yang sudah dibuat. Cek pada file berikut `/var/www/focusnic.biz.id/krayincrmapp/.env`

4. Krayin CRM Tidak Bisa Login Setelah Instalasi <br/>

Cache Laravel belum di-clear setelah konfigurasi. Jalankan perintah berikut:
```
cd /var/www/focusnic.biz.id/krayincrmapp/
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

5. URL atau Domain Tidak Bisa Diakses <br/>

Apache belum mengaktifkan `AllowOverride All` pada konfigurasi Virtual Host. Periksa file virtualhost dan sesuaikan dengan parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/krayincrmapp/public

    <Directory /var/www/focusnic.biz.id>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

## Kesimpulan

Menginstall **Krayin CRM di AlmaLinux 8 menggunakan LAMP Stack** memerlukan langkah sistematis mulai dari setup server, konfigurasi Apache, MariaDB, PHP, hingga penyesuaian Laravel. Jika dilakukan dengan benar, Krayin CRM dapat berjalan optimal dan siap digunakan untuk mengelola pelanggan, pipeline penjualan, hingga otomasi bisnis.

Dengan panduan ini, kita sudah membahas secara rinci **troubleshooting, FAQ, dan tips optimasi server**. Namun, bagi yang tidak ingin repot melakukan instalasi manual, solusi terbaik adalah mempercayakan prosesnya pada **Focusnic**, penyedia layanan terpercaya untuk **install server, cloud VPS, dan konfigurasi Krayin CRM** dengan standar profesional.

Q: Apa syarat minimum server untuk menjalankan Krayin CRM di AlmaLinux 8? <br/>
A: 
- CPU: 2 vCPU
- RAM: 4 GB (disarankan 8 GB untuk produksi)
- Storage: 20 GB SSD/NVMe
- OS: AlmaLinux 8 dengan LAMP Stack

Q: Apakah Krayin CRM bisa menggunakan Nginx selain Apache? <br/>
A: Ya, Krayin CRM dapat dijalankan menggunakan Nginx. Namun pada panduan ini digunakan Apache karena lebih sederhana untuk konfigurasi `.htaccess`.

Q: Apakah Krayin CRM mendukung multi-user dan multi-role? <br/>
A: Ya, Krayin CRM mendukung sistem multi-user dengan role-based access control (RBAC). Setiap user dapat diberikan hak akses yang berbeda sesuai kebutuhan bisnis.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
