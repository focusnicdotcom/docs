---
title: SWAP
description: Tutorial dan Konfigurasi SWAP di Linux
sidebar_position: 102
sidebar_label: SWAP
---

Swap adalah ruang penyimpanan tambahan di sistem Linux yang digunakan sebagai **memori virtual** ketika kapasitas **RAM fisik** telah habis. Swap dapat berupa partisi khusus ataupun file swap, dan berfungsi sebagai cadangan memori yang memungkinkan sistem tetap berjalan meskipun beban memori meningkat.

Meskipun swap jauh lebih lambat dibandingkan RAM, keberadaannya sangat penting dalam situasi berikut:

- Menangani beban memori tinggi saat RAM penuh.

- Menyediakan ruang cadangan untuk proses background atau idle.

- Mencegah aplikasi crash karena kehabisan memori.

- Mendukung fitur **hibernasi** (jika digunakan).

Pada server produksi, swap yang dikonfigurasi dengan benar dapat meningkatkan **stabilitas sistem**, namun harus digunakan secara bijak karena swap di atas disk (terutama HDD) memiliki kecepatan read/write yang jauh lebih lambat daripada RAM.

## Cek Swap
Sebelum melakukan konfigurasi swap seperti menambah, menghapus, atau membuat swap maka sebaiknya cek terlebih dahulu.<br/>
Cara 1:
```
swapon --show
```
Jika swap aktif, Anda akan melihat output seperti ini. Jika tidak aktif, tidak akan ada output:
```
Filename                                Type            Size    Used    Priority
/dev/dm-1                               partition       4194300 0       -2
```
Cara 2:
```
free -h
```
Contoh output:
```
              total        used        free      shared  buff/cache   available
Mem:          1.7Gi       178Mi       1.1Gi       8.0Mi       448Mi       1.4Gi
Swap:            0B          0B          0B
```
Baris `Swap:` menunjukkan ukuran dan penggunaan swap. Apabila valuenya `0` maka dipastikan belum ada swap. <br/>
## Membuat SWAP File
Buat swap sebesar 2x total RAM, misalnya RAM saat ini 2GB maka swap dibuat 4GB
```
fallocate -l 4G /swap
```

Sesuaikan permission `0600` untuk alasan keamanan
```
chmod 0600 /swap
```

Buat swap
```
mkswap /swap
```

Aktifkan swap
```
swapon /swap
```

Kemudian verifikasi
```
swapon --show
```
Contoh output:
```
NAME  TYPE SIZE USED PRIO
/swap file   4G   0B   -2
```

Aktifkan swap secara permanent saat reboot
```
echo '/swap none swap sw 0 0' >> /etc/fstab
```

Verifikasi:
```
cat /etc/fstab
```
## Menambah Ukuran Swap
:::info
Diasumsikan bahwa swap sudah dibuat sebelumnya dengan swapfile `/swap`.
:::
Matikan swap saat ini dan hapus file swap:
```
swapoff /swap
rm -rf /swap
```

Buat ulang swap dengan ukuran baru misalnya 6GB:
```
fallocate -l 6G /swap
chmod 0600 /swap
mkswap /swap
swapon /swap
```
Aktifkan swap secara permanent saat reboot
```
echo '/swap none swap sw 0 0' >> /etc/fstab
```
## Disable dan Hapus Swap Sepenuhnya
```
swapoff /swap
sed -i '/\/swapfile/d' /etc/fstab
rm -f /swap
```

Verifikasi:
```
swapon --show
cat /etc/fstab
```
## Swappiness
Swappiness adalah parameter di kernel Linux yang menentukan seberapa agresif sistem menggunakan swap saat RAM mulai penuh. Nilai ini mempengaruhi keputusan sistem apakah akan menyimpan data di RAM atau memindahkannya ke swap (memori virtual di disk).

| Nilai | Arti                                                            |
| ----- | --------------------------------------------------------------- |
| `0`   | Gunakan swap hanya jika RAM benar-benar habis.                  |
| `10`  | Gunakan RAM sebanyak mungkin, swap hanya saat mendesak.         |
| `60`  | Default di banyak distro – seimbang antara RAM dan swap.        |
| `100` | Gunakan swap sesegera mungkin, seolah-olah RAM dan swap setara. |

### Cara Cek dan Konfigurasi Swappiness

Cek nilai saat ini:
```
cat /proc/sys/vm/swappiness
```
Ubah sementara hingga reboot berikutnya:
```
sysctl vm.swappiness=10
```
Ubah permanen dan terapkan konfigurasi. `syctl -p` menerapkan setting langsung tanpa reboot:
```
echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl -p
```
Verifikasi setelah reload konfigurasi `sysctl` dan ouput harus menunjukkan nilai `10`

## Flush Cache RAM
Linux secara otomatis menyimpan cache dari file, disk, dan inode yang sering digunakan ke dalam RAM. Cache ini bersifat "digunakan kalau perlu" dan tidak langsung dikosongkan meskipun aplikasi sudah tidak membutuhkan datanya. Dengan drop cache, Anda memaksa sistem membuang cache tersebut untuk membebaskan RAM.

:::info
Tidak disarankan menjalankan ini secara berkala di server produksi, karena cache membantu meningkatkan performa. Menghapus cache terlalu sering justru bisa menurunkan performa (semua proses harus akses ulang ke disk).
:::

Jalankan perintah berikut:
```
sync; echo 1 > /proc/sys/vm/drop_caches && /sbin/swapoff -a && /sbin/swapon -a
```

Buat skrip otomasi untuk menjalankan flush ram ini via cron job:
```
nano /root/flush-cache.sh
```
Isi skrip:
```jsx showLineNumbers title="/root/flush-cache.sh"
#!/bin/bash
sync; echo 1 > /proc/sys/vm/drop_caches && /sbin/swapoff -a && /sbin/swapon -a
echo "[ $(date) ] Cache & swap flushed" >> /var/log/flush-cache.log
```
Set permission:
```
chmod +x /root/flush-cache.sh
```
Lalu tambahkan ke Cron:
```
crontab -e
```
Tambahkan parameter berikut untuk menjalankan skrip setiap hari pukul 02:00 dini hari:
```jsx showLineNumbers
0 2 * * * /root/flush-cache.sh
```
Cek Log:
```
cat /var/log/flush-memory.log
```
Contoh output:
```jsx showLineNumbers title="/var/log/flush-memory.log"
[ Thu Jul  3 09:02:18 PM WIB 2025 ] Cache & swap flushed
```
