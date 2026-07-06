# UEFI and How Computers Boot

Now let's see what UEFI is, where it sits in the boot process, and why is it better than the

older **BIOS** boot

### First, let's understand how computers boot

The overall flow of how a computer boots is as follows

![](assets/20260706_221746_boot_process.png)

In this diagram, you can see the flow of the boot process.

As soon as the power is turned on, a special software stored in non volatile storage in the motherboard, starts running.

This software is generally called **Firmware**.

The job of the firmware is varied but in the scope of this documentation, it can be assumed, its job as helping the OS boot.

This is where **our guy UEFI** and his elder brother **BIOS** come into picture. Let's explore how these firmware specifications help us boot an OS.
