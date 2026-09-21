---
title: AWStats
description: Cara Install dan Konfigurasi AWStats di Apache Web Server AlmaLinux 8
sidebar_position: 3
sidebar_label: AWStats 
---

**AWStats** adalah salah satu solusi **web analytics** yang paling sering digunakan oleh administrator sistem dan pengelola situs web. Dengan mengintegrasikan AWStats ke dalam **Apache Web Server** di sistem **AlmaLinux 8**, kita dapat menyajikan laporan statistik lalu lintas website secara real-time dan detail. AWStats mendukung berbagai log format dan mampu menampilkan informasi penting seperti jumlah kunjungan, asal pengunjung, browser, sistem operasi, hingga data bandwidth.

Dalam panduan ini, kita akan membahas **cara install AWStats pada Apache Web Server di AlmaLinux 8** secara menyeluruh, mulai dari instalasi hingga konfigurasi dan optimasi keamanan. Panduan ini sangat cocok bagi administrator yang ingin mengelola traffic situs web dengan akurat menggunakan solusi open source.

## Prerequisite

- Akses full `root`
- Basic Linux Command Line
- Security
- Apache/HTTPD sudah terinstall
- Domain (opsional)
- Timezone sudah di konfigurasi

## Install AWStats
Pertama, kita perlu perbarui sistem terlebih dahulu dan juga install `epel` karena paket `awstats` tidak tersedia pada `AppStream` alias default repository:
```
dnf update -y
dnf install epel-release -y
```

Lalu, Install AWStats dengan perintah berikut:
```
dnf install awstats -y
```

## Konfigurasi Virtualhost untuk AWStats
Pastikan Apache sudah terinstall, namun apabila belum terinstall silahkan jalankan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```

Kemudian izinkan port 80 dan 443 pada firewalld apabila menggunakannya:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Setelah proses instalasi selesai, kita harus mengonfigurasi Apache kita dapat menambahkan blok konfigurasi berikut ke dalam file virtual host yang ada atau membuat yang 
baru: 
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf 
``` 
Kemudian isi parameter berikut: 
```jsx {7,9-18,20-26} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf" 
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    Alias /web-stats "/usr/share/awstats/wwwroot/cgi-bin/"

    <Directory "/usr/share/awstats/wwwroot/cgi-bin/">
        DirectoryIndex index.pl
        Options ExecCGI
        AddHandler cgi-script .pl
        AuthType Basic
        AuthName "AWStats Protected"
        AuthUserFile "/etc/httpd/.htpasswd-focusnic"
        Require valid-user
        AllowOverride None
    </Directory>

    Alias /awstatsclasses "/usr/share/awstats/wwwroot/classes/"
    Alias /awstatscss "/usr/share/awstats/wwwroot/css/"
    Alias /awstatsicons "/usr/share/awstats/wwwroot/icon/"
    <Directory "/usr/share/awstats/wwwroot/">
        AllowOverride None
        Require all granted
    </Directory>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Buat direktori virtualhost:
```
mkdir -p /var/www/focusnic.biz.id/public_html
```
Buat basic auth username `admin` untuk mengakses AWStats:
```
htpasswd -c /etc/httpd/.htpasswd-focusnic admin
```
Lalu restart Apache setelah melakukan perubahan:
```
apachectl configtest
systemctl restart httpd
```

## Konfigurasi AWStats

Langkah selanjutnya adalah membuat konfigurasi AWStats. Secara default, AWStats menyediakan file template bernama `awstats.model.conf`. Kita harus menyalin dan menyesuaikannya untuk domain kita:
```
cp /etc/awstats/awstats.model.conf /etc/awstats/awstats.focusnic.biz.id.conf
```
Kemudian edit file berikut:
```
nano /etc/awstats/awstats.focusnic.biz.id.conf
```
Sesuaikan beberapa parameter yang diperlukan:
```jsx showLineNumbers title="/etc/awstats/awstats.focusnic.biz.id.conf"
LogFile="/var/log/httpd/focusnic.biz.id-access.log"
DirData="/var/lib/awstats/focusnic.biz.id"
SiteDomain="focusnic.biz.id"
```
Lalu buat direktori AWStats untuk menyimpan statistik diatas:
```
mkdir /var/lib/awstats/focusnic.biz.id/
```

Setelah itu silahkan jalankan perintah berikut untuk generate data:
```
/usr/share/awstats/wwwroot/cgi-bin/awstats.pl -config=focusnic.biz.id -update
```
Contoh output:
```
Create/Update database for config "/etc/awstats/awstats.focusnic.biz.id.conf" by AWStats version 7.9 (build 20230108)
From data in log file "/var/log/httpd/focusnic.biz.id-access.log"...
Phase 1 : First bypass old records, searching new record...
Direct access after last parsed record (after line 2998)
Jumped lines in file: 2998
 Found 2998 already parsed records.
Parsed lines in file: 6
 Found 2 dropped records,
 Found 0 comments,
 Found 0 blank records,
 Found 0 corrupted records,
 Found 0 old records,
 Found 4 new qualified records.
```
Jika memiliki domain lebih dari satu yang menggunakan AWStats maka jalankan perintah berikut
```
/usr/share/awstats/tools/awstats_updateall.pl now -configdir="/etc/awstats"
```
Kemudian akses browser dengan mengetik nama domain dan query berikut `http://focusnic.biz.id/web-stats/awstats.pl?config=focusnic.biz.id` dan masukkan username dan password yang telah dibuat sebelumnya.
![](/img/almalinux8-apache-awstats.jpg)<br/>

Buat cron untuk otomatisasi generate data AWStats setiap hari pada jam 00:00
```
crontab -e
```
Isi parameter berikut:
```
0 0 * * * /usr/share/awstats/tools/awstats_updateall.pl now -configdir="/etc/awstats"
```
# Troubleshooting
1. 404 Not Found atau tidak ada respon saat membuka http://domain.com/web-stats/ <br/>

Pastikan Alias telah dikonfigurasi di dalam blok `<VirtualHost>` dan module CGI sudah di aktifkan

2. Basic Authentication tidak muncul <br/>

Jangan gunakan parameter `Require all granted` bersamaan dengan `Require valid-user` pada blok `<VirtualHost>`

3. Statistik tidak ter-update <br/>

Jalankan manual update: 
```
/usr/share/awstats/wwwroot/cgi-bin/awstats.pl -config=yourdomain -update
```

Periksa LogFile di file `.conf` AWStats Anda apakah menunjuk ke lokasi log yang benar

## Kesimpulan
Mengonfigurasi **AWStats per VirtualHost** memberikan keuntungan besar dalam mengelola dan menganalisis **lalu lintas tiap domain**. Hal ini sangat penting terutama jika Anda mengelola banyak website dalam satu server. Dengan pengaturan log yang rapi, file konfigurasi yang terpisah, dan update otomatis, AWStats dapat berfungsi secara maksimal tanpa konflik antar domain.

Q: Apakah AWStats bisa berjalan tanpa akses root? <br/>
A: Bisa, asalkan user Apache punya izin baca file log dan AWStats sudah terinstall dengan benar.

Q: Di mana lokasi file statistik AWStats disimpan? <br/>
A: Default-nya di: `/var/lib/awstats/`

Q: Apakah AWStats menghapus data lama secara otomatis? <br/>
A: Tidak. Anda harus menghapus file .txt lama secara manual atau melalui cronjob.

Q: Apakah bisa digunakan di banyak VirtualHost? <br/>
A: Ya, sangat cocok untuk multi-domain, asal setiap domain punya:
- File `.conf` tersendiri
- Alias dan proteksi direktori masing-masing
