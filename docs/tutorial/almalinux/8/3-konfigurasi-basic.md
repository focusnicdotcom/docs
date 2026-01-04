---
title: Konfigurasi Basic
description: Tutorial Konfigurasi Basic AlmaLinux 8
sidebar_position: 3
sidebar_label: Konfigurasi Basic
---

Setelah proses instalasi sistem operasi AlmaLinux 8 selesai atau kita biasa menyebutnya, langkah selanjutnya yang sangat penting adalah melakukan konfigurasi basic. Konfigurasi ini bertujuan untuk memastikan bahwa sistem berjalan dengan stabil, aman, dan siap digunakan baik sebagai server production, server testing, maupun server development.

:::info
Konfigurasi ini juga dapat dilakukan pada semua server baik VPS, Dedicated Server, atau sebutan semacamnya. Pada saat pertama kali booting biasanya kita akan melakukan konfigurasi ini agar dependensi atau tools yang kita butuhkan tersedia di awal serta memudahkan administrasi linux.
:::

## Setting Hostname
Agar hostname server mudah dikenali dan diatur dengan benar dalam DNS / identifikasi jaringan. Selain itu jika Anda ingin menggunakan server ini untuk layanan web hosting seperti kontrol panel cPanel, Plesk, dan sebagainya biasanya diwajibkan untuk mengeset hostname FQDN dan juga PTR/rDNS terpointing pada server ini.
```
hostnamectl set-hostname web1.focusnic.com
```
## Update dan Install Paket Dasar
Berikut adalah update server dan juga instalasi paket dasar untuk keperluan administrasi linux
```
dnf update -y && dnf install epel-release -y
dnf update -y && dnf -y install git traceroute nmap bash-completion bc bmon bzip2 curl dmidecode ethtool htop ifstat iftop iotop make multitail nano bind-utils net-tools rsync screen sudo tree unzip wget yum-utils zip zlib-devel tar screen dnf-plugins-core sysstat
```

Berikut adalah paket yang akan diinstall

| **Paket**          | **Fungsi**                                                                              |
| ------------------ | ------------------------------------------------------------------------------------- |
| `git`              | Sistem kontrol versi (version control), umum untuk mengelola source code.             |
| `traceroute`       | Menelusuri rute (hop) jaringan dari host ke tujuan.                                   |
| `nmap`             | Scanner jaringan dan port.                                                            |
| `bash-completion`  | Menambahkan auto-complete (tab completion) untuk perintah di shell Bash.              |
| `bc`               | Kalkulator command line yang mendukung operasi aritmatika kompleks.                   |
| `bmon`             | Monitoring bandwidth secara real-time per interface.                                  |
| `bzip2`            | Utilitas kompresi file.                                                               |
| `curl`             | Alat untuk mentransfer data dari/ke server menggunakan protokol URL (HTTP, FTP, dll). |
| `dmidecode`        | Menampilkan informasi hardware dari BIOS (seperti CPU, RAM, motherboard).             |
| `ethtool`          | Digunakan untuk mengatur atau memeriksa pengaturan NIC (Network Interface Card).      |
| `htop`             | Versi interaktif dari `top`, menampilkan proses secara visual.                        |
| `ifstat`           | Menampilkan statistik jaringan secara real-time.                                      |
| `iftop`            | Menampilkan penggunaan bandwidth antar IP secara real-time.                           |
| `iotop`            | Melacak aktivitas disk I/O oleh proses.                                               |
| `make`             | Utilitas untuk membangun dan mengelola project (umum dalam kompilasi kode).           |
| `multitail`        | Menampilkan dan mengikuti beberapa file log secara bersamaan di terminal.             |
| `nano`             | Editor teks sederhana di terminal.                                                    |
| `bind-utils`       | Berisi alat DNS seperti `dig`, `host`, dan `nslookup`.                                |
| `net-tools`        | Kumpulan utilitas jaringan klasik (`ifconfig`, `netstat`, dll).                       |
| `rsync`            | Alat untuk sinkronisasi file antar lokasi/sistem.                                     |
| `screen`           | Menjalankan sesi shell terpisah yang dapat dilanjutkan setelah logout.                |
| `sudo`             | Menjalankan perintah sebagai user lain (biasanya root).                               |
| `tree`             | Menampilkan struktur direktori dalam bentuk tree style.                               |
| `unzip`            | Mengekstrak file `.zip`.                                                              |
| `wget`             | Mendownload file dari internet melalui HTTP/HTTPS/FTP.                                |
| `yum-utils`        | Kumpulan utilitas tambahan untuk manajemen paket dengan DNF/YUM.                      |
| `zip`              | Membuat file archive dalam format `.zip`.                                             |
| `zlib-devel`       | Library dan header untuk kompresi data (dibutuhkan saat compile program).             |
| `tar`              | Utilitas arsip (archive) file/folder.                                                 |
| `dnf-plugins-core` | Plugin tambahan untuk DNF (seperti `dnf config-manager`).                             |
| `sysstat`          | Kumpulan alat pemantauan sistem (`iostat`, `mpstat`, `pidstat`, dll).                 |

## Setting Timezone
Sinkronisasi waktu. Hal ini sangat berguna untuk sistem atau aplikasi yang akan di hosting pada server ini. Selain itu berguna untuk melihat log, dan juga sinkronisasi waktu
```
timedatectl set-timezone Asia/Jakarta
```
Pastikan outputnya seperti ini dan juga parameter `System clock synchronized: yes`
```jsx showLineNumbers
               Local time: Wed 2025-07-02 21:25:45 WIB
           Universal time: Wed 2025-07-02 14:25:45 UTC
                 RTC time: Wed 2025-07-02 14:25:45
                Time zone: Asia/Jakarta (WIB, +0700)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```
Jika `System clock synchronized: no` silahkan install `chony`
```
dnf install chrony
systemctl enable --now chronyd
timedatectl set-timezone Asia/Jakarta
```

Jika semua sudah di set, maka silahkan reboot server
```
reboot -h now
```
