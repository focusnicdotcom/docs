---
title: PHP
description: Cara Install dan Konfigurasi PHP pada Apache di AlmaLinux 8
sidebar_position: 5
sidebar_label: PHP
---

Dalam dunia pengembangan web modern, **PHP dan Apache Web Server** merupakan dua komponen penting yang saling melengkapi. Keduanya mendominasi lingkungan server-side hosting di berbagai perusahaan maupun individu yang mengelola situs web berbasis CMS seperti WordPress, Joomla, Laravel, dan sebagainya. Panduan ini akan membahasa bagaimana **cara install PHP di Apache Web Server AlmaLinux 8** secara lengkap, mulai dari instalasi paket hingga pengujian konfigurasi.

## Prerequisite

- Akses full `root`
- Apache/HTTPD sudah terinstall
- Basic Linux Command Line
- Security

## Instalasi PHP

Langkah pertama sebelum menginstal PHP adalah memastikan bahwa sistem kita dalam kondisi terbaru dan siap untuk digunakan.
```
dnf update -y
dnf install epel-release -y
```
Setelah memperbarui sistem, kita perlu memastikan bahwa Apache Web Server (httpd) telah terinstal. Jika belum, lakukan instalasi dengan perintah berikut:
```
dnf install httpd -y
systemctl enable --now httpd
```
Jika Anda menggunakan firewall (seperti firewalld), pastikan port HTTP dan HTTPS dibuka:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```
AlmaLinux 8 secara default menyediakan PHP versi tertentu, namun untuk mendapatkan versi terbaru atau versi spesifik seperti PHP 7.4, PHP 8.0, atau PHP 8.1, kita perlu menambahkan repositori Remi.

Instal repositori Remi:
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
Name                               Stream                                 Profiles                                                 Summary                                            
php                                7.2 [d]                                common [d], devel, minimal                               PHP scripting language                             
php                                7.3                                    common [d], devel, minimal                               PHP scripting language                             
php                                7.4                                    common [d], devel, minimal                               PHP scripting language                             
php                                8.0                                    common [d], devel, minimal                               PHP scripting language                             
php                                8.2                                    common [d], devel, minimal                               PHP scripting language                             

Remi's Modular repository for Enterprise Linux 8 - x86_64
Name                               Stream                                 Profiles                                                 Summary                                            
php                                remi-7.2                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-7.3                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-7.4                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.0                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.1                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.2                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.3                               common [d], devel, minimal                               PHP scripting language                             
php                                remi-8.4                               common [d], devel, minimal                               PHP scripting language                             

Hint: [d]efault, [e]nabled, [x]disabled, [i]nstalled
```
Aktifkan modul PHP versi yang diinginkan. Misalnya, untuk PHP 8.4, gunakan:
```
dnf module reset php -y
dnf module enable php:remi-8.4 -y
```
Setelah repositori aktif, kita dapat melanjutkan dengan menginstal PHP beserta modul-modul penting yang umum digunakan:
```
dnf install -y php php-cli php-common php-mysqlnd php-fpm php-opcache php-gd php-curl php-mbstring php-xml php-json
```
Periksa versi PHP yang terinstal:
```
php -v
```
Berikut contoh outputnya:
```
PHP 8.4.10 (cli) (built: Jul  2 2025 02:22:42) (NTS gcc x86_64)
Copyright (c) The PHP Group
Built by Remi's RPM repository <https://rpms.remirepo.net/> #StandWithUkraine
Zend Engine v4.4.10, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.10, Copyright (c), by Zend Technologies
```
Untuk melihat module php yang terinstall, jalankan perintah berikut:
```
php -m
```

## Konfigurasi Apache agar Kompatibel dengan PHP

Setelah PHP berhasil diinstal, kita perlu mengonfigurasi Apache agar dapat menjalankan skrip PHP. Jika Anda menggunakan `mod_php`, maka Apache akan langsung mengenali file .php setelah modul terkait terinstal. Pastikan file konfigurasi Apache di `/etc/httpd/conf.d/php.conf` memiliki direktif seperti berikut:
```jsx showLineNumbers title="/etc/httpd/conf.d/php.conf"
AddType text/html .php
DirectoryIndex index.php
```

Restart Apache agar perubahan diterapkan:
```
apachectl configtest
systemctl restart httpd
```
Untuk menguji apakah instalasi PHP berhasil dan dapat dijalankan melalui Apache, buat file uji coba di direktori root web server:
```
echo "<?php phpinfo(); ?>" | tee /var/www/html/info.php
```
Akses file tersebut melalui browser dengan mengetik alamat IP server atau domain Anda: `http://IP_ADDRESS_SERVER/info.php`. Jika halaman PHP Info muncul, berarti PHP sudah berhasil terintegrasi dengan Apache.
![](/img/almalinux8-php84.jpg)<br/>

### PHP Production
Beberapa pengaturan penting yang sering dimodifikasi ketika menjalankan PHP pada lingkungan production.
| Parameter | Fungsi Utama | Rekomendasi Produksi |
| --- | --- | --- |
| `expose_php = Off` | Menyembunyikan versi PHP dari header HTTP `X-Powered-By`. Mencegah informasi sistem bocor. | ✅ Wajib dimatikan |
| `display_errors = Off` | Menonaktifkan tampilan error ke browser. Melindungi dari informasi sensitif. | ✅ Wajib dimatikan |
| `log_errors = On` | Mengaktifkan logging semua error ke file log internal. Sangat berguna untuk debugging. | ✅ Wajib diaktifkan |
| `error_log = /var/log/php_errors.log` | Lokasi file log error PHP. Pastikan file ini bisa ditulis oleh PHP-FPM. | ✅ Disarankan |
| `memory_limit = 512M` | Batas maksimal memori yang digunakan oleh satu proses skrip PHP. Hindari terlalu kecil atau terlalu besar. | ✅ Sesuai kebutuhan |
| `upload_max_filesize = 128M` | Ukuran maksimum file yang boleh di-upload melalui form. | ✅ Sesuaikan kebutuhan |
| `post_max_size = 128M` | Batas ukuran total data POST (termasuk upload file). Harus ≥ dari `upload_max_filesize`. | ✅ Sesuaikan |
| `max_execution_time = 300` | Waktu maksimal eksekusi skrip (dalam detik). Melindungi dari skrip yang looping terlalu lama. | ✅ Wajib diatur |
| `date.timezone = Asia/Jakarta` | Menentukan zona waktu server. Penting untuk waktu log, cache, cron, dsb. | ✅ Sesuaikan lokal |

Untuk memodifikasi `php.ini` ada pada `/etc/php.ini`. Setelah melakukan modifikasi silahkan restart php-fpm:
```
systemctl restart php-fpm
```

Kemudian konfigurasi PHP-FPM ada di `/etc/php-fpm.d/www.conf`. Berikut parameter yang bisa disesuaikan:
:::info
Tips performa: Sesuaikan `pm.max_children` dengan kapasitas RAM server.
:::
```jsx showLineNumbers title="/etc/php-fpm.d/www.conf"
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```
Setelah melakukan perubahan php-fpm. Silahkan restart service php-fpm:
```
systemctl restart php-fpm
```

Berikut penjelasan parameter diatas:
```
Request Incoming
      ↓
[ Idle Worker ]  ←--- diatur oleh min/max_spare_servers
      ↓
[ Proses Aktif ]
      ↓
[ Selesai → idle kembali atau dihentikan ]
```

1. `pm` <br/>

Mode ini menentukan **mode pengelolaan proses**.

- `static`: jumlah proses worker tetap (konstan).
- `dynamic`: proses akan dibuat dan dihentikan sesuai kebutuhan.
- `ondemand`: proses hanya dibuat saat ada request, lalu mati saat idle.

 **`dynamic`** adalah yang paling umum dan cocok untuk server produksi dengan trafik variatif.

2. `pm.max_children` <br/>

Jumlah **maksimal proses PHP** (child process) yang boleh berjalan secara bersamaan.

- Ini batas tertinggi. Jika lebih dari 50 permintaan PHP aktif, permintaan lainnya akan **antri** sampai ada worker bebas.
- Terlalu besar → risiko menghabiskan RAM dan swap.
- Terlalu kecil → bottleneck, slow response saat trafik tinggi.

```
(Total RAM - RAM untuk sistem) / memory per process PHP
```
Contoh: Jika satu proses PHP kira-kira butuh 30MB, dan server punya 2GB RAM:
```
(2048MB - 512MB OS) / 30MB ≈ 51
```

3. `pm.start_servers` <br/>

Jumlah proses PHP-FPM **yang langsung dibuat saat service baru dijalankan**.

- Terlalu kecil → request awal akan menunggu worker dibuat.
- Terlalu besar → konsumsi RAM tinggi saat idle.

**5** adalah nilai aman untuk server dengan lalu lintas sedang.

4. `pm.min_spare_servers` <br/>

Jumlah minimum **proses idle** (siap pakai tapi tidak aktif).

- Jika proses idle kurang dari ini, PHP-FPM akan membuat proses baru.
- Menjaga agar sistem responsif terhadap permintaan mendadak.

5. `pm.max_spare_servers` <br/>

Jumlah maksimum **proses idle** (tidak aktif tapi menunggu request).

- Jika lebih dari nilai ini, PHP-FPM akan **menghentikan** beberapa proses idle.
- Menghemat RAM saat trafik turun.


## Troubleshooting

1. Apache Tidak Menjalankan File PHP (File Didownload)

Ketika mengakses `.php`, browser justru mendownload file, bukan mengeksekusinya. Solusi pastikan konfigurasi berikut ada di VirtualHost atau konfigurasi global:
```jsx showLineNumbers title="/etc/httpd/conf.d/php.conf"
<FilesMatch \.php$>
    SetHandler "proxy:unix:/run/php-fpm/www.sock|fcgi://localhost"
</FilesMatch>
```

Pastikan juga php-fpm sudah running:
```
systemctl status php-fpm
```

2. PHP Tidak Terinstal atau Versi Tidak Sesuai

`php -v` tidak mengembalikan informasi, atau versi PHP tidak sesuai harapan. Pastikan menggunakan repository Remi:
```
dnf install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
dnf module reset php -y
dnf module enable php:remi-8.4 -y
dnf install php
```

3. 500 Internal Server Error saat Akses File PHP

Website memunculkan error 500 ketika menjalankan file PHP. Biasanya disebabkan oleh permission file/direktori salah. Pastikan permission file adalah `644` dan direktori `711` atau `755`. Lakukan troubleshooting dengan menghidupkan error log:
```jsx showLineNumbers title="/etc/php.ini"
log_errors = On
error_log = /var/log/php_errors.log
```

4. phpinfo() Tidak Muncul

Pastikan file info.php diletakkan di DocumentRoot:
```
<?php phpinfo(); ?>
```

5. PHP-FPM High CPU Usage

Proses php-fpm menggunakan CPU hingga 100%. Biasanya disebabkan oleh kode aplikasi, atau ada kemungkinan skrip di susupi, silahkan lakukan mitigasi dengan disable function berikut:
```jsx showLineNumbers title="/etc/php.ini"
disable_functions = exec,passthru,shell_exec,system
```

6. Permintaan PHP Lambat atau Timeout

Situs sangat lambat atau tidak merespons saat trafik tinggi. Cek apakah `pm.max_children` cukup besar. Jika tidak, proses akan masuk dalam antrian. Gunakan perintah berikut untuk mengecek:
```
ps -ylC php-fpm --sort:rss
```

## Kesimpulan
Instalasi PHP di Apache Web Server pada **AlmaLinux 8** adalah langkah penting dalam membangun server hosting yang tangguh dan siap produksi. Dengan memanfaatkan **repositori Remi**, kita dapat memilih versi PHP sesuai kebutuhan aplikasi modern. Integrasi dengan **PHP-FPM melalui FastCGI** juga memberikan performa dan efisiensi tinggi yang ideal untuk lingkungan produksi.

Langkah-langkah yang telah dibahas meliputi:

- Update sistem dan instalasi Apache
- Instalasi PHP dan modul tambahan
- Aktivasi versi PHP via Remi
- Integrasi dengan Apache
- Uji fungsionalitas dengan file `phpinfo()`
- Penyesuaian konfigurasi untuk keamanan dan performa

Dengan pendekatan ini, server Anda siap untuk menjalankan CMS, framework, atau aplikasi PHP kustom secara efisien, aman, dan stabil.

Jika Anda ingin instalasi PHP yang **cepat, aman, dan optimal** tanpa pusing konfigurasi manual, **jangan ragu untuk memilih layanan dari Focusnic — solusi terbaik untuk instalasi server dan cloud VPS profesional.**


Q: Apakah wajib menggunakan Remi repository?<br/>
A: Ya, jika Anda ingin menggunakan versi PHP terbaru atau spesifik (seperti PHP 8.1). Repositori bawaan AlmaLinux hanya menyediakan versi default yang mungkin terlalu lama untuk aplikasi modern.

Q: Apa perbedaan mod_php dan php-fpm?<br/>
A:
- `mod_php`: PHP dijalankan dalam proses Apache. Lebih sederhana tapi kurang efisien.
- `php-fpm`: PHP dijalankan terpisah melalui FastCGI. Lebih efisien, stabil, dan scalable untuk produksi.

Q: Apakah bisa install lebih dari satu versi PHP?<br/>
A: Bisa, menggunakan dnf module install dan mengelola versi via alternatives atau php-fpm pool terpisah. Namun, perlu konfigurasi lanjutan dan hati-hati.

Q: Di mana lokasi file konfigurasi utama PHP?<br/>
A: 
- Global: `/etc/php.ini`
- FPM: `/etc/php-fpm.d/www.conf`

Q: Bagaimana mengetahui modul PHP mana yang terinstal?<br/>
A: Gunakan perintah: `php -m`

Q: Apa bedanya pm = dynamic dengan pm = ondemand?<br/>
A: 
- `dynamic`: membuat sejumlah worker aktif sejak awal, cocok untuk trafik fluktuatif.
- `ondemand`: proses hanya dibuat saat request datang, lebih hemat RAM tapi lambat merespons permintaan pertama.

Q: Bagaimana cara tahu berapa nilai ideal pm.max_children?<br/>
A: Ukurlah rata-rata penggunaan memori per proses: `ps -ylC php-fpm --sort:rss`. Lalu hitung berdasarkan total RAM server:
```
(Total RAM - Sistem) / RAM per proses PHP ≈ max_children
```

Q: Apakah harus menggunakan socket (/run/php-fpm/www.sock) atau TCP (127.0.0.1:9000)?<br/>
A:
- **Socket** lebih cepat dan efisien untuk satu server (default: `/run/php-fpm/www.sock`).
- **TCP** digunakan jika Apache dan PHP-FPM dipisah server atau dalam container berbeda.

Q: Apakah PHP-FPM bisa digunakan bersama Apache dan Nginx sekaligus?<br/>
A: Bisa, asalkan masing-masing web server mengarah ke pool PHP-FPM yang berbeda atau melalui proxy yang benar.

Q: Bagaimana saya bisa tahu jika max_children terlalu kecil?<br/>
A: Lihat log error PHP-FPM
```jsx showLineNumbers title="/var/log/php-fpm/error.log"
[WARNING] server reached pm.max_children setting (50), consider raising it
```
