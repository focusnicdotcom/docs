---
title: Cara Install OS AlmaLinux 8
description: Tutorial Cara Install OS AlmaLinux 8
sidebar_position: 1
sidebar_label: Cara Install OS AlmaLinux 8
---

## Download OS AlmaLinux 8
Berikut adalah list repository mirror AlmaLinux:

Server Indonesia:
* Citrahost: mirror.citrahost.com
* DomaiNesia: linux.domainesia.com
* NevaCloud: mirror.nevacloud.com
* Jagoanhosting: vpsmurah.jagoanhosting.com

Server Singapore:
* SG.GS: mirror.sg.gs
* Neo Soon Keat: mirror.soonkeat.sg
* Jingkai Tan: mirror.jingk.ai

Server US:
* Phoenixnap: almamirror.phoenixnap.com
* Leaseweb: mirror.sfo12.us.leaseweb.net
* MIRhosting: mirror.us.mirhosting.net
* xTom: mirrors.xtom.com

Untuk lokasi lainnya bisa di cek pada website resmi AlmaLinux berikut https://mirrors.almalinux.org/

## Install AlmaLinux mode GUI

Jika muncul tampilan seperti ini silahkan pilih `Install AlmaLinux 8.10`

![](/img/almalinux-1.jpg)

Langkah berikutnya adalah memilih bahasa, karena saya terbiasa menggunakan bahasa inggris maka saya pilih `English (United States)` yang juga merupakan pilihan default

![](/img/almalinux-2.jpg)

Berikut adalah tampilan instalasi mode GUI pada AlmaLinux. Meskipun tampilan GUI, saya akan menggunakan mode `Minimal Install` karena tidak memerlukan tampilan grafis GUI untuk server. Ketika melakukan instalasi AlmaLinux pertama kali yang saya lakukan adalah mengeset Timezone, Installation Destination, Network, dan Password Root

![](/img/almalinux-3.jpg)

Untuk timezone saya menggunakan `Region: Asia` dan `City: Jakarta` lalu klik `Done`

![](/img/almalinux-4.jpg)

Berikutnya adalah setting disk location, Anda bisa memilih mode `Automatic` namun kali ini saya aka menggunakan mode `Custom` dan mengatur layout partisi agar lebih mudah di kelola

![](/img/almalinux-5.jpg)

Partisi pertama yang akan saya tambahkan adalah `/boot` sebesar 1GB

![](/img/almalinux-6.jpg)

Partisi berikutnya adalah `swap` sebanyak 2x RAM. Karena RAM saat ini hanya 2GB maka saya akan menambah ukuran `swap` sebanyak 2x yaitu 4GB

![](/img/almalinux-7.jpg)

Kemudian partisi terakhir adalah `root` atau `/` akan saya berikan semua sisa disk ke partisi ini

:::info INFO

Anda tidak perlu mendefinisikan size pada partisi root karena Anda mengosongkan opsi ini maka secara otomatis semua sisa disk yang available akan dialokasikan

:::

![](/img/almalinux-8.jpg)

Berikut adalah layout partisi yang sudah dibuat dan akan digunakan. Dengan menggunakan layout model seperti ini akan sangat mudah ketika melakukan resize `root` setelah selesai konfigurasi klik `Done` lalu akan muncul popup konfirmasi untuk format disk, silahkan klik `Accept Changes`

![](/img/almalinux-9.jpg)

Langkah berikutnya adalah menambahkan network, untuk Automatic DHCP seperti berikut

![](/img/almalinux-10.jpg)

Jika Anda ingin menggunakan static maka konfigurasi seperti berikut, silahkan sesuaikan IP, Netmask/Prefix, Gateway, serta DNS server

![](/img/almalinux-11.jpg)

Kemudian set password `root`

![](/img/almalinux-12.jpg)

Setelah semua selesai di konfigurasi, langkah terakhir adalah review lalu klik `Begin Installation`

![](/img/almalinux-13.jpg)

Tunggu instalasi hingga selesai, lalu klik `Reboot System`

![](/img/almalinux-14.jpg)

## Install AlmaLinux mode CLI  (Text Based)

Tekan `TAB` pada saat instalasi seperti ini

![](/img/almalinux-cli-1.jpg)

kemudian tambahkan parameter `inst.text` lalu tekan `ENTER` pada keyboard untuk memulai instalasi

![](/img/almalinux-cli-2.jpg)

Berikut adalah tampilan installer menggunakan mode CLI. Silahkan perhatikan simbol tanda seru (!) itu adalah simbol yang harus dikonfigurasi

![](/img/almalinux-cli-3.jpg)

Setting Timezone, pilih angka `2` pada menu installer. Lalu pilih Timezone `Asia`

![](/img/almalinux-cli-4.jpg)

Kemudian set region ke `Jakarta` dan tekan `ENTER` untuk melanjutkan proses konfigurasi

![](/img/almalinux-cli-5.jpg)

Langkah selanjutnya adalah setup partisi, karena CLI cukup terbatas pada kali ini langsung akan mempartisi mode LVM. Silahkan tekan angka `5` pada keyboard

![](/img/almalinux-cli-6.jpg)

Langkah selanjutnya adalah konfigurasi network, tekan angka `7` pada keyboard untuk konfigurasi network. Anda bisa memilih konfigurasi STATIC atau DHCP, atau jika anda bingung bisa konfigurasi nanti pada saat sudah terinstall

![](/img/almalinux-cli-7.jpg)

Set static IP&#x20;

![](/img/almalinux-cli-8.jpg)

Kemudian set netmask

![](/img/almalinux-cli-9.jpg)

Lalu set gateway

![](/img/almalinux-cli-10.jpg)

Kemudian set DNS server, lalu tekan `c` pada keyboard untuk menyelesaikan konfigurasi network

![](/img/almalinux-cli-11.jpg)

Set root password, silahkan tekan angka `8` pada keyboard

![](/img/almalinux-cli-12.jpg)

Jika sudah proses setup silahkan tekan huruf `b` pada keyboard untuk melanjutkan instalasi. Tunggu proses instalasi lalu tekan `E` untuk boot ke system almalinux

![](/img/almalinux-cli-13.jpg)

## Tips Instalasi AlmaLinux via Remote

Catatan ini ditulis ketika instalasi AlmaLinux melalui remote menggunakan IDRAC, iLO, IPMI, atau semacamnya. Singkat cerita ketika kita ingin instalasi AlmaLinux akan terasa nyaman dan mudah menggunakan mode GUI dan juga kita bisa menge-set disk layout menggunakan RAID Software (mdadm).&#x20;

Sayangnya, dalam beberapa situasi, instalasi remote seperti ini sering mengalami kendala, terutama pada koneksi dari klien ke server saat mengupload file ISO. Hal ini bisa disebabkan oleh kecepatan jaringan yang sangat lambat. Pada mekanisme instalasi AlmaLinux, terdapat pengaturan timeout yang penting untuk diperhatikan. Secara default, proses inisialisasi image AlmaLinux memiliki batas waktu sekitar 60 detik. Jika proses inisalisasi image melebihi waktu ini, AlmaLinux akan secara otomatis beralih ke mode instalasi Command Line Interface (CLI) atau Text Based. Langkah ini diambil untuk menghindari risiko kegagalan instalasi, dengan pertimbangan bahwa koneksi yang lambat dapat menyebabkan masalah lebih lanjut dalam proses instalasi.&#x20;

Kali ini, saya akan membahas dua parameter penting yang dapat digunakan untuk meningkatkan pengalaman instalasi. Pertama, kita akan meningkatkan pengaturan timeout.&#x20;

Kedua, kita akan menerapkan mekanisme untuk memuat image sementara ke dalam RAM sebelum memulai proses instalasi. Dengan cara ini, kita dapat mempercepat akses ke file instalasi, sehingga mengurangi ketergantungan pada kecepatan network selama proses instalasi. Kombinasi dari kedua pendekatan ini bertujuan untuk meningkatkan keberhasilan dan efisiensi instalasi, memastikan bahwa pengguna dapat menyelesaikan proses dengan lebih lancar dan tanpa kendala.



Ketika Anda pertama kali booting, silahkan tekan `TAB` pada keyboard untuk menambahkan parameter `x.xtimeout` dan `rd.live.ram` setelah parameter `quiet` seperti berikut:

```
linuxefi ... quiet ... ins.xtimeout=3000 rd.live.ram
```

Hasilnya seperti ini:

![](/img/almalinux-tips-cli.jpg)

Setelah itu Anda booting, lalu tunggu hingga server mendownload image dan load ke RAM.
