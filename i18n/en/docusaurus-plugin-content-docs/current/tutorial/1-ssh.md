---
title: SSH
description: SSH Tutorial and Configuration on Linux Server
sidebar_position: 100
sidebar_label: SSH
---

SSH (Secure Shell) is a network protocol used to remotely and securely access and manage servers. SSH encrypts the communication between client and server, replacing older protocols such as Telnet and Rlogin.

## Basic SSH Configuration
:::info
If you are using operating systems like Redhat and its derivatives, or AlmaLinux or RockyLinux, then make sure SELinux is either `Permissive` or `Disabled`. Or run the following command to check `getenforce` if the output is `Enforcing` then please disable it temporarily using the following command `setenforce 0`.
:::
Edit the SSH main configuration file
```
nano /etc/ssh/sshd_config
```
Fill in the parameters at the bottom
```jsx showLineNumbers title="/etc/ssh/sshd_config"
Port 22                     # Change if you want to use a custom port (eg 2222)
PermitRootLogin yes          # It is recommended for security to change to "no"
PasswordAuthentication yes  # You can change it to "no" if you only want key-based login.
```
Then the recommendation if using a VPS without a firewall from the cloud platform, or there is no firewall on the server, you can add the following parameters to allow `root` to only log in via the IP in this list. Please add and change according to the IP you want to use
:::info
When you apply this parameter, the assumption is that the IP is static.
:::

```jsx showLineNumbers title="/etc/ssh/sshd_config"
# Office IP
AllowUsers root@192.168.1.0/28,192.168.23.4
# Tunnel
AllowUsers root@192.168.1.115,192.168.3.113,192.163.1.3
```

## Generate SSH Key
This is very useful when a `server-client` or `client-server` wants to communicate without a password. In this example I show it on `server-client`. Please run this command on the server to generate the `private key` and `public key`
```
ssh-keygen
```
Then copy the `public key` to the client using the following command, then enter the client password
```
ssh-copy-id root@$IP_ADDRESS_CLIENT
```
To verify from server to client run the following command, if you don't see a password prompt then the configuration is correct
```
ssh root@$IP_ADDRESS_CLIENT
```
However, in some situations, you or your colleagues may only have the `public key` from the client or server side, and need to send it manually. For example, in the
scenario where we want to remote to a client's server, the first step is to create an SSH key on our side, and then send the public key to the client to be stored on their server.

Now let's assume you have the pre-generated `public key`, and it's time to execute it on the destination client/server side.

:::info
This configuration is entirely done on the client side assuming we only have the `public key`. The location of the `public key` is usually in the user's home directory or in `~/.ssh/id_rsa.pub`.
:::
Please check or create the following file if it does not exist. Then fill it with the `public key` file obtained earlier
```
nano ~/.ssh/authorized_keys
```
If so, change the permission as follows
```
chmod 0600 ~/.ssh/authorized_keys
```
Then after adding the `public key` to the client device, then the server that has the `private key` can remote this client.
## Port Forwarding
### Local Forwarding
Forward local ports to remote (local forwarding). Forwards ports from a local computer to a remote server. Suitable for accessing internal services of remote servers that are not exposed to the public. Example: You have a server `192.168.100.10` running a web application on port `80`, but port `80` can only be accessed from the server's `localhost` (not directly from the internet).
:::info
If you are using Windows Desktop, then please use PuTTY go to the `Connection > SSH > Tunnels` tab and fill in `Source Port: 8080` and `Destination: localhost:80` then
 click `Add`. Then return to the `Session` tab please fill in the IP and port of the server then login, if the login is successful please access the resources on the server on port `80` through port `8080` on your Windows Desktop.
:::
```
ssh -L 8080:localhost:80 user@remote-server
```

- `8080`: local port on your laptop.

- `localhost:80`: forwarding destination inside the server.

- `user@192.168.100.10`: SSH login to the target server.

Now you can open a browser on your laptop: `http://localhost:8080`. You will see a web view of `http://localhost` on server `192.168.100.10`.
### Remote Forwarding
Forwards the port from the server computer to the SSH client. Suitable for when you want to open access to services on your local computer through the server. Your local computer (client).
```
ssh -R 8080:localhost:3000 user@remote-server.com
```

- `8080`: The port that is open on the remote server.

- `localhost:3000`: Service that runs on the local computer (SSH client).

- `user@remote-server.com`: SSH to the remote server.

On the remote server, anyone accessing: `http://localhost:8080` will be redirected to the web application running at `localhost:3000` on your computer. Make sure `GatewayPorts yes` is set on the remote server if it is to be accessed from outside `localhost`.
## Finish Config
:::info
Make sure to keep the SSH session open while changing the configuration. If something goes wrong, you can still cancel or adjust the configuration before the connection is lost.
:::

To save the changes and apply the changes please restart SSH.
```
systemctl restart sshd
```
Check SSH status
```
systemctl status sshd
```
