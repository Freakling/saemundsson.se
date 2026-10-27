---
title: Generate-Key
date: 2016-01-25T16:42:37+01:00
modified: 2017-11-30T08:27:25+01:00
slug: generate-key
permalink: /2016/01/25/generate-key/
wpId: 647
description: To compliment my earlier post I have created a short function to generate keys. Function Generate-key{ Param( [validateset(128,192,256)] $bits, [switch]$COUT, $seed ) $bytes = $bits/8 $array = @() If($seed){ 1..$bytes | ForEach-Object{ $array += Get-Random -Minimum 0 -Maximum 255 -SetSeed $seed } } Else{ 1..$bytes | ForEach-Object{ $array += Get-Random -Minimum 0 -Maximum 255 }
categories: []
tags: []
author: freakling
---

To compliment my earlier post I have created a short function to generate keys.

```powershell
Function Generate-key{
Param(
    [validateset(128,192,256)]
    $bits,
    [switch]$COUT,
    $seed
)
    $bytes = $bits/8
    $array = @()
    If($seed){
        1..$bytes | ForEach-Object{
            $array += Get-Random -Minimum 0 -Maximum 255 -SetSeed $seed
        }
    }
    Else{
        1..$bytes | ForEach-Object{
            $array += Get-Random -Minimum 0 -Maximum 255
        }
    }
    If($COUT){
        [string]$retval = ($array -join ',')
        Return $retval
    }
    Else{
        Return [Byte[]]$Key = $array
    }
}
```
