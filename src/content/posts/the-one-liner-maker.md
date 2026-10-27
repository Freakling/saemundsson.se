---
title: The one-liner maker!
date: 2012-12-20T17:48:26+01:00
modified: 2013-05-20T13:03:52+02:00
slug: the-one-liner-maker
permalink: /2012/12/20/the-one-liner-maker/
wpId: 198
description: I give you all, probably the most unused function on the planet. The “Make one-liner”! It’s probably not even close to “Complete” but it is easy to add exceptions on where to format. Function Main{ $ScriptString = Get-Content [enter powershell script path here] Make-Oneliner $ScriptString } Function Make-Oneliner{ Param([Array]$array) [string]$OneLiner = @() Foreach($Line1 in $array){
categories: []
tags: []
author: freakling
---

I give you all, probably the most unused function on the planet. **The “Make one-liner”!**

It’s probably not even close to “Complete” but it is easy to add exceptions on where to format.

```powershell
Function Main{
    $ScriptString = Get-Content [enter powershell script path here]
    Make-Oneliner $ScriptString
}

Function Make-Oneliner{
    Param([Array]$array)
    [string]$OneLiner = @()
    Foreach($Line1 in $array){

    $Line1 = $Line1.Split("#")[0]
    $Line1 = $Line1.Trim()
    Foreach($Line in $Line1){
        #Parse and add ;
            If(
                ($line.EndsWith("`{")) -or
                ($line.EndsWith("`;")) -or
                ($line.EndsWith("`(")) -or
                ($line.EndsWith("`|")) -or
                ($line.EndsWith("`]"))
            ){
                    $OneLiner += $Line
            }
            Elseif($line.EndsWith("`'")){
                if(($Line.Split("`'").Count % 1) -eq 0){
                    $Line = $Line + "`;"
                    $OneLiner += $Line
                    }
            }
            Elseif($line.EndsWith("`"")){
                if(($Line.Split("`"").Count % 1) -eq 0){
                    $Line = $Line + "`;"
                    $OneLiner += $Line
                    }
            }
            Elseif($Line.StartsWith("#")){
                # do nothing
            }
            Else{
                $Line = $Line + "`;"
                $OneLiner += $Line
            }
        }
    }
    # Cleanup inappropriate ";".
    $OneLiner = $OneLiner.Replace(';)',')').Replace(',;',',').Replace(';;',';').Replace(';;',';')

    # Cleanup inappropriate ";" on words using insensitive replace methods.
    $OneLiner = $OneLiner -ireplace '};else','}else'
    $OneLiner = $OneLiner -ireplace '};catch','}catch'
    $OneLiner = $OneLiner -ireplace '};finally','}finally'

    Return $OneLiner
}
Main
```
