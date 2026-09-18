---
title: Tuning
description: Cara Optimasi dan Tuning Apache mod_mpm di AlmaLinux 8
sidebar_position: 17
sidebar_label: Tuning
---

Apache HTTP Server atau **Apache** adalah salah satu web server paling populer yang digunakan di lingkungan server berbasis **Linux**, termasuk **AlmaLinux 8**. Sistem operasi berbasis **Red Hat Enterprise Linux (RHEL)** ini sangat cocok untuk kebutuhan server web karena kestabilannya, keamanan tinggi, serta dukungan komunitas yang luas. Namun, agar performa Apache dapat berjalan dengan **efisien dan optimal**, diperlukan **tuning dan konfigurasi** yang tepat sesuai dengan kebutuhan beban kerja, memori, dan jumlah pengguna yang dihadapi.

Panduan ini akan membahas secara **mendalam dan menyeluruh** bagaimana melakukan tuning serta konfigurasi Apache secara optimal di AlmaLinux 8, termasuk pengaturan modul, worker, koneksi, caching, hingga keamanan.

## Prerequisite

- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line

## Persiapan

Sebelum melakukan tuning Apache, pastikan sistem Anda sudah menjalankan AlmaLinux 8 dan Apache telah terpasang. Untuk menginstal Apache, gunakan perintah:
```
dnf update -y
dnf install httpd httpd-tools -y
systemctl enable httpd --now
```

Lalu buka port 80 dan 443, jika menggunakan firewalld jalankan perintah berikut:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

## MPM (Multi-Processing Module)

:::info
Jika Anda menggunakan PHP modern, hindari `mod_php` dan gunakan PHP-FPM agar dapat memanfaatkan MPM worker atau event.
:::

**MPM (Multi-Processing Module)** adalah *komponen utama Apache* yang mengatur **bagaimana Apache menangani permintaan (request) dari klien**, terutama dalam hal:

- **Proses dan thread** yang digunakan
- **Cara distribusi beban** ke CPU dan RAM
- **Kapasitas concurrent connections**

Setiap server Apache **hanya bisa menjalankan satu MPM dalam satu waktu**, dan pilihan MPM sangat mempengaruhi performa, konsumsi sumber daya, dan kompatibilitas modul lain seperti PHP. Apache menyediakan **tiga MPM utama** yang umum digunakan:

1. **MPM Prefork** – proses murni tanpa thread, stabil tapi boros sumber daya.
2. **MPM Worker** – proses dengan thread, lebih efisien dan cocok untuk aplikasi modern.
3. **MPM Event** – pengembangan dari Worker, lebih efisien untuk koneksi keep-alive dan HTTP/2.

| **Fitur / Karakteristik** | **MPM Prefork** | **MPM Worker** | **MPM Event** |
| --- | --- | --- | --- |
| **Model Eksekusi** | Proses tunggal per koneksi | Proses dengan multi-thread | Proses dengan multi-thread & event loop |
| **Threading** | ❌ Tidak | ✅ Ya | ✅ Ya |
| **Kinerja** | Lambat & boros memori | Lebih cepat & efisien | Paling efisien untuk koneksi keep-alive |
| **Penggunaan Memori** | Tinggi | Sedang | Paling rendah |
| **Kompatibilitas mod_php** | ✅ Kompatibel | ❌ Tidak | ❌ Tidak |
| **HTTP/2 Support** | ❌ Tidak optimal | ❌ Tidak optimal | ✅ Ya |
| **Ideal Untuk** | Aplikasi lama, mod_php, stabil | PHP-FPM, aplikasi modern | PHP-FPM, trafik tinggi, HTTP/2 |
| **Respons terhadap KeepAlive** | Blocking | Blocking | Non-blocking |
| **Produksi Direkomendasikan?** | ⚠️ Legacy/terbatas | ✅ Untuk modern server | ✅✅ Paling direkomendasikan |

Berikut apabila Anda ingin menyesuikan dengan kebutuhan aplikasi saat ini:

| **Kebutuhan** | **Pilih MPM** |
| --- | --- |
| Menjalankan `mod_php` legacy | **Prefork** |
| Menggunakan `PHP-FPM`, aplikasi modern | **Worker** |
| Website dengan banyak koneksi keep-alive / HTTP/2 | **Event** |
| Minimalkan penggunaan RAM | **Event** |
| Website statis atau API ringan | **Worker / Event** |

### Event
:::info
Optimasi jumlah Worker dan Thread  bersifat **server-wide**, bukan per VirtualHost.
:::

Untuk menggunakan module `mpm_event_module` silahkan edit file berikut:
```
nano /etc/httpd/conf.modules.d/00-mpm.conf
```
Kemudian tambahkan parameter `mpm_event_module` dan berikan komentar atau hapus baris `mpm_` lainnya:

:::info
Optimasi pada server dengan asumsi spesifikasi **4GB RAM** dan **2 CPU**.
:::

```jsx {1,5-13} showLineNumbers title="/etc/httpd/conf.modules.d/00-mpm.conf"
LoadModule mpm_event_module modules/mod_mpm_event.so
#LoadModule mpm_worker_module modules/mod_mpm_worker.so
#LoadModule mpm_prefork_module modules/mod_mpm_prefork.so

<IfModule mpm_event_module>
    StartServers             2
    MinSpareThreads         25
    MaxSpareThreads         75
    ThreadsPerChild         25
    MaxRequestWorkers      150
    MaxConnectionsPerChild 3000
</IfModule>
```

Berikut penjelasan parameter diatas:

| **Direktif** | **Fungsi** | **Nilai Disarankan** | **Alasan Pemilihan Nilai** | **Rumus / Estimasi** |
| --- | --- | --- | --- | --- |
| `StartServers` | Jumlah proses child Apache yang dijalankan saat startup | `2` | Cukup untuk server kecil (2 vCPU), memulai dengan 50 thread (`2 × 25`) siap melayani koneksi | `StartServers × ThreadsPerChild = 2 × 25 = 50 thread` |
| `MinSpareThreads` | Jumlah minimum thread idle (siaga) sebelum Apache membuat thread baru | `25` | Menjaga performa agar Apache tidak kekurangan thread saat permintaan naik tiba-tiba | — |
| `MaxSpareThreads` | Jumlah maksimum thread idle sebelum Apache menghentikan thread berlebih | `75` | Mencegah overcommit memori saat load menurun, tetap menjaga ketersediaan thread | — |
| `ThreadsPerChild` | Jumlah thread per proses child Apache | `25` | Angka ideal agar distribusi load tetap stabil, dan mudah dikontrol | `MaxRequestWorkers ÷ ThreadsPerChild = jumlah child` |
| `MaxRequestWorkers` | Jumlah maksimal koneksi aktif yang dilayani oleh Apache secara simultan | `150` | Disesuaikan dengan RAM (4GB) dan target load ringan-sedang tanpa membuat server kehabisan memori | `25 × 6 = 150 (6 child process)` |
| `MaxConnectionsPerChild` | Jumlah koneksi yang ditangani per proses sebelum proses direstart ulang | `3000` | Mencegah memory leak jangka panjang tanpa membuat proses terlalu sering restart | — |

Selain itu, parameter `MaxRequestWorkers` dapat di optimasi dan disesuaikan sesuai dengan kondisi beban Apache sekarang. Ikuti langkah berikut:

1. Cek proses Apache dengan perintah berikut untuk melihat proses pada Apache yang menggunakan RAM (dalam MB): <br/>
```
ps -ylC httpd --sort:rss | awk 'NR!=1 {print $8 / 1024}'
```
2. Estimasikan dengan nilai yang paling banyak muncul. <br/>
3. Jalankan perintah berikut untuk melihat RAM yang tersedia (dalam MB): <br/>
```
free -m | awk 'NR==2 {print $7}'
```
4. Kemudian aplikasikan rumusnya, yaitu (Available Memory/Apache Process). Misalkan per proses adalah 15 MB dan total RAM adalah 4GB, maka dapat diperoleh nilai `MaxRequestWorkers 230` yang dapat digunakan. Pastikan untuk selalu menyisakan RAM untuk sistem.

Simpan perubahan Apache dengan merestartnya:
```
apachectl configtest
systemctl restart httpd
```

Verifikasi:
```
httpd -V | grep -i mpm
httpd -M | grep mpm
```

Contoh output:
```
Server MPM:     event
mpm_event_module (shared)
```
### Worker
:::info
Optimasi jumlah Worker dan Thread  bersifat **server-wide**, bukan per VirtualHost.
:::

Untuk menggunakan module `mpm_worker_module` silahkan edit file berikut:
```
nano /etc/httpd/conf.modules.d/00-mpm.conf
```
Kemudian tambahkan parameter `mpm_worker_module` dan berikan komentar atau hapus baris `mpm_` lainnya:

:::info
Optimasi pada server dengan asumsi spesifikasi **4GB RAM** dan **2 CPU**.
:::

```jsx {2,5-13} showLineNumbers title="/etc/httpd/conf.modules.d/00-mpm.conf"
#LoadModule mpm_event_module modules/mod_mpm_event.so
LoadModule mpm_worker_module modules/mod_mpm_worker.so
#LoadModule mpm_prefork_module modules/mod_mpm_prefork.so

<IfModule mpm_worker_module>
    StartServers             2
    MinSpareThreads         25
    MaxSpareThreads         75
    ThreadLimit             64
    ThreadsPerChild         25
    MaxRequestWorkers      150
    MaxConnectionsPerChild 3000
</IfModule>
```

Berikut penjelasan parameter diatas:

| **Direktif** | **Fungsi** | **Nilai** | **Alasan Pemilihan Nilai** | **Rumus / Estimasi** |
| --- | --- | --- | --- | --- |
| `StartServers` | Jumlah proses child yang dijalankan saat Apache start | `2` | Menyediakan 2 × 25 = 50 thread siap melayani sejak awal. Cocok untuk 2 vCPU, ringan & responsif | `StartServers × ThreadsPerChild = 2 × 25 = 50 thread` |
| `MinSpareThreads` | Minimum thread idle (menganggur) yang tersedia sebelum Apache membuat baru | `25` | Menjaga performa agar thread tidak kehabisan saat ada request mendadak | — |
| `MaxSpareThreads` | Maksimum thread idle sebelum Apache membunuh kelebihan thread | `75` | Mencegah konsumsi RAM berlebih dari thread tak terpakai | — |
| `ThreadLimit` | Batas maksimal nilai `ThreadsPerChild` yang dapat disetel | `64` | Disesuaikan agar fleksibel scaling; wajib ≥ `ThreadsPerChild` | `ThreadLimit ≥ ThreadsPerChild` |
| `ThreadsPerChild` | Jumlah thread yang dibuat per proses child | `25` | Cukup kecil agar per child tidak boros memori & mudah diatur, ideal untuk 2 vCPU | `MaxRequestWorkers ÷ ThreadsPerChild = 6 proses` |
| `MaxRequestWorkers` | Jumlah maksimum koneksi simultan yang bisa ditangani Apache | `150` | Batas beban koneksi aktif. Disesuaikan agar tetap ringan di 4GB RAM (estimasi 150 × 20 MB = ±3GB RAM) | `ThreadsPerChild × Child = MaxRequestWorkers → 25 × 6 = 150` |
| `MaxConnectionsPerChild` | Jumlah koneksi maksimum yang dapat diproses sebelum child di-restart | `3000` | Mencegah memory leak. 3000 = kompromi antara kinerja & stabilitas proses jangka panjang | Estimasi: `3000 request × 0.2 detik/request = ±10 menit uptime proses` |

Selain itu, parameter `MaxRequestWorkers` dapat di optimasi dan disesuaikan sesuai dengan kondisi beban Apache sekarang. Ikuti langkah berikut:

1. Cek proses Apache dengan perintah berikut untuk melihat proses pada Apache yang menggunakan RAM (dalam MB): <br/>
```
ps -ylC httpd --sort:rss | awk 'NR!=1 {print $8 / 1024}'
```
2. Estimasikan dengan nilai yang paling banyak muncul. <br/>
3. Jalankan perintah berikut untuk melihat RAM yang tersedia (dalam MB): <br/>
```
free -m | awk 'NR==2 {print $7}'
```
4. Kemudian aplikasikan rumusnya, yaitu (Available Memory/Apache Process). Misalkan per proses adalah 15 MB dan total RAM adalah 4GB, maka dapat diperoleh nilai `MaxRequestWorkers 230` yang dapat digunakan. Pastikan untuk selalu menyisakan RAM untuk sistem.

Simpan perubahan Apache dengan merestartnya:
```
apachectl configtest
systemctl restart httpd
```

Verifikasi:
```
httpd -V | grep -i mpm
httpd -M | grep mpm
```

Contoh output:
```
Server MPM:     worker
mpm_worker_module (shared)
``` 

### Prefork
:::info
Optimasi jumlah Worker dan Thread  bersifat **server-wide**, bukan per VirtualHost.
:::

Untuk menggunakan module `mpm_worker_module` silahkan edit file berikut:
```
nano /etc/httpd/conf.modules.d/00-mpm.conf
```
Kemudian tambahkan parameter `mpm_prefork_module` dan berikan komentar atau hapus baris `mpm_` lainnya:

:::info
Optimasi pada server dengan asumsi spesifikasi **4GB RAM** dan **2 CPU**.
:::

```jsx {3,5-12} showLineNumbers title="/etc/httpd/conf.modules.d/00-mpm.conf"
#LoadModule mpm_event_module modules/mod_mpm_event.so
#LoadModule mpm_worker_module modules/mod_mpm_worker.so
LoadModule mpm_prefork_module modules/mod_mpm_prefork.so

<IfModule mpm_prefork_module>
    StartServers          3
    MinSpareServers       3
    MaxSpareServers       5
    MaxRequestWorkers    50
    MaxConnectionsPerChild 300
</IfModule>
```

Berikut penjelasan parameter diatas:

| **Direktif** | **Fungsi** | **Nilai** | **Alasan Pemilihan Nilai** | **Rumus / Estimasi** |
| --- | --- | --- | --- | --- |
| `StartServers` | Jumlah proses Apache yang langsung dijalankan saat start | `3` | Menyediakan 3 proses siap melayani koneksi. Cukup untuk beban awal server ringan hingga sedang | — |
| `MinSpareServers` | Minimum proses idle. Jika lebih sedikit, Apache akan membuat proses baru | `3` | Menjaga agar Apache tidak kekurangan proses idle saat lonjakan trafik ringan | — |
| `MaxSpareServers` | Jumlah maksimal proses idle. Jika lebih banyak, Apache akan mematikan kelebihannya | `5` | Menghemat memori ketika server dalam kondisi idle dengan load rendah | — |
| `MaxRequestWorkers` | Jumlah maksimal koneksi simultan yang bisa dilayani | `50` | Cocok untuk server 4GB RAM dan mod_php. Setiap proses bisa mengonsumsi 30–50MB RAM | `50 × 40MB ≈ 2 GB RAM` |
| `MaxConnectionsPerChild` | Jumlah koneksi maksimum yang bisa ditangani proses sebelum proses di-restart | `300` | Menghindari memory leak. Proses akan di-rotasi setelah melayani 300 request | Estimasi: `300 × 0.2 detik/request = ±1 menit uptime per proses` |

Selain itu, parameter `MaxRequestWorkers` dapat di optimasi dan disesuaikan sesuai dengan kondisi beban Apache sekarang. Ikuti langkah berikut:

1. Cek proses Apache dengan perintah berikut untuk melihat proses pada Apache yang menggunakan RAM (dalam MB): <br/>
```
ps -ylC httpd --sort:rss | awk 'NR!=1 {print $8 / 1024}'
```
2. Estimasikan dengan nilai yang paling banyak muncul. <br/>
3. Jalankan perintah berikut untuk melihat RAM yang tersedia (dalam MB): <br/>
```
free -m | awk 'NR==2 {print $7}'
```
4. Kemudian aplikasikan rumusnya, yaitu (Available Memory/Apache Process). Misalkan per proses adalah 15 MB dan total RAM adalah 4GB, maka dapat diperoleh nilai `MaxRequestWorkers 230` yang dapat digunakan. Pastikan untuk selalu menyisakan RAM untuk sistem.

Simpan perubahan Apache dengan merestartnya:
```
apachectl configtest
systemctl restart httpd
```

Verifikasi:
```
httpd -V | grep -i mpm
httpd -M | grep mpm
```

Contoh output:
```
Server MPM:     prefork
mpm_prefork_module (shared)
``` 

## KeepAlive

:::info
Konfigurasi ini berlaku untuk seluruh server Apache atau virtualhost (server-wide), tidak dapat dikustomisasi per VirtualHost, dan akan memengaruhi semua koneksi HTTP yang masuk ke server tersebut.
:::

KeepAlive memungkinkan koneksi tetap terbuka dan mempercepat loading untuk permintaan berikutnya. Waktu timeout sebaiknya disesuaikan agar tidak membebani server. Silahkan edit file berikut:

```
nano /etc/httpd/conf/httpd.conf
```

Ubah bagian berikut atau tempatkan di awal bagian global, sebelum konfigurasi `<VirtualHost>`:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 2
```

Penjelasan:
- `KeepAlive On` → Klien (browser) dapat mengirim beberapa permintaan HTTP melalui satu koneksi TCP. Mengurangi overhead TCP handshake, mempercepat loading halaman yang memuat banyak file (gambar, CSS, JS).
- `MaxKeepAliveRequests 100` → Menentukan jumlah maksimum permintaan HTTP yang dapat dikirim melalui satu koneksi `KeepAlive` sebelum koneksi ditutup.
- `KeepAliveTimeout 2` → Menentukan berapa detik server akan menunggu permintaan berikutnya sebelum menutup koneksi `KeepAlive` yang idle, jika tidak ada permintaan lanjutan dalam 2 detik, Apache akan menutup koneksi. Di server produksi, semakin lama timeout, semakin banyak worker atau thread yang idle hanya untuk menunggu permintaan yang mungkin tidak datang.

| **Direktif** | **Fungsi** | **Nilai** | **Alasan Pemilihan** |
| --- | --- | --- | --- |
| `KeepAlive` | Mengaktifkan koneksi HTTP berkelanjutan (persistent connection) | `On` | Meningkatkan efisiensi koneksi HTTP, mempercepat load page modern |
| `MaxKeepAliveRequests` | Batas jumlah request per koneksi TCP sebelum ditutup | `100` | Cukup untuk halaman kompleks, mencegah koneksi terlalu lama |
| `KeepAliveTimeout` | Waktu tunggu (dalam detik) jika koneksi idle menunggu request berikutnya | `2` | Menghindari pemborosan thread, mempercepat pelepasan slot worker |


Lalu restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Untuk melakukan verifikasi konfigurasi dapat menggunakan website berikut https://www.whatsmyip.org/http-headers/

![](/img/almalinux8-apache-keepalive.png)<br/>

## Caching
Caching adalah kunci utama dalam meningkatkan kecepatan website. Pada Apache terdapat empat module yang sering digunakan yaitu `mod_cache`, `mod_cache_disk`, `mod_expires`, dan `mod_deflate`.

| **Modul** | **Fungsi Utama** | **Direkomendasikan di Produksi?** | **Keterangan** |
| --- | --- | --- | --- |
| `mod_cache` | Kerangka utama caching, bertindak sebagai **controller untuk backend cache** | ✅ Ya | Digunakan bersama dengan `mod_cache_disk` atau `mod_cache_socache` |
| `mod_cache_disk` | Menyimpan cache **ke file/disk** | ✅ Ya | Cocok untuk caching file statis, HTML, gambar, dll. Ideal untuk situs dengan banyak konten statis |
| `mod_cache_socache` | Menyimpan cache di **Shared Object Cache (memori, seperti `shmcb`)** | ⚠️ Tergantung | Lebih cepat dari `disk`, tapi terbatas ukuran dan butuh tuning `mod_socache_*` lainnya |
| `mod_file_cache` | Preload file statis ke dalam memori saat Apache start (misalnya favicon, logo) | ⚠️ Opsional | Berguna jika file kecil diakses sangat sering. Harus digunakan hati-hati karena konsumsi RAM |
| `mod_mem_cache` | Legacy, **digantikan oleh `mod_cache_socache`** | ❌ Tidak | Tidak direkomendasikan untuk Apache modern (2.4.x ke atas) |
| `mod_expires` | Mengatur **HTTP caching header (Expires dan Cache-Control)** | ✅ Sangat dianjurkan | Bekerja di level header, bukan penyimpanan. Sangat efektif untuk kontrol cache browser |
| `mod_headers` | Digunakan untuk **memodifikasi atau menambahkan HTTP headers**, termasuk caching headers | ✅ Sangat dianjurkan | Dapat digunakan bersama `mod_expires` untuk header yang kompleks |
| `mod_deflate` | Kompresi **output HTTP (HTML, CSS, JS, JSON, XML)** dengan Gzip | ✅ Ya | Mengurangi ukuran respons, meningkatkan kecepatan load halaman |


### Server Cache

:::info
Konfigurasi berikut akan dilakukan per virtualhost bukan server-wide.
:::

Untuk server cache akan mengimplementasikan model disk based storage dan menggunakan module `cache_disk_module` dan `cache_module`. Pastikan module sudah di aktifkan:
```
httpd -M | grep cache
```

Contoh output:
```
cache_module (shared)
cache_disk_module (shared)
```

Jika belum diaktifkan silahkan load module pada file berikut
```
nano /etc/httpd/conf.modules.d/00-base.conf
```

Tambahkan parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.modules.d/00-base.conf"
LoadModule cache_module modules/mod_cache.so
LoadModule cache_disk_module modules/mod_cache_disk.so
```

Lalu restart Apache untuk menyimpan perubahan dan cek kembali hasilnya:
```
apachectl configtest
systemctl restart httpd
```

Kemudian buat `CacheRoot` pada **server-wide** yang fungsinya untuk menyimpan lokasi cache agar tidak mendefinisikan ulang pada setiap virtualhost:
```
nano /etc/httpd/conf/httpd.conf
```
Tambahkan parameter berikut pada bagian paling akhir file:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
<IfModule mod_cache.c>
    CacheRoot "/var/cache/httpd/mod_cache_disk"
    CacheDirLevels 2
    CacheDirLength 1
</IfModule>
```
Kemudian buat direktori `CacheRoot` dan sesuaikan permission:
```
mkdir -p /var/cache/httpd/mod_cache_disk
chown apache:apache -R /var/cache/httpd/mod_cache_disk
```

Kemudian buat virtualhost atau sesuaikan parameter berikut:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```
Tambahkan parameter berikut untuk mengaktifkan cache pada direktori `public_html` dan juga `style`:

:::danger
Silahkan sesuaikan lokasi atau path yang ingin di cache dengan merubah parameter `CacheEnable disk /` misalnya menjadi `CacheEnable disk /css` dan sebagainya.
:::

```jsx {7-14} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    <IfModule mod_cache.c>
        CacheEnable disk /
        CacheEnable disk /style
        CacheHeader on
        CacheDefaultExpire 10
        CacheMaxExpire 86400
        CacheIgnoreNoLastMod On
    </IfModule>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Silahkan verifikasi dengan mengakses melaui browser console atau via CURL, lalu pastikan responsenya adalah `X-Cache: HIT`:
```jsx {10,19}
[root@localhost ~]# curl -I http://focusnic.biz.id/
HTTP/1.1 200 OK
Date: Sat, 26 Jul 2025 08:50:41 GMT
Server: Apache
Last-Modified: Fri, 11 Jul 2025 14:56:11 GMT
ETag: "2b-639a882be8970"
Accept-Ranges: bytes
Content-Length: 43
Age: 360
X-Cache: HIT from focusnic.biz.id
Content-Type: text/html; charset=UTF-8

[root@localhost ~]# curl -I http://focusnic.biz.id/uploads/info.php
HTTP/1.1 200 OK
Date: Sat, 26 Jul 2025 08:47:33 GMT
Server: Apache
X-Powered-By: PHP/8.4.10
Age: 14
X-Cache: HIT from focusnic.biz.id
Content-Length: 81770
Content-Type: text/html; charset=UTF-8
```

Lalu cek pada sisi server:
```
ls -lah /var/cache/httpd/mod_cache_disk/*/*
```
Contoh output:
```
/var/cache/httpd/mod_cache_disk/M/z:
total 84K
drwx------. 2 apache apache  74 Jul 26 15:47 .
drwx------. 3 apache apache  15 Jul 26 15:47 ..
-rw-------. 1 apache apache 80K Jul 26 15:47 ykCo0j02gjUwGjHFkReg.data
-rw-------. 1 apache apache 738 Jul 26 15:47 ykCo0j02gjUwGjHFkReg.header

/var/cache/httpd/mod_cache_disk/W/D:
total 8.0K
drwx------. 2 apache apache  74 Jul 26 15:44 .
drwx------. 3 apache apache  15 Jul 26 15:44 ..
-rw-------. 1 apache apache  43 Jul 26 15:44 KERT3etnTDHHgli7T9Tg.data
-rw-------. 1 apache apache 810 Jul 26 15:44 KERT3etnTDHHgli7T9Tg.header
```

Cek menggunakan perintah `htcacheclean`:
```
htcacheclean -A -v -p /var/cache/httpd/mod_cache_disk
```
Contoh output:
```
http://focusnic.biz.id:80/? 810 43 200 0 1753519481246968 1753605881246968 1753519481246634 1753519481246968 1 0
http://focusnic.biz.id:80/uploads/info.php? 738 81770 200 0 1753519639081579 1753520239081579 1753519639079998 1753519639081579 1 0
```
Hapus cache menggunakan perintah `htcacheclean`:
```
htcacheclean -l 1k -v -t -p /var/cache/httpd/mod_cache_disk/ 
```
Contoh output:
```
Cleaned /var/cache/httpd/mod_cache_disk. Statistics:
size limit 1.0K
inodes limit 0
total size was 81.8K, total size now 0.4K
total inodes was 12, total inodes now 4
total entries was 3, total entries now 1
2 entries deleted (0 from future, 0 expired, 2 fresh)
```

Otomasi hapus cache setiap satu menit menggunakan `htcacheclean` dengan mode *daemonize*:
```
htcacheclean -d 1m -l 1k -t -p /var/cache/httpd/mod_cache_disk/
```

Cek proses *daemon* `htcacheclean`:
```
ps aux |grep htcache
```
Contoh output:
```
root        3540  0.0  0.0  19824   176 ?        Ss   15:56   0:00 htcacheclean -d 1m -l 1k -t -p /var/cache/httpd/mod_cache_disk/
```

### Browser Cache

Tuning Apache yang tidak kalah menarik dan paling banyak diterapkan adalah **mengaktifkan browser caching (HTTP cache)** menggunakan **mod_expires** dan **mod_headers**, yang merupakan metode paling umum dan efisien untuk meningkatkan performa website.

Pastikan module sudah aktif, cek menggunakan perintah berikut:
```
httpd -M  | grep expires
httpd -M  | grep headers
```

Contoh output yang diharapkan:
```
expires_module (shared)
headers_module (shared)
```

Jika tidak muncul, maka silahkan aktifkan pada file berikut:
```
nano /etc/httpd/conf.modules.d/00-base.conf
```

Kemudian isi atau tambahkan parameter berikut:
```
LoadModule expires_module modules/mod_expires.so
LoadModule headers_module modules/mod_headers.so
```

Restart Apache untuk menyimpan perubahan dan cek kembali modulenya:
```
apachectl configtest
systemctl restart httpd
```

Berikut konfigurasi cache server-wide artinya semua virtualhost akan terdampak:
```
nano /etc/httpd/conf/httpd.conf
```
Tambahkan parameter berikut pada bagian paling akhir file:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
<IfModule mod_expires.c>
    ExpiresActive On

    # Default for all files
    ExpiresDefault "access plus 1 day"

    # Caching for MIME
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"

    ExpiresByType text/css "access plus 7 days"
    ExpiresByType text/javascript "access plus 7 days"
    ExpiresByType application/javascript "access plus 7 days"

    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/json "access plus 1 hour"
    ExpiresByType application/xml "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
    # Control cache for static files
    <FilesMatch "\.(ico|jpg|jpeg|png|gif|webp|svg|css|js)$">
        Header set Cache-Control "public, max-age=2592000, immutable"
    </FilesMatch>

    # Disable cache for dynamic files
    <FilesMatch "\.(php|html|htm)$">
        Header set Cache-Control "no-store, no-cache, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires 0
    </FilesMatch>
</IfModule>
```

Untuk per virtualhost atau individu per website/domain maka silahkan tambahkan parameter berikut:
```jsx {7-28,30-42} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

<IfModule mod_expires.c>
    ExpiresActive On

    # Default for all files
    ExpiresDefault "access plus 1 day"

    # Caching for MIME
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"

    ExpiresByType text/css "access plus 7 days"
    ExpiresByType text/javascript "access plus 7 days"
    ExpiresByType application/javascript "access plus 7 days"

    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/json "access plus 1 hour"
    ExpiresByType application/xml "access plus 1 hour"
</IfModule>

<IfModule mod_headers.c>
    # Control cache for static files
    <FilesMatch "\.(ico|jpg|jpeg|png|gif|webp|svg|css|js)$">
        Header set Cache-Control "public, max-age=2592000, immutable"
    </FilesMatch>

    # Disable cache for dynamic files
    <FilesMatch "\.(php|html|htm)$">
        Header set Cache-Control "no-store, no-cache, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires 0
    </FilesMatch>
</IfModule>

    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined
</VirtualHost>
```

Penjelasan parameter:

| **Tipe File** | **Durasi Cache** | **Tujuan** |
| --- | --- | --- |
| Gambar (`jpg`, `png`) | 1 bulan | Menghindari re-download asset besar dan tidak berubah |
| CSS / JS | 7 hari | Optimal untuk update cepat tapi tetap hemat bandwidth |
| HTML / PHP | Tidak di-cache | Konten dinamis, harus selalu fresh |
| Header `immutable` | Tidak cek ulang cache | Browser tidak akan cek ulang file yang sudah di-cache |

Lalu restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Lalu ujicoba cache yang sudah di set:
```jsx {9-11}
[root@localhost ~]# curl -I http://focusnic.biz.id
HTTP/1.1 200 OK
Date: Sat, 26 Jul 2025 13:22:44 GMT
Server: Apache
Last-Modified: Fri, 11 Jul 2025 14:56:11 GMT
ETag: "2b-639a882be8970"
Accept-Ranges: bytes
Content-Length: 43
Cache-Control: no-store, no-cache, must-revalidate
Expires: 0
Pragma: no-cache
Content-Type: text/html; charset=UTF-8
```

## Compression

:::info
Untuk konfigurasi kompresi seperti `mod_deflate` dan `mod_brotli`, sebaiknya ditetapkan secara server-wide.
:::

Berikutnya yang penting adalah **kompresi di Apache** menggunakan modul `mod_deflate` dan `mod_brotli`, yang berfungsi untuk **mengompresi output konten sebelum dikirim ke browser**, terutama HTML, CSS, JS, XML, dan JSON. Tujuan utamanya adalah untuk menghemat bandwidth dan mempercepat loading time.

Apakah mengaktifkan `mod_deflate` dan `mod_brotli` secara bersamaan akan mengakitbatkan konflik? Jawabannya, tidak. Apache otomatis memilih format kompresi (`br` atau `gzip`) berdasarkan `Accept-Encoding` dari browser. Berikut encoding dari masing-masing module:

- Deflate/Gzip → `Content-Encoding: gzip`
- Brotli → `Content-Encoding: br`

Langkah pertama, pastikan module berikut sudah aktif:
```
httpd -M | grep brotli
httpd -M | grep deflate
```

Contoh output:
```
brotli_module (shared)
deflate_module (shared)
```

Jika tidak muncul atau belum aktifkan silahkan edit konfigurasi berikut:
```
nano /etc/httpd/conf.modules.d/00-base.conf
```

Tambahkan parameter berikut:
```jsx showLineNumbers title"/etc/httpd/conf.modules.d/00-base.conf"
LoadModule brotli_module modules/mod_brotli.so
LoadModule deflate_module modules/mod_deflate.so
```

Lalu restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Untuk mengaktifkan compression secara server-wide, silahkan edit file berikut:
```
nano /etc/httpd/conf/httpd.conf
```

Tambahkan parameter berikut pada bagian akhir file:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json application/xml
    Header append Vary Accept-Encoding
    SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|webp|mp4|zip|pdf)$ no-gzip dont-vary
</IfModule>

<IfModule mod_brotli.c>
    BrotliCompressionQuality 5
    AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/css application/javascript application/json application/xml
    Header append Vary Accept-Encoding
    SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|webp|mp4|zip|pdf)$ no-brotli dont-vary
</IfModule>
```
Penjelasan parameter:

- `mod_deflate`: Baris ini memberi tahu Apache untuk mengaktifkan kompresi menggunakan GZIP (DEFLATE) untuk tipe MIME tertentu, yaitu: halaman html, tesk biasa, css, javascript, json, xml. Apache akan mengompresi output jenis konten ini jika browser mendukung GZIP melalui header Accept-Encoding. Membuat pengecualian: jika permintaan URL berakhiran dengan salah satu ekstensi berikut: .gif, .jpg, .jpeg, .png, .webp, .mp4, .zip, .pdf maka Apache tidak akan mengkompresi konten tersebut.

- `mod_brotli`: Menentukan kualitas kompresi Brotli, dari 1 (cepat tapi besar) sampai 11 (paling kecil tapi berat CPU). Nilai 5 adalah kompromi antara performa dan efisiensi. 

- `Header append Vary Accept-Encoding`: Memberitahu cache proxy/CDN bahwa konten berbeda dapat dikirim tergantung dari encoding yang didukung browser.

- `dont-vary`: Mencegah penambahan Vary pada konten.


Kemudian restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Lalu coba buka browser dan cek console browser atau gunakan situs ini untuk mengecek gzip/brotli test https://www.giftofspeed.com/gzip-test/
![](/img/almalinux8-apache-compression.jpg)<br/>


## HTTP/2
:::danger
HTTP/2 hanya aktif untuk HTTPS (port 443), tidak berjalan di HTTP (port 80).
:::

**HTTP/2 secara signifikan menambah performa** dibanding HTTP/1.1, terutama untuk situs modern dengan banyak aset (gambar, CSS, JS). HTTP/2 membawa banyak *fitur optimasi* yang meningkatkan kecepatan, efisiensi, dan pengalaman pengguna.

Cek module `http2` pada Apache:
```
httpd -M | grep http2
```

Contoh output:
```
http2_module (shared)
```

Jika belum aktif, silahkan edit file berikut:
```
nano /etc/httpd/conf.modules.d/10-h2.conf
```
Hapus komentar (#) atau tambahkan parameter berikut:
```jsx showLineNumbers title="/etc/httpd/conf.modules.d/10-h2.conf"
LoadModule http2_module modules/mod_http2.so
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Pastikan sudah memiliki virtualhost dan SSL, untuk kali ini saya akan menggunakan existing virtualhost yanmg sudah terinstall SSL Let's Encrypt:
```
nano /etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf
```

Tambahkan parameter `Protocols h2 http/1.1` pada didalam baris `<VirtualHost>`:
```js {3} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id-le-ssl.conf"
IfModule mod_ssl.c>
<VirtualHost *:443>
    Protocols h2 http/1.1
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log combined

SSLCertificateFile /etc/letsencrypt/live/focusnic.biz.id/fullchain.pem
SSLCertificateKeyFile /etc/letsencrypt/live/focusnic.biz.id/privkey.pem
Include /etc/letsencrypt/options-ssl-apache.conf
</VirtualHost>
```

Kemudian restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

## Kesimpulan

Melakukan tuning dan konfigurasi Apache di AlmaLinux 8 adalah langkah krusial untuk memastikan **stabilitas, efisiensi, dan performa maksimal** dari server web Anda. Dengan mengatur MPM yang sesuai, mengaktifkan caching, menyesuaikan jumlah koneksi, mengatur log, serta mengimplementasikan kontrol keamanan dasar, kita dapat memaksimalkan kemampuan Apache dalam menghadapi beban lalu lintas tinggi maupun skenario produksi kompleks. Konfigurasi Apache yang optimal tidak hanya soal menyala dan jalan, tapi harus disesuaikan dengan beban kerja, jumlah pengguna, tipe konten, dan fitur modern seperti HTTP/2 dan kompresi. Gabungan tuning MPM, cache, keepalive, dan kompresi bisa menghasilkan server cepat, hemat resource, dan SEO-friendly.

Q: Apa MPM terbaik untuk digunakan di AlmaLinux 8? <br/>
A: MPM `event` adalah pilihan terbaik untuk performa tinggi, terutama untuk website dengan banyak koneksi keep-alive.

Q: Apakah `mod_php` bisa digunakan bersama MPM event? <br/>
A: Tidak disarankan. Gunakan PHP-FPM sebagai pengganti `mod_php` agar kompatibel dengan MPM event.

Q: Apakah perlu menggunakan CDN meskipun sudah mengaktifkan caching di Apache? <br/>
A: CDN tetap membantu distribusi konten global dan mempercepat akses user internasional. Caching lokal dan CDN bekerja saling melengkapi.

Q: Apakah tuning Apache cukup atau perlu juga tuning kernel? <br/>
A: Untuk performa maksimal, tuning kernel seperti `sysctl` dan pengaturan TCP juga sangat dianjurkan, terutama untuk trafik sangat tinggi.

Q: Apakah `mod_deflate` dan `mod_brotli` bisa digunakan bersamaan? <br/>
A: Ya. Apache akan memilih salah satu berdasarkan kemampuan browser (Accept-Encoding). Tidak akan ada konflik, dan konten tidak dikompresi dua kali.

Q: Apakah KeepAlive bersifat server-wide? <br/>
A: Ya. Direktif seperti KeepAlive, MaxKeepAliveRequests, dan KeepAliveTimeout bersifat server-wide, dan sebaiknya diletakkan di httpd.conf.

Q: Bagaimana cara menghindari kompresi terhadap file yang sudah terkompresi? <br/>
A: Gunakan direktif seperti berikut: <br/>
deflate:
```
SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|webp|mp4|zip|pdf)$ no-gzip dont-vary
```
brotli:
```
SetEnvIfNoCase Request_URI \.(?:gif|jpe?g|png|webp|mp4|zip|pdf)$ no-brotli dont-vary
```

Q: Apa rumus untuk menghitung MaxRequestWorkers? <br/>
A: `MaxRequestWorkers = Total RAM / Memory per proses Apache`

Q: Bagaimana cara menghapus cache Apache? <br/>
A: Untuk mod_cache_disk: hapus isi folder CacheRoot secara manual, misal:
```
rm -rf /var/cache/httpd/mod_cache_disk/
```

Q: Bagaimana memastikan Brotli & Deflate bekerja? <br/>
A: Gunakan curl:
```
curl -H "Accept-Encoding: br" -I http://focusnic.biz.id
curl -H "Accept-Encoding: gzip" -I http://focusnic.biz.id
```
