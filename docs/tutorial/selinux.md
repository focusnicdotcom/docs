---
title: SELinux
description: Tutorial dan Konfigurasi SELinux
sidebar_position: 101
sidebar_label: SELinux
---
SELinux adalah mekanisme keamanan tingkat kernel di Linux yang memberikan kontrol akses berbasis kebijakan (Mandatory Access Control/MAC). SELinux membantu membatasi proses dan pengguna agar hanya bisa mengakses sumber daya yang diperbolehkan, sehingga mencegah penyalahgunaan sistem bahkan jika service terkena exploit.

## Cek Status SELinux
Jalankan perintah berikut
```
sestatus
```
Berikut hasil outputnya:
```jsx showLineNumbers
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33
```
Atau bisa juga menggunakan perintah berikut yang lebih simpel dan lansung menampilkan statusnya
```
getenforce
```
Contoh:
```jsx
Enforcing
```
Berikut penjelasan output dari SELinux:

- `Enforcing` → Aktif dan memblokir akses tak sesuai kebijakan.

- `Permissive` → Log saja (tidak memblokir).

- `Disabled` → Tidak aktif.

## Mengubah Mode SELinux (Sementara)
:::info
Perubahan ini akan hilang setelah reboot.
:::
Jalankan perintah berikut untuk mengubah ke mode `Permissive`
```
setenforce 0
```
Jalankan perintah berikut untuk mengubah ke mode `Enforcing`
```
setenforce 1
```

## Mengubah Mode SELinux (Permanen)
Edit file konfigurasi SELinux berikut:
```
nano /etc/selinux/config
```
Untuk disable SELinux silahkan isi parameter berikut atau ubah parameter yang sudah ada menjadi: 
```jsx showLineNumbers title="/etc/selinux/config"
SELINUX=disabled      # Ubah ke permissive atau disabled jika perlu
SELINUXTYPE=targeted
```
Pilihan value pada SELinux:

- `enforcing`

- `permissive`

- `disabled`

Jenis policy SELinux:

- `targeted` → Default, hanya melindungi service tertentu (Apache, SSH, dsb).

- `mls` → Multi-Level Security, kompleks, untuk sistem keamanan tinggi (jarang digunakan umum).

Setelah mengubah SELinux silahkan reboot server:
```
reboot -h now
```
## Cek Log pada SELinux
Log SELinux tersimpan di `/var/log/audit.log`. Gunakan ausearch atau sealert (jika terinstal):
```
ausearch -m avc -ts recent
```
Atau untuk menganalisis:
```
sealert -a /var/log/audit/audit.log
```
Bisa menggunakan `tail` sebagai berikut:
```
tail -f /var/log/audit/audit.log
```

## Mengelola Boolean SELinux
Ada sebuah kasus dimana ketika SELinux dalam keadaan aktif dan kita menginstall Apache/HTTPD daemon tersebut tidak mengakses folder diluar direktori defaultnya. Maka jika ingin mengizinkan Apache mengakses folder luar silahkan jalankan perintah berikut:
```
chcon -Rt httpd_sys_content_t /var/www/custom-folder
setsebool -P httpd_read_user_content on
```

Lihat semua boolean:
```
getsebool -a
```
Lihat boolean spesifik:
```
getsebool httpd_can_network_connect
```
Aktifkan boolean. `-P` agar permanen setelah reboot:
```
setsebool -P httpd_can_network_connect on
```
