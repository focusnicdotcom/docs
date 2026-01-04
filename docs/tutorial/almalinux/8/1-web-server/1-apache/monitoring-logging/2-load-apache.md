---
title: Load Status Apache
description: Cara Install Load Status mod_status di Apache Web Server AlmaLinux 8
sidebar_position: 2
sidebar_label: Load Status Apache
---

Mengelola **kinerja server web Apache** di lingkungan **AlmaLinux 8** memerlukan pemantauan yang cermat terhadap beban kerja server. Salah satu fitur penting yang sering diabaikan namun sangat berguna adalah **Apache Load Status**. Modul ini memungkinkan administrator sistem dan DevOps untuk memantau *real-time load* server, koneksi aktif, serta respons permintaan HTTP yang sedang berlangsung. Pada panduan ini, kita akan membahas secara rinci cara mengaktifkan, mengonfigurasi, dan mengoptimalkan **mod_status** Apache di sistem **AlmaLinux 8** untuk memastikan performa server tetap prima.

**mod_status** adalah modul bawaan Apache yang memungkinkan kita untuk mengakses informasi rinci mengenai status server saat ini. Data yang ditampilkan antara lain:

- Jumlah permintaan HTTP yang sedang diproses
- Koneksi aktif
- *Idle workers*
- Waktu rata-rata pemrosesan permintaan
- Beban CPU Apache

Dengan mengaktifkan **Apache Load Status**, administrator dapat melakukan *troubleshooting*, pengambilan keputusan skalabilitas, dan pemantauan beban sistem secara lebih tepat.

## Prerequisite

- Akses full `root`
- Basic Linux Command Line
- Security
- Apache/HTTPD sudah terinstall
- Domain (opsional)
- Timezone sudah di konfigurasi

## Konfigurasi mod_status

Sebelum mengaktifkan `mod_status`, pastikan bahwa Apache telah terpasang dan berjalan di sistem AlmaLinux 8. Jika belum silahkan install dengan perintah berikut:
```
dnf update -y
dnf install httpd -y
systemctl enable --now httpd
```
Pastikan juga bahwa port 80 dan 443 terbuka pada firewall:
```
firewall-cmd --permanent --add-service={http,https}
firewall-cmd --reload
```

Secara default, modul `mod_status` biasanya sudah disertakan saat instalasi Apache. Untuk memastikan, jalankan:
```
httpd -m | grep status
```
Contoh output:
```
status_module (shared)
```
Jika belum aktif, tambahkan baris berikut ke dalam file konfigurasi utama Apache:
```
nano /etc/httpd/conf/httpd.conf
```
Isi parameter berikut pada bagian paling bnawah:
```jsx showLineNumbers title="/etc/httpd/conf/httpd.conf"
LoadModule status_module modules/mod_status.so
```

## Virtualhost untuk Load Status
:::info
Apache Load Status (mod_status) sebaiknya hanya diakses oleh administrator, bukan per VirtualHost. `mod_status` memberikan status **seluruh instance Apache**, bukan hanya per-VirtualHost. Jika pelanggan melihat `/server-status`, mereka bisa:

- Mengetahui **domain lain** yang di-host dalam server shared
- Menebak trafik yang sedang tinggi dan rendah dari domain lain
- Melihat jalur URI (URL path) yang sedang diakses
:::

Agar lebih terstruktur dan sesuai praktik produksi, tambahkan konfigurasi `mod_status` dalam konteks VirtualHost, contoh:
```
nano /etc/httpd/conf.d/status.focusnic.biz.id.conf
```
Isi parameter berikut:
```jsx {5-11} showLineNumbers title="/etc/httpd/conf.d/status.focusnic.biz.id.conf"
<VirtualHost *:80>
    ServerAdmin admin@focusnic.biz.id
    ServerName status.focusnic.biz.id

    <Location "/server-status">
        SetHandler server-status
        AuthType Basic
        AuthName "Restricted Access"
        AuthUserFile /etc/httpd/.htpasswd
        Require valid-user
    </Location>

</VirtualHost>
```

Kemudian buat file user dan password:
```
htpasswd -c /etc/httpd/.htpasswd adminstatus
```

Restart Apache untuk menyimpan perubahan:
```
apachectl configtest
systemctl restart httpd
```

Akses browser `http://$NAMA_DOMAIN/server-status` dan masukkan username `adminstatus` lalu password yang sudah di set:
![](/img/almalinux8-apache-loadstatus.jpg)<br/>

## Troubleshooting
Jika halaman `/server-status` tidak tampil:

- **Periksa Modul**: Pastikan `mod_status` aktif
- **Periksa Firewall**: Pastikan port 80 terbuka
- **Cek IP Akses**: Pastikan IP Anda masuk dalam `Require ip`
- **Cek Error Log**: Periksa `/var/log/httpd/error_log` untuk kesalahan konfigurasi

## Kesimpulan
Konfigurasi **Apache Load Status** di sistem **AlmaLinux 8** merupakan langkah penting dalam pengelolaan performa dan pemantauan infrastruktur web server secara real-time. Dengan memahami dan menerapkan fitur ini secara benar, kita dapat meningkatkan efisiensi, mempercepat waktu respons, dan mencegah terjadinya downtime karena server overload.


Q: Apa itu Apache Load Status (mod_status)? <br/>
A: **Apache Load Status** adalah fitur bawaan dari Apache HTTP Server melalui modul `mod_status` yang memungkinkan administrator melihat **status server secara real-time**, termasuk jumlah koneksi aktif, worker yang idle, dan beban sistem.

Q: Apakah mod_status aktif secara default? <br/>
A: Tidak selalu. Di sebagian instalasi, modul ini tersedia namun belum diaktifkan. Anda dapat memeriksanya dengan perintah:
```
httpd -M | grep status
```
Jika belum aktif, tambahkan `LoadModule status_module` di konfigurasi Apache.

Q: Bagaimana cara mengakses halaman /server-status? <br/>
A: Setelah modul diaktifkan dan dikonfigurasi, Anda bisa mengaksesnya melalui URL: `http://localhost/server-status`

Q: Siapa yang boleh mengakses halaman Load Status? <br/>
A: **Hanya administrator** yang sebaiknya mengakses halaman ini. Jangan pernah membuka akses ini untuk publik atau pelanggan karena data yang ditampilkan bersifat sensitif dan mencerminkan seluruh aktivitas server.

Q: Apakah mod_status dapat diatur per VirtualHost? <br/>
A: Tidak secara fungsional. `mod_status` menampilkan status seluruh server Apache, bukan hanya pada konteks satu domain atau VirtualHost. Oleh karena itu, tidak disarankan untuk membiarkan pelanggan mengaksesnya.

Q: Apakah aman mengaktifkan mod_status di server publik? <br/>
A: **Tidak aman jika tidak dibatasi.** Sangat disarankan untuk:

- **Membatasi akses IP**
- **Menggunakan autentikasi Basic**
- **Menempatkan status di subdomain internal**

Contoh konfigurasi:
```
<Location "/server-status">
    SetHandler server-status
    Require ip 127.0.0.1
</Location>
```

Q: Bagaimana jika pelanggan ingin memantau trafik mereka? <br/>
A: Gunakan solusi yang lebih sesuai seperti:

- **AWStats** atau **Webalizer**
- File log khusus per VirtualHost
- Dashboard monitoring seperti **Grafana** dengan Prometheus yang hanya menampilkan data mereka

Q: Apakah halaman /server-status bisa dijadikan alat monitoring? <br/>
A: Ya. Banyak tools seperti **Zabbix**, **Nagios**, dan **Prometheus** bisa memanfaatkan halaman ini untuk melakukan **data scraping** dan membuat sistem notifikasi.

Q: Apakah mod_status menyebabkan beban tambahan di server? <br/>
A: Tidak signifikan. Modul ini sangat ringan karena hanya membaca status internal Apache. Namun, akses terlalu sering dari bot atau tools monitoring harus dikontrol agar tidak menimbulkan beban tidak perlu.

Q: Bagaimana jika halaman status tidak tampil? <br/>
A: Periksa hal berikut:

- Modul `mod_status` aktif
- Konfigurasi sudah benar
- Tidak diblokir oleh firewall
- IP Anda termasuk dalam `Require ip`
- Tidak terjadi error konfigurasi (lihat log `/var/log/httpd/error_log`)

Q: Apakah bisa menampilkan status Apache melalui command line tanpa mod_status? <br/>
A: Bisa, walaupun terbatas. Gunakan:
```
apachectl status
```
Contoh output:
```jsx {9-11}
● httpd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpd.service; enabled; vendor preset: disabled)
  Drop-In: /etc/systemd/system/httpd.service.d
           └─php-fpm.conf
   Active: active (running) since Mon 2025-07-21 23:57:49 WIB; 12min ago
     Docs: man:httpd.service(8)
  Process: 21228 ExecReload=/usr/sbin/httpd $OPTIONS -k graceful (code=exited, status=0/SUCCESS)
 Main PID: 85761 (httpd)
   Status: "Total requests: 7; Idle/Busy workers 100/0;Requests/sec: 0.0096; Bytes served/sec:  36 B/sec"
    Tasks: 278 (limit: 11143)
   Memory: 131.4M
   CGroup: /system.slice/httpd.service
           ├─85761 /usr/sbin/httpd -DFOREGROUND
           ├─85763 /usr/sbin/httpd -DFOREGROUND
           ├─85764 /usr/sbin/httpd -DFOREGROUND
```
