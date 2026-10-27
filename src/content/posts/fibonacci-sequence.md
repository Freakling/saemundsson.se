---
title: Fibonacci sequence
date: 2013-12-06T13:50:08+01:00
modified: 2013-12-06T13:50:08+01:00
slug: fibonacci-sequence
permalink: /2013/12/06/fibonacci-sequence/
wpId: 311
description: $1 = 0 $2 = 1 1..100 | ForEach-Object{ if($_%2 -eq 1){ $1 = $1+$2 $1 } Else{ $2 = $1+$2 $2 } }
categories: []
tags: []
author: freakling
---

```powershell
$1 = 0
$2 = 1
1..100 | ForEach-Object{
    if($_%2 -eq 1){
        $1 = $1+$2
        $1
    }
    Else{
        $2 = $1+$2
        $2
    }
}
```
