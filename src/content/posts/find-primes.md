---
title: Quick and dirty way to find primes
date: 2013-12-06T15:44:43+01:00
modified: 2013-12-10T10:34:52+01:00
slug: find-primes
permalink: /2013/12/06/find-primes/
wpId: 313
description: 2..5000 | ForEach-Object{ $current = $_ $f = @() 1..$Current | ForEach-Object{ $result = $current/$_ If($result.GetType().Name -eq “Int32”){ $f += $result } } if($f.count -le 2){ $current } }
categories: []
tags: []
author: freakling
---

```powershell
2..5000 | ForEach-Object{
    $current = $_
    $f = @()
    1..$Current | ForEach-Object{
        $result = $current/$_
        If($result.GetType().Name -eq "Int32"){
            $f += $result
        }
    }
    if($f.count -le 2){
        $current
    }
}
```
