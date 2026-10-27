---
title: Retreive passwords through GPO/GPP with powershell.
date: 2015-02-03T13:12:59+01:00
modified: 2015-02-03T13:12:59+01:00
slug: retreive-passwords-through-gpogpp-with-powershell
permalink: /2015/02/03/retreive-passwords-through-gpogpp-with-powershell/
wpId: 537
description: There is a known vulnerability in windows where all passwords stored in Group policy preferences are encrypted with a public AES key (link to msdn). In this post we will go through how to get all the usernames and passwords from group policies in the minimum amount of time with maximum amount of data so we
categories: []
tags: []
author: freakling
---

There is a known vulnerability in windows where all passwords stored in Group policy preferences are encrypted with a [public AES key (link to msdn)](http://msdn.microsoft.com/en-us/library/cc422924.aspx).

In this post we will go through how to get all the usernames and passwords from group policies in the minimum amount of time with maximum amount of data so we can infiltrate the domain.

What we will need is a fast USB stick loaded with a set of scripts. (attached at the bottom of the post)

First we want to retreive all XML files that may contain passwords. We do this by a query to the SYSVOL. This is the bulk of the time and it is recommended to perform this first if you’re using this on someone else’s computer (perhaps forgot to lock or in a public area).  
For this run “Get-GPPXML.ps1”

If there is still time, we can go ahead and encrypt by running “Decrypt-passwords.ps1”, this will save it as a csv file to be opened in excel with the following headers for easy reading.  
Domain Usernames Passwords NewNames(might be reset) File ChangedTimestamp

Get-GPPPasswords.zip (file no longer available)
