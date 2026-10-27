---
title: Index all microsoft hotfixes
date: 2014-03-27T17:12:07+01:00
modified: 2017-11-30T08:31:55+01:00
slug: index-all-microsoft-hotfixes
permalink: /2014/03/27/index-all-microsoft-hotfixes/
wpId: 455
description: Microsoft has a crappy hotfix index mechanism. I want to change this, and I’ve done this by indexing all support.microsoft articles myself. To do this you need a SQL server with the following table configuration Then you run the indexer script. It goes through all hotfixes inefficiently but gets the job done. All support.microsoft.com/kb pages
categories: []
tags: []
author: freakling
---

Microsoft has a crappy hotfix index mechanism. I want to change this, and I’ve done this by indexing all support.microsoft articles myself.

To do this you need a SQL server with the following table configuration  
[<img src="/wp-content/uploads/2014/03/Capture1-300x183.png" alt="Capture" width="300" height="183" loading="lazy" decoding="async">](/wp-content/uploads/2014/03/Capture1.png)

Then you run the indexer script. It goes through all hotfixes inefficiently but gets the job done.  
All support.microsoft.com/kb pages are indexed. From 1 to 4000000

Result in MSSQL looks something like this:

[<img src="/wp-content/uploads/2014/03/Capture2-300x97.png" alt="Capture" width="300" height="97" loading="lazy" decoding="async">](/wp-content/uploads/2014/03/Capture2.png)

Due to web formatting the script can’t be displayed here. Instead I’ve linked it below as a .txt file  
[Script](/wp-content/uploads/2014/03/Search-Hotfixes.ps1_1.txt)

Of course, there is a hotfix browser that is used to search and view these but it’s not done yet.
