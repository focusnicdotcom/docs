---
title: Panduan Lengkap Cara Install October CMS menggunakan LAMP Stack di AlmaLinux 8
description: Panduan Lengkap Cara Install October CMS menggunakan LAMP Stack di AlmaLinux 8
sidebar_label: October CMS
---

**October CMS** adalah salah satu **Content Management System** berbasis PHP yang ringan, fleksibel, dan mudah diintegrasikan dengan berbagai modul untuk pengembangan website modern. Pada panduan ini, kita akan membahas secara detail **cara instalasi October CMS menggunakan LAMP Stack di AlmaLinux 8** mulai dari tahap persiapan server hingga konfigurasi akhir agar siap digunakan secara optimal.

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

## Install October CMS

Sebelum menginstall October CMS, kita akan membuat virtualhost dan database (untuk menyimpan konten, konfigurasi, dan struktur October CMS) terlebih dahulu. Jalankan perintah berikut untuk membuat virtualhost:
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
    DocumentRoot /var/www/focusnic.biz.id/octoberapp

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

Buat database dengan menjalankan perintah berikut:
```
mariadb
```

Lalu jalankan perintah berikut untuk membuat database, user, dan password:
```
create database october_db;
create user 'october_user'@'localhost' identified by 'teYWgZVkMW6U67z4';
grant all on october_db.* to 'october_user'@'localhost';
flush privileges;
quit;
```

Download composer dan install dengan perintah berikut:

:::info
Composer akan diperlukan untuk manajemen October CMS seperti menginstall dependensi dan kebutuhan lainnya pada saat development atau production.
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

Download file October dan letakkan pada direktori sesuai virtualhost, kita akan mendownload October CMS dan membuat project dengan nama `octoberapp` menggunakan composer:
```
cd /var/www/focusnic.biz.id
composer create-project october/october octoberapp
```
Install October CMS:
```
cd /var/www/focusnic.biz.id/octoberapp
php artisan october:install
```

Berikut contoh output instruksi dari instalasi October CMS:

:::info
Pastikan sudah memiliki lisensi October CMS yang dapat diperoleh secara gratis melalui website resmi October CMS https://octobercms.com/
:::

```
.=================================================.
   ____   _____ _______  ____  ____  ___________   
  / __ \ / ____|__   __|/ __ \|  _ \|  ____|  __ \ 
 | |  | | |       | |  | |  | | |_) | |__  | |__) |
 | |  | | |       | |  | |  | |  _ <|  __| |  _  / 
 | |__| | |____   | |  | |__| | |_) | |____| | \ \ 
  \____/ \_____|  |_|   \____/|____/|______|_|  \_\
                                                    
`================== INSTALLATION =================' 

Application key [g3s2uRdQoiQkWk4zZKl8onzz2C2n2yDd] set successfully.
 ------- ------------------------------------ ------- ----------------------------------- 
  Code    Language                             Code    Language                           
 ------- ------------------------------------ ------- ----------------------------------- 
  ar      (Arabic) العربية                     it      (Italian) Italiano                 
  be      (Belarusian) Беларуская              ja      (Japanese) 日本語                  
  bg      (Bulgarian) Български                ko      (Korean) 한국어                    
  ca      (Catalan) Català                     lt      (Lithuanian) Lietuvių              
  cs      (Czech) Čeština                      lv      (Latvian) Latviešu                 
  da      (Danish) Dansk                       nb-no   (Norwegian) Norsk (Bokmål)         
  de      (German) Deutsch                     nl      (Dutch) Nederlands                 
  el      (Greek) Ελληνικά                     pl      (Polish) Polski                    
  en      (English) English (United States)    pt-br   (Portuguese) Português (Brasil)    
  en-au   (English) English (Australia)        pt-pt   (Portuguese) Português (Portugal)  
  en-ca   (English) English (Canada)           ro      (Romanian) Română                  
  en-gb   (English) English (United Kingdom)   ru      (Russian) Русский                  
  es      (Spanish) Español                    sk      (Slovak) Slovenský                 
  es-ar   (Spanish) Español (Argentina)        sl      (Slovene) Slovenščina              
  et      (Estonian) Eesti                     sv      (Swedish) Svenska                  
  fa      (Persian) فارسی                      th      (Thai) ไทย                         
  fi      (Finnish) Suomi                      tr      (Turkish) Türkçe                   
  fr      (French) Français                    uk      (Ukrainian) Українська мова        
  fr-ca   (French) Français (Canada)           vn      (Vietnamese) Tiếng việt            
  hu      (Hungarian) Magyar                   zh-cn   (Chinese) 简体中文                 
  id      (Indonesian) Bahasa Indonesia        zh-tw   (Chinese) 繁體中文                 
 ------- ------------------------------------ ------- ----------------------------------- 

 Select Language [en]:
 > en 

Application Configuration
-------------------------

 Application URL [http://localhost]:
 > http://focusnic.biz.id

To secure your application, use a custom address for accessing the admin panel.

 Backend URI [/admin]:
 > [ENTER]

 Database Engine [MySQL]:
  [0] SQLite
  [1] MySQL
  [2] Postgres
  [3] SQL Server
 > 1

Hostname for the database connection.

 Database Host [127.0.0.1]:
 > [ENTER]

(Optional) A port for the connection.

 Database Port [3306]:
 > [ENTER]

Specify the name of the database to use.

 Database Name [database]:
 > october_db

User with create database privileges.

 Database Login [root]:
 > october_user

Password for the specified user.

 Database Password []:
 > teYWgZVkMW6U67z4

Demo Content
------------

 Install the demonstration theme and content? (Recommended) (yes/no) [yes]:
 > yes

License Key
-----------

Enter a valid License Key to proceed.

 License Key:
 > X0M6F-4XXX-XXXX-XXXX

                                                                                                                        
 [OK] Thanks for being a customer of October CMS!
```
Jalankan perintah berikut untuk migrate db October CMS:
```
cd /var/www/focusnic.biz.id/octoberapp
php artisan october:migrate
```
Sesuaikan permission:
```
find /var/www/focusnic.biz.id/octoberapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/octoberapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

Setup admin/backend October CMS melalui `http://$DOMAIN/admin`
![](/img/almalinux8-lamp-apps-octobercms1.jpg)<br/>
Berikut adalah tampilan admin dashboard October CMS
![](/img/almalinux8-lamp-apps-octobercms2.jpg)<br/>
Tampilan demo frontend dari October CMS
![](/img/almalinux8-lamp-apps-octobercms3.jpg)<br/>


## Troubleshooting

1. AH00124: Request exceeded the limit of 10 internal redirects <br/>

Jika setelah menginstal October CMS muncul error seperti berikut di `error_log` Apache:
```
AH00124: Request exceeded the limit of 10 internal redirects due to probable configuration error
```
atau
```
AH01276: Cannot serve directory /var/www/domain/octoberapp/app/: No matching DirectoryIndex found
```

Maka penyebab utamanya biasanya adalah `DocumentRoot` salah diarahkan.

**Penyebab:**

- VirtualHost diarahkan ke folder `/app` atau `/public` seperti konfigurasi Laravel.
- October CMS menaruh `index.php` langsung di root folder instalasi, bukan di `/public` atau `/app`.
- Apache tidak menemukan `index.php` di lokasi yang diarahkan sehingga mencoba redirect berulang kali.

**Solusi:**

Pastikan `DocumentRoot` mengarah langsung ke folder utama instalasi October CMS:
```
DocumentRoot /var/www/domain/octoberapp

<Directory /var/www/domain/octoberapp>
    AllowOverride All
    Require all granted
</Directory>
```

2. Error “Composer Not Found” <br/>

Jika saat instalasi muncul error:
```
bash: composer: command not found
```

**Solusi:**

```
dnf install composer -y
```
Pastikan juga Composer terpasang dengan benar:
```
composer -V
```

3. Error Permission Denied <br/>

Jika October CMS tidak dapat membuat file atau direktori, biasanya masalah ada pada permission. Solusi:
```
find /var/www/focusnic.biz.id/octoberapp -type f -exec chmod 644 {} \;
find /var/www/focusnic.biz.id/octoberapp -type d -exec chmod 755 {} \;
chown -R apache:apache /var/www/focusnic.biz.id
```

4. Database Connection Error <br/>

Jika muncul error tidak bisa konek ke database:

- Pastikan username, password, dan nama database benar.
- Coba koneksi manual:

```
mysql -u octoberuser -p
```

## Kesimpulan

Menginstal **October CMS di AlmaLinux 8 menggunakan LAMP Stack** adalah langkah tepat untuk membangun website yang cepat, aman, dan fleksibel. Dengan konfigurasi yang tepat, kita bisa mendapatkan performa optimal. Pastikan setiap langkah mulai dari instalasi Apache, MariaDB, PHP, hingga konfigurasi Virtual Host dilakukan dengan teliti.

Untuk pengaturan yang lebih optimal dan keamanan maksimal, **gunakan jasa install server atau cloud VPS dari Focusnic** yang siap membantu dari tahap instalasi, konfigurasi, hingga optimasi.

Q: Apa itu October CMS? <br/>
A: October CMS adalah CMS berbasis PHP dengan framework Laravel yang fleksibel dan cocok untuk berbagai jenis website.

Q: Apakah October CMS bisa dijalankan di AlmaLinux 8? <br/>
A: Ya, October CMS sangat kompatibel dengan AlmaLinux 8, terutama jika menggunakan LAMP Stack dengan PHP 8.0 atau lebih baru.

Q: Apakah harus menggunakan Composer untuk instalasi October CMS? <br/>
A: Ya, Composer sangat disarankan karena mempermudah instalasi dan update dependensi.

Q: Apakah October CMS memiliki folder `/public` seperti Laravel? <br/>
A: Tidak. Semua file inti dan `index.php` berada di root instalasi. Tidak perlu mengarahkan `DocumentRoot` ke `/public`.

Q: Bagaimana jika saya tetap ingin memisahkan folder publik dan private seperti Laravel? <br/>
A: Anda bisa melakukan konfigurasi manual dengan memindahkan `index.php` ke folder `public_html` dan mengatur ulang path, namun ini memerlukan modifikasi tambahan dan tidak direkomendasikan untuk instalasi standar.

Q: Apakah `.htaccess` wajib ada? <br/>
A: Ya. File `.htaccess` di root October CMS diperlukan agar routing dan URL bekerja dengan benar.

Q: Apakah saya bisa menggunakan Nginx untuk October CMS? <br/>
A: Bisa. Namun konfigurasi Nginx berbeda, dan perlu disesuaikan terutama untuk aturan rewrite yang ada di `.htaccess`.

Referensi Lanjutan:
- SSL dan Keamanan: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/security
- Virtualhost: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/virtual-host
- WAF ModSecurity: https://docs.focusnic.com/tutorial/almalinux/8/web-server/apache/modsecurity
