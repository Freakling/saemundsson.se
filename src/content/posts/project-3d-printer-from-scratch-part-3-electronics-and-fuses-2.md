---
title: "Project: 3D Printer from scratch. Part 3  –  Electronics, issues and blowing fuses"
date: 2014-03-04T16:19:04+01:00
modified: 2022-08-11T16:33:32+01:00
slug: project-3d-printer-from-scratch-part-3-electronics-and-fuses-2
permalink: /2014/03/04/project-3d-printer-from-scratch-part-3-electronics-and-fuses-2/
wpId: 382
description: The last parts were delivered from ebay on the 3rd of march. This took a bit longer than usual as I managed to order during the chinese new year. With all the parts at hand i decided to start building, while the paint on the frame dries I started working on the electronics. I converted
categories:
  - 3dprinter
  - uncategorized
tags:
  - 3dprinter
author: freakling
---

The last parts were delivered from ebay on the 3rd of march. This took a bit longer than usual as I managed to order during the chinese new year.

With all the parts at hand i decided to start building, while the paint on the frame dries I started working on the electronics.

I converted a old Corsair cx430 to work with the printer. At 12v and 430W the supply can output about 35 amps which is more than enough.  
Here is a picture of the Mega 2560+RAMPS 1.4 with 5 stepper drivers mounted, 5 motors connected and the hotend connected.  
[<img src="/wp-content/uploads/2014/02/IMG_0701-300x225.jpg" alt="IMG_0701" width="300" height="225" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/IMG_0701.jpg)

The firmware I’m using is [Marlin](https://github.com/ErikZalm/Marlin). Marlin is a deviation on Sprinter and has LCD support amongst other improvements.

Image of the motors, both Z axises are running.  
From left to right:  
X axis, Y axis, 2x Z axis, Extruder motor.  
[<img src="/wp-content/uploads/2014/02/IMG_0702-300x225.jpg" alt="IMG_0702" width="300" height="225" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/IMG_0702.jpg)

When connecting the LCD I noticed something was off, the display shows garbage and nothing can be read from it.  
[<img src="/wp-content/uploads/2014/02/IMG_0709-300x225.jpg" alt="IMG_0709" width="300" height="225" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/IMG_0709.jpg)  
The [almighty google suggest multiple possible errors](https://github.com/ErikZalm/Marlin/issues/250).  
First thing to troubleshoot is to see if there is any noticable soldering junk creating crosstalk, I checked both the LCD PCB and Mega2560+RAMPS PCB but I could not find any. I then proceeded to checking the Marlin code to see if I had made any configuration errors.  
Unfortunately I had no luck there either.  
As a LCD is not required I decided to move on. When the printer is up and running I will probably deal with the LCD errors.

Then I went ahead and configured the endstops. This proved an issue. I’m using 4 pin Mech Endstop v1.2. I had a hard time figuring out which pin did what and after more google I found out more people had made the mistake to wire them wrong and burn the arduino board.  
My approach was to connect a LED to the endstop and a tiny bit of voltage from the PSU.  
Unfortunately my calculations were off and I managed to burn the fuse on the PSU! 🙁  
Here is an image of the PSU, next to the big brown cable is the burned fuse.  
[<img src="/wp-content/uploads/2014/02/IMG_0707-300x225.jpg" alt="IMG_0707" width="300" height="225" loading="lazy" decoding="async">  
](/wp-content/uploads/2014/02/IMG_0707.jpg)Soldering off the power cords and fuse and from the PSU was easy, however with the PSU built to be compact it was not easy to solder a new 3A fuse.  
Here we can see the PSU out of the case with the old fuse on the side.  
[<img src="/wp-content/uploads/2014/02/IMG_0713-300x225.jpg" alt="IMG_0713" width="300" height="225" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/IMG_0713.jpg)

With the endstop issues solved and PSU works great the main job left is to assemble the printer.  
More updates to come!

Ps. More images  
[<img src="/wp-content/uploads/2014/02/IMG_0710-300x225.jpg" alt="IMG_0710" width="300" height="225" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/IMG_0710.jpg) [<img src="/wp-content/uploads/2014/02/IMG_0703-300x225.jpg" alt="IMG_0703" width="300" height="225" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/IMG_0703.jpg) [<img src="/wp-content/uploads/2014/02/IMG_0700-300x225.jpg" alt="IMG_0700" width="300" height="225" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/IMG_0700.jpg) [<img src="/wp-content/uploads/2014/02/pronterface-300x160.png" alt="pronterface" width="300" height="160" loading="lazy" decoding="async">](/wp-content/uploads/2014/02/pronterface.png)
