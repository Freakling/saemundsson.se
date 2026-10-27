---
title: Microsoft hotfix indexer and browser
date: 2014-04-16T16:32:09+02:00
modified: 2014-04-16T16:55:00+02:00
slug: microsoft-hotfix-indexer-and-browser
permalink: /2014/04/16/microsoft-hotfix-indexer-and-browser/
wpId: 487
description: A while back I made a quick hotfix indexer script and database browser. These were not too great but had sufficient functionality for the time. Now that I have expanded on functionality I want to write this as a single post. Any Microsoft enterprise technician could see the value in having a list like this.
categories: []
tags: []
author: freakling
---

A while back I made a quick [hotfix indexer script](/2014/03/27/index-all-microsoft-hotfixes/) and [database browser](/2014/03/31/hotfix-browser/).

These were not too great but had sufficient functionality for the time. Now that I have expanded on functionality I want to write this as a single post.

Any Microsoft enterprise technician could see the value in having a list like this.  
The question is why Microsoft don’t provide this list themselves.  
Anyhow, let’s begin!

This package (file no longer available) contains three files. One indexer.ps1. One HotfixBrowser.ps1 and a config file where you specify SQL connectionstring and table to be used before running the scripts.

The heart of the script is the indexer. It goes through a range specified and lists them in a database. The table must have the following columns:

[<img src="/wp-content/uploads/2014/04/Capture2-300x176.png" alt="Capture2" width="300" height="176" loading="lazy" decoding="async">](/wp-content/uploads/2014/04/Capture2.png)

Other columns can be added if needed and will be listed in the hotfix browser.  
What I do is add a scheduled task that runs this script with a set of ranges every weekend to get a up-to date view.

When the indexer has completed you can start HotfixBrowser.ps1[<img src="/wp-content/uploads/2014/04/browser-300x180.png" alt="browser" width="300" height="180" loading="lazy" decoding="async">](/wp-content/uploads/2014/04/browser.png)

From here you can search with standard SQL syntax. All fields to a LIKE search so for example All windows 8 hotfixes released during 2014 has this search criteria.  
[<img src="/wp-content/uploads/2014/04/2-300x42.png" alt="2" width="300" height="42" loading="lazy" decoding="async">](/wp-content/uploads/2014/04/2.png)

Clicking search allows you to quickly see the short text of all articles involving Windows 8 with a hotfix download available allowing you to work efficiently and determine if any of the hotfixes are applicable to your client environment.  
[<img src="/wp-content/uploads/2014/04/3-300x212.png" alt="3" width="300" height="212" loading="lazy" decoding="async">](/wp-content/uploads/2014/04/3.png)

There are also the option to go ‘advanced’ which allows you to edit the Select query as you see fit.  
[<img src="/wp-content/uploads/2014/04/4-300x59.png" alt="4" width="300" height="59" loading="lazy" decoding="async">](/wp-content/uploads/2014/04/4.png)

In the File menu you can export the current datatable as a CSV file.  
In the tools mode you can save and load searches as well as choose visible columns and enable edit mode.  
Edit mode makes the cells writable and allows you to send a UPDATE query to the server (given the appropriate rights) to edit some fields such as note and other custom fields.
