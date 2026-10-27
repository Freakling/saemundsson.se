---
title: wget for windows
date: 2012-05-03T14:26:17+02:00
modified: 2012-05-10T11:06:41+02:00
slug: wget-for-windows
permalink: /2012/05/03/wget-for-windows/
wpId: 67
description: ever wanted to use wget in Powershell? This short function allows you to wget to local directory. function wget($urlpath){ $directory = (get-location).path $filename = $urlpath.Split(“/”)[-1] $file = $directory+”\”+$filename $webclient = New-Object System.Net.WebClient $webclient.DownloadFile($urlpath,$file) } Simply enter the function into your current powershell session and try it out. wget http://upload.wikimedia.org/wikipedia/en/f/f4/The_Scream.jpg If you want to permanently have access
categories: []
tags: []
author: freakling
---

ever wanted to use wget in Powershell? This short function allows you to wget to local directory.

```powershell
function wget($urlpath){
  $directory = (get-location).path

  $filename = $urlpath.Split("/")[-1]
  $file = $directory+"\"+$filename

  $webclient = New-Object System.Net.WebClient
  $webclient.DownloadFile($urlpath,$file)
}
```

Simply enter the function into your current powershell session and try it out.  
**wget http://upload.wikimedia.org/wikipedia/en/f/f4/The\_Scream.jpg**

If you want to permanently have access to this command add the function to the following file: “**%windir%\\system32\\WindowsPowerShell\\v1.0\\profile.ps1**”

For more information on Powershell profiles, read this article:  
[http://msdn.microsoft.com/en-us/library/windows/desktop/bb613488(v=vs.85).aspx](http://msdn.microsoft.com/en-us/library/windows/desktop/bb613488(v=vs.85%29.aspx)
