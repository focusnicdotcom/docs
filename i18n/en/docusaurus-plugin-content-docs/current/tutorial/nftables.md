---
title: nftables
description: Tutorial for Configuring nftables on Linux
sidebar_position: 106
sidebar_label: nftables
---

`nftables` is a modern firewall framework developed by the Netfilter team (same as `iptables`) and is starting to replace:

- `iptables`
- `ip6tables`
- `arptables`
- `ebtables`

`nftables` is designed for:

- Faster and more efficient
- More consistent for IPv4 and IPv6
- More flexible and easy to manage
- Using only **1 main tool:** `nft`

## Basic Concepts of nftables
`nftables` is based on the following hierarchical structure:

| Term | Function |
| --- | --- |
| **Table** | Holds chains and rules (default: `inet`, `ip`, `ip6`) |
| **Chain** | Set of rules based on events (input, output, forward, etc) |
| **Rule** | Specific rules applied (allow, deny, etc) |

The nftables family is a group of protocols that define how nftables processes packets. Here is a list of available families and their functions:

| Family | Protocols Supported | Used For |
| --- | --- | --- |
| `ip` | IPv4 | Filter & NAT for IPv4 |
| `ip6` | IPv6 | Filter & NAT for IPv6 |
| `inet` | IPv4 and IPv6 (combined) | **Generally used and recommended** |
| `arp` | ARP | Filtering ARP packets |
| `bridge` | Ethernet Bridge (Layer 2) | Filtering between bridges |
| `netdev` | Interface level (raw packets) | Early packet filtering, no hooks |

Explanation of `nftables` family:
- `ip` is IPv4 specific and is equivalent to `iptables` or `iptables -4`. Example `nft add table ip mytable`
- `ip6` is specific to IPv6 and is equivalent to `ip6tables`. Example `nft add table ip6 mytable`
- `inet` supports IPv4 and IPv6 simultaneously and is highly recommended. Example `nft add table inet mytable`
- `arp` is used for ARP (Address Resolution Protocol) filtering and is used in advanced Layer 2 environments
- `bridge` is used for packet filtering on Ethernet bridges (br0, etc.). Useful in systems that use bridges between VMs or containers
- `netdev` is at the interface level and is suitable for lightweight firewalls or DDoS filters

### Tables

- A table is the main container that contains a collection of chains.
- Each table operates in **one protocol family**:
    - `ip` = IPv4
    - `ip6` = IPv6
    - `inet` = combined `ip` and `ip6` (commonly used)
    - `arp`, `bridge`, `netdev` = for special cases

Example:
```
nft add table inet mytable
```

### Chains
- Chain contains a collection of `rules`.
- Chains can be:
    - **Hooked**: connected to the kernel (e.g. for INPUT/OUTPUT/FORWARD)
    - **Regular**: not automatically called, but can be called by other rules (such as functions)

The main hook used:
| Hook | Function |
| --- | --- |
| `prerouting` | When packets first come in (used in NAT) |
| `input` | For packets **going to the local system** (server receives data) |
| `forward` | For packets **passing the system** (router) |
| `output` | For packets **exiting the local system** |
| `postrouting` | Before packets exit the network (typically for SNAT) |

Example:
```
nft add chain inet mytable input_chain { type filter hook input priority 0 \; }
```

### Rules
- Rules specify actions on matching packets.
- Placed in the chain.
- Can be:
    - **match** (match condition)
    - **action** (accept, reject, log, redirect, etc.)

Example:
```
nft add rule inet mytable input_chain ip saddr 192.168.1.100 tcp dport 22 accept
```

The above rule means: if the packet comes from IP 192.168.1.100 and goes to port 22, then allow (accept).

### Flow on nftables
The following is for incoming packet flow (from outside to the server):
```
[ Incoming Packets ]
      ↓
+--------------------+
| Kernel Networking  |
+--------------------+
      ↓
[ Hook: prerouting ] →  for NAT etc.
      ↓
[ Hook: input ] → for incoming packets to the server (ssh, web, etc.)
      ↓
[ Rule matching on chain input ]
      ↓
  (accept / drop / reject)
```

The following is for the outgoing packet flow (from the server to the outside):
```
[ Hook: output ]
      ↓
[ Hook: postrouting ] → NAT src, masquerade, dll
```

Explanation:

**1. Packets enter the network system (Kernel)**:
- All network traffic, whether entering, leaving, or passing through the system, will go through the **Linux network stack**.
- `nftables` will **filter these packets at various points (hooks)**, depending on the type of chain.

**2. Enter the `nftables` Table and the Chain connected to the Hook**
Each incoming packet will be directed to a specific **chain based on its hook**. This chain must be inside a `table`, and have a definition like:
```
type filter hook input priority 0
```

**3. Processed by Rule in order in the Chain**

- Chain consists of **rules**.
- Each rule has **conditions (match)** and **actions (action)**.
- Evaluation is done **in order from top to bottom**.
- Once the condition matches, the action is performed:
    - `accept`, `drop`, `reject`, `jump`, `log`, etc.
- If nothing matches and there is no default action, then the package is implicitly rejected.

## Preparation

Some Linux distributions have adopted `nftables` as the default packet filtering framework, replacing iptables. These include Red Hat Enterprise Linux 8 and later, Rocky Linux, and Debian 11 and later.

Check the `nftables` version with the following command:
```
nft -v
```
Sample ouput:
```
nftables v1.0.4 (Lester Gooch #3)
```
If `nftables` is not installed please run the following command to install:
```
# Redhat distribution
dnf install nftables
systemctl enable --now nftables
systemctl status nftables
# Debian distribution
apt install nftables
systemctl enable --now nftables
systemctl status nftables
```

If using `firewalld` or `iptables` please disable it to avoid conflict with `nftables`:
```
systemctl stop iptables firewalld
systemctl disable iptables firewalld
systemctl mask iptables firewalld
```
## Configuring nftables

Here is a complete and systematic guide on how to use nftables to create tables, chains, and rules in `nftables`.
:::info
`nftables` does not support replacing parameters in tables, chains, or rules directly. The solution is to re-create or delete the item and then recreate it.
:::

View all tables:
```
nft list tables
```
View all rulesets:
```
nft list ruleset
```

### Tables
The function of tables in `iptables` is to be the parent or container for chains and rules.

Create a table:
```
nft add table inet mytable
```
- `inet` → supports IPv4 & IPv6 (commonly used)
- `mytable` → table name

Verify the table
```
nft list tables
```
Sample output:
```
table inet mytable
```
Delete a table:
```
nft delete table inet mytable
```
Delete/flush rules inside table:
```
nft flush table inet mytable
````
### Chains
The chain function of `nftables` is to hold rules, and is connected to hooks such as `input`, `output`, etc.

Create a chain:
```
nft add chain inet mytable input_chain { type filter hook input priority 0\; policy drop\; }
```
- `type filter` → chain type
- `hook input` → handle incoming traffic
- `priority 0` → execution order
- `policy drop` → default action if no rule matches

Check the chain list in the table:
```
nft list table inet mytable
```
Sample output:
```
table inet mytable {
        chain input_chain {
                type filter hook input priority filter; policy drop;
        }
}
```
Deleting a chain. Make sure the chain is empty (no rules) before deleting:
```
nft delete chain inet mytable input_chain
```
Delete/flush rules in the table:
```
nft flush chain inet mytable input_chain
````
### Rules
Rules on `nftables` are for processing packets such as: accept, drop, log, etc.

Add a rule. Example rule to allow SSH (port 22):
```
nft add rule inet mytable input_chain tcp dport 22 accept
```
Verify:
```
nft list chain inet mytable input_chain
```
Sample output:
```
table inet mytable {
        chain input_chain {
                type filter hook input priority filter; policy drop;
                tcp dport 22 accept
        }
}
```
Verify ruleset list with numbering format:
```
nft -a list ruleset
```
Or:
```
nft -a list chain inet table_name chain_name
nft -a list chain inet mytable input
```
Sample output:
```
table inet myfilter { # handle 7
        chain input { # handle 1
                type filter hook input priority filter; policy drop;
                ct state established,related accept # handle 3
                tcp dport 22 accept # handle 13
                iif "lo" accept # handle 4
                ip protocol icmp accept # handle 5
                udp dport 53 accept # handle 8
                tcp dport 50000-51000 accept # handle 9
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003 } accept # handle 12
        }

        chain forward { # handle 2
                type filter hook forward priority filter; policy drop;
        }
}
```
Delete rules based on number handler:
```
nft delete rule inet mytable input handle number
nft delete rule inet mytable input handle 12
```
Change the order of the rules. Here's an example of the current rule:
```
table inet myfilter { # handle 7
        chain input { # handle 1
                type filter hook input priority filter; policy drop;
                ct state established,related accept # handle 3
                iif "lo" accept # handle 4
                ip protocol icmp accept # handle 5
                udp dport 53 accept # handle 8
                tcp dport 50000-51000 accept # handle 9
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003 } accept # handle 12
        }

        chain forward { # handle 2
                type filter hook forward priority filter; policy drop;
        }
}
```
For example, to add a new rule to the 3rd order position, here's how:
```
nft add rule inet myfilter input  position 3 tcp dport 22 accept 
```
Here's an example of the output:
```
table inet myfilter { # handle 7
        chain input { # handle 1
                type filter hook input priority filter; policy drop;
                ct state established,related accept # handle 3
                tcp dport 22 accept # handle 13
                iif "lo" accept # handle 4
                ip protocol icmp accept # handle 5
                udp dport 53 accept # handle 8
                tcp dport 50000-51000 accept # handle 9
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003 } accept # handle 12
        }

        chain forward { # handle 2
                type filter hook forward priority filter; policy drop;
        }
}
```
The rule appears in the 3rd position, but the handle remains 13, and this is completely normal behavior and by design in nftables. To summarize as follows:
- `position` determines the **order of rule execution in the chain**.
- The `handle` is a **permanently unique number assigned by the kernel when the rule is created**, and is **never based on position**.

### Save Configuration
If using `nftables.service` the configuration is automatically saved permanently. Please check with the following command if the `nftables` service is already installed
```
systemctl status nftables
```
Sample output:
```
● nftables.service - Netfilter Tables
   Loaded: loaded (/usr/lib/systemd/system/nftables.service; enabled; vendor preset: disabled)
   Active: active (exited) since Mon 2025-07-07 22:37:07 WIB; 3min 2s ago
...
..
.
```
Then, when it is active please run the following command every time you make changes to `nftables`.

Run the following command for Redhat distribution:
```
nft list ruleset >/etc/sysconfig/nftables.conf
```
Run the following command for a Debian distribution:
```
nft list ruleset > /etc/nftables.conf
```

With the above configuration, the nftables configuration will remain persistent (unchanged) when the server is rebooted.
### Presets
Here are the `nftables` configuration presets for easier management, this configuration uses the default DROP preset. The *default drop* policy on the firewall means that all network traffic that is not explicitly allowed by the firewall rules will be denied or discarded. This is a commonly used approach to improve network security.


Presets for common web servers (HTTP, Email, SSH, FTP, and DNS):
```
# 1. Flush the ruleset (table, chains, and rules) first to make it clean
nft flush ruleset

# 2. Create a new table with inet family (IPv4 & IPv6)
nft add table inet myfilter

# 3. Create input chain (input hook)
nft add chain inet myfilter input {type filter hook input priority 0\; policy drop\;}

# 4. Create a chain forward (also drop)
nft add chain inet myfilter forward {type filter hook forward priority 0\; policy drop\;}

# 5. Allow established/related connections
nft add rule inet myfilter input ct state established,related accept

# 6. Allow loopback interfaces
nft add rule inet myfilter input iif lo accept

# 7. Allow ICMP (ping)
nft add rule inet myfilter input ip protocol icmp accept

# 8. Allow TCP connections to multiple ports at once
nft add rule inet myfilter input tcp dport {21, 22, 25, 53, 80, 443, 465, 5222, 5269, 5280, 8999-9003} accept

# 9. Allow UDP connections to port 53 (DNS)
nft add rule inet myfilter input udp dport 53 accept

# 10. FTP passive data port range (50000-51000)
nft add rule inet myfilter input tcp dport 50000-51000 accept
```
Verify:
```
nft list ruleset
```
Sample output:
```
table inet myfilter {
        chain input {
                type filter hook input priority filter; policy drop;
                ct state established,related accept
                iif "lo" accept
                ip protocol icmp accept
                tcp dport { 21-22, 25, 53, 80, 443, 465, 5269, 5280, 5522, 8999-9003 } accept
                udp dport 53 accept
                tcp dport 50000-51000 accept
        }

        chain forward {
                type filter hook forward priority filter; policy drop;
        }
}
```
Then save the configuration:
```
# Run the following command for the Redhat distribution:
nft list ruleset >/etc/sysconfig/nftables.conf

# Run the following command for the Debian distribution:
nft list ruleset > /etc/nftables.conf
```

If you want to whitelist a specific IP to access SSH, then make sure all the rules are added beforehand and the key is not to put the port into `nftables` without IP. Here's how to whitelist SSH with IP:
```
nft add rule inet myfilter input ip saddr 192.168.167.12 tcp dport 22 accept
```
Verify:
```
nft list ruleset
```
Sample output:
```
table inet myfilter {
        chain input {
                type filter hook input priority filter; policy drop;
                ip saddr 192.168.167.12 tcp dport 22 accept
        }
}
```
Allow IP to access the server:
```
nft add rule inet myfilter input ip saddr 192.168.167.12 accept
```

Block IPs suspected of DDoS:
```
nft add rule inet myfilter input ip saddr 192.168.167.12 drop
```

TCP/UDP block, e.g. attacker scans or floods port
```
nft add rule inet myfilter input ip saddr 192.168.167.12 ip protocol tcp drop
nft add rule inet myfilter input ip saddr 192.168.167.12 ip protocol udp drop
```
