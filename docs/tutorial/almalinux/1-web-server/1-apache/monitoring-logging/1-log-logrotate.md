---
title: Log dan Logrotate
description: Cara Install dan Konfigurasi Log dan Logrotate di Apache Web Server AlmaLinux 8
sidebar_position: 1
sidebar_label: Log dan Logrotate
---

Dalam pengelolaan **Apache Web Server** yang optimal di sistem **AlmaLinux 8**, konfigurasi **log format** menjadi salah satu aspek vital. Log yang disusun dengan baik memungkinkan tim IT untuk melakukan **analisis lalu lintas**, **pemantauan keamanan**, serta evaluasi performa server dengan akurat. Apache menyediakan fleksibilitas tinggi dalam mengatur format log yang sesuai dengan kebutuhan, mulai dari log akses hingga log kesalahan.

Panduan ini menyajikan panduan komprehensif dan terperinci tentang **konfigurasi log format Apache di AlmaLinux 8**, mencakup berbagai opsi lanjutan serta teknik terbaik untuk memastikan log dapat memberikan wawasan maksimal terhadap aktivitas server Anda.

## Prerequisite

- Akses full `root`
- Basic Linux Command Line
- Security
- Apache/HTTPD sudah terinstall
- Domain (opsional)
- Timezone sudah di konfigurasi

## Log

Sebelum menyusun log, kita harus memahami struktur dan lokasi default log pada Apache. Di AlmaLinux 8, log Apache umumnya disimpan di direktori:

```
/var/log/httpd/
```

Dengan dua file utama sebagai berikut:

- **access_log**: mencatat seluruh permintaan HTTP yang diterima.
- **error_log**: mencatat peringatan, kesalahan, dan log penting lainnya dari Apache.

Log ini secara default dikontrol oleh direktif dalam file konfigurasi utama Apache, yaitu:

```
/etc/httpd/conf/httpd.conf
```

### LogFormat

Apache menyediakan direktif `LogFormat` untuk menentukan struktur log yang akan ditulis ke dalam file. Format ini terdiri dari berbagai placeholder yang mewakili informasi spesifik dari permintaan HTTP. Berikut adalah contoh format yang umum digunakan oleh Apache secara default:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
LogFormat "%h %l %u %t \"%r\" %>s %b" common
```
Penjelasan parameter:

- `%h` : Alamat IP client
- `%l` : Identifikasi identd user (biasanya )
- `%u` : Nama user jika otentikasi digunakan
- `%t` : Timestamp permintaan
- `%r` : Request line (`GET /index.html HTTP/1.1`)
- `%>s` : Status code HTTP
- `%b` : Ukuran response dalam byte

Apache memungkinkan kita untuk membuat format log yang benar-benar custom sesuai kebutuhan bisnis atau keamanan. Contoh:
```
LogFormat "%v %h %u %t \"%r\" %>s %b %D" mycustomformat
CustomLog /var/log/httpd/my_custom.log mycustomformat
```

Silahkan tambahkan parameter diatas pada file `/etc/httpd/conf/httpd.conf` dan diantara parameter `<IfModule log_config_module>`. Perlu diingat bahwa konfigurasi ini bersifat server-wide artinya ketika Virtualhost tidak di konfigurasi `CustomLog` maka secara otomatis semua lognya akan ada di `/var/log/httpd/my_custom.log`

Keterangan parameter:

- `%v` : Nama host server (untuk hosting banyak domain/virtualhost)
- `%D` : Waktu pemrosesan request dalam mikrodetik

Penggunaan `%D` sangat penting untuk mengidentifikasi bottleneck atau permintaan lambat.

Contoh output ketika menggunakan default log:
```jsx showLineNumbers title="/var/log/httpd/access_log"
140.213.176.67 - - [21/Jul/2025:16:09:17 +0700] "GET / HTTP/1.1" 304 - "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
```

Contoh ketika menggunakan custom log:
```jsx showLineNumbers title="/var/log/httpd/my_custom.log"
localhost.localdomain 140.213.176.67 - [21/Jul/2025:16:07:11 +0700] "GET / HTTP/1.1" 304 - 2685 
focusnic.biz.id 140.213.176.67 - [21/Jul/2025:16:13:53 +0700] "GET / HTTP/1.1" 304 - 2848
```

Dalam lingkungan multi-domain atau lebih dari satu virtualhost, sangat disarankan untuk menerapkan format dan file log terpisah untuk masing-masing domain menggunakan VirtualHost:
```jsx {7-9} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" vhost_focusnicbizid
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log vhost_focusnicbizid
</VirtualHost>
```

Berikut contoh output custom log:
```jsx showLineNumbers title="/var/log/httpd/focusnic.biz.id-access.log"
140.213.177.56 - - [21/Jul/2025:16:22:02 +0700] "GET / HTTP/1.1" 304 - "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
```

### Contoh LogFormat

1. Common Log Format <br/>

```
LogFormat "%h %l %u %t \"%r\" %>s %b" common
```
**Fungsi**: Format standar log web server. Mencatat IP, user, timestamp, permintaan, status, dan ukuran file. Cocok untuk analisis dasar trafik.


2. Combined Log Format <br/>

```
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" combined
```
**Fungsi**: Format lengkap yang mencatat informasi Referer dan User-Agent. Cocok untuk SEO, tracking visitor, dan analisis mendalam.

3. Proxy Log Format <br/>

```
LogFormat "%{X-Forwarded-For}i %l %u %t \"%r\" %>s %b" proxy
```

**Fungsi**: Digunakan di reverse proxy. Mengambil IP asli dari X-Forwarded-For untuk log trafik yang datang via proxy.

4. Format Kustom Debugging <br/>

```
LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Cookie}i\" \"%{Authorization}i\"" debuglog
```

**Fungsi**: Berguna untuk debugging aplikasi berbasis session atau header authentication. Menyimpan cookie dan token auth.

5. Format Kustom JSON untuk Logging Modern <br/>

```
LogFormat "{ \"ip\": \"%h\", \"method\": \"%m\", \"url\": \"%U\", \"status\": \"%>s\", \"time\": \"%t\" }" json
```
**Fungsi**: Untuk dikirim ke sistem log seperti ELK, Grafana Loki, atau Fluentd yang butuh log dalam format JSON.

6. Memfilter atau Mengabaikan Log Tertentu <br/>
```
SetEnvIf Remote_Addr "192.168.1.1" dontlog
CustomLog /var/log/httpd/access_log combined env=!dontlog
```
**Fungsi**: Dengan pengaturan ini, permintaan dari `192.168.1.1` tidak akan dicatat ke dalam log.
## Log Level

Log level digunakan untuk mengontrol jenis **pesan error** yang dicatat dalam **ErrorLog** Apache. Ini sangat berguna untuk debugging, monitoring, atau hanya mencatat kesalahan fatal.


| **Level** | **Penjelasan** |
| --- | --- |
| `emerg` | Kondisi darurat; sistem tidak dapat digunakan. |
| `alert` | Tindakan segera diperlukan. |
| `crit` | Kesalahan kritis yang memerlukan perhatian segera. |
| `error` | Error umum, sering menjadi level default. |
| `warn` | Peringatan, tidak fatal tapi perlu diperhatikan. |
| `notice` | Informasi penting yang bukan error. |
| `info` | Informasi tambahan yang berguna untuk diagnosis. |
| `debug` | Informasi detail untuk debugging; sangat verbose. |
| `trace1`–`trace8` | Level trace sangat detail, digunakan untuk pemecahan masalah tingkat lanjut. |


Cara mengatur LogLevel ada di file `/etc/httpd/conf/httpd.conf`:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
...
...
..
LogLevel warn
..
...
...
```

Kemudian diaktifkan pada masing-masing virtualhost:
```
nano /etc/httpd/conf.d/focusnic.biz.id.conf
```

Isi pada paremeter `ErrorLog`:
```jsx {8} showLineNumbers title="/etc/httpd/conf.d/focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin webmaster@focusnic.biz.id
    ServerName focusnic.biz.id
    ServerAlias www.focusnic.biz.id
    DocumentRoot /var/www/focusnic.biz.id/public_html

    LogFormat "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"" vhost_focusnicbizid
    ErrorLog /var/log/httpd/focusnic.biz.id-error.log
    CustomLog /var/log/httpd/focusnic.biz.id-access.log vhost_focusnicbizid
</VirtualHost>
```

Contoh log error pada virtualhost diatas:
```jsx showLineNumbers title="/var/log/httpd/focusnic.biz.id-error.log"
[Mon Jul 21 16:21:24.247642 2025] [proxy_fcgi:error] [pid 80233:tid 139715174033152] [client 140.213.177.56:49950] AH01071: Got error 'Primary script unknown'
```

## Logrotate
Log Apache dapat tumbuh sangat cepat, terutama pada server dengan lalu lintas tinggi. Kita dapat menggunakan tool bawaan `logrotate` untuk mengompres, dan menghapus log lama secara otomatis.

File konfigurasi logrotate untuk Apache biasanya berada di:
```
/etc/logrotate.d/httpd
```
Contoh konfigurasi:
```jsx showLineNumbers title="/etc/logrotate.d/httpd" 
/var/log/httpd/*log {
    missingok
    notifempty
    sharedscripts
    delaycompress
    postrotate
        /bin/systemctl reload httpd.service > /dev/null 2>/dev/null || true
    endscript
}
```

Secara default log akan di rotasi setiap minggu dan disimpan hingga 4 rotasi, dan dikompresi untuk efisiensi penyimpanan pada `/etc/logrotate.conf`:
```jsx showLineNumbers title="/etc/logrotate.conf"
# see "man logrotate" for details
# rotate log files weekly
weekly

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# use date as a suffix of the rotated file
dateext

# uncomment this if you want your log files compressed
compress

# RPM packages drop log rotation information into this directory
include /etc/logrotate.d
```

Jalankan logrotate:
```
logrotate -v /etc/logrotate.conf
```

Debug logrotate:
```
logrotate -d /etc/logrotate.conf 
```

## Kesimpulan
Konfigurasi **log format Apache Web Server di AlmaLinux 8** adalah fondasi penting dalam pengelolaan server yang profesional dan efisien. Dengan menyusun log secara rapi, informatif, dan terstruktur, kita bisa lebih mudah melakukan troubleshooting, analisis trafik, audit keamanan, dan evaluasi performa. Mulai dari penggunaan `LogFormat`, `CustomLog`, pemisahan log per VirtualHost, hingga integrasi dengan tool analitik — semuanya memiliki peran vital untuk sistem server yang stabil dan andal.
