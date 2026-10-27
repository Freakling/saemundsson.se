---
title: Counting in roman
date: 2014-11-20T15:23:54+01:00
modified: 2017-11-30T08:27:39+01:00
slug: counting-in-roman
permalink: /2014/11/20/counting-in-roman/
wpId: 546
description: 1 to 100 looks like this I, II, III, IV, V, VI, VII, VIII, VIV, X, XI, XII, XIII, XIV, XV, XVI, XVII, XVIII, XVIV, XX, XXI, XXII, XXIII, XXIV, XXV, XXVI, XXVII, XXVIII, XXVIV, XXX, XXXI, XXXII, XXXIII, XXXIV, XXXV, XXXVI, XXXVII, XXXVIII, XXXVIV, XC, XCI, XCII, XCIII, XCIV, XCV, XCVI, XCVII, XCVIII, XCVIV,
categories: []
tags: []
author: freakling
---

1 to 100 looks like this

```
I, II, III, IV, V, VI, VII, VIII, VIV, X, XI, XII, XIII, XIV, XV, XVI, XVII, XVIII, XVIV, XX, XXI, XXII, XXIII, XXIV, XXV, XXVI, XXVII, XXVIII, XXVIV, XXX, XXXI, XXXII, XXXIII, XXXIV, XXXV, XXXVI, XXXVII, XXXVIII, XXXVIV, XC, XCI, XCII, XCIII, XCIV, XCV, XCVI, XCVII, XCVIII, XCVIV, L, LI, LII, LIII, LIV, LV, LVI, LVII, LVIII, LVIV, LX, LXI, LXII, LXIII, LXIV, LXV, LXVI, LXVII, LXVIII, LXVIV, LXX, LXXI, LXXII, LXXIII, LXXIV, LXXV, LXXVI, LXXVII, LXXVIII, LXXVIV, XC, XCI, XCII, XCIII, XCIV, XCV, XCVI, XCVII, XCVIII, XCVIV, LXC, LXCI, LXCII, LXCIII, LXCIV, LXCV, LXCVI, LXCVII, LXCVIII, LXCVIV, C
```

```powershell
Function To-Roman{
Param([Parameter(Mandatory=$true)][int]$int)
    [int]$M = 1000
    [int]$D = 500
    [int]$C = 100
    [int]$L = 50
    [int]$X = 10
    [int]$V = 5
    [int]$I = 1
    If($int -eq 0){Throw "Zero does not exist in roman culture.";Return 404}
    $done = $false
    While($done -eq $false){

        #$Roman = $roman+(addup $int $m "M")
        If($int -ge $m){
            $n = Loopy $int $m
            $int = $n[0]
            1..$n[1] | %{$Roman = $Roman+"M"}

        }

        If($int -ge $D){
            $n = Loopy $int $D
            $int = $n[0]
            1..$n[1] | %{$Roman = $Roman+"D"}
        }

        If($int -ge $C){
            $n = Loopy $int $C
            $int = $n[0]
            1..$n[1] | %{$Roman = $Roman+"C"}

        }

        If($int -ge $L){
            $n = Loopy $int $L
            $int = $n[0]
            1..$n[1] | %{$Roman = $Roman+"L"}
        }

        If($int -ge $X){
            $n = Loopy $int $X
            $int = $n[0]
            1..$n[1] | %{$Roman = $Roman+"X"}

        }

        If($int -ge $V){
            $n = Loopy $int $V
            $int = $n[0]
            1..$n[1] | %{$Roman = $Roman+"V"}
        }

        If($int -ge $I){
            $n = Loopy $int $I
            $int = $n[0]
            1..$n[1] | %{$Roman = $Roman+"I"}

        }
        If($roman.Contains("CCCC")){$roman=$Roman.Replace("CCCC","CD")}
        If($roman.Contains("XXXX")){$roman=$Roman.Replace("XXXX","XC")}
        If($roman.Contains("LLLL")){$roman=$Roman.Replace("LLLL","XL")}
        If($roman.Contains("LXXX")){$roman=$Roman.Replace("LXXX","XC")}
        If($roman.Contains("VIV")){$roman=$Roman.Replace("VIV","IX")}
        If($roman.Contains("IIII")){$roman=$Roman.Replace("IIII","IV")}

        If($int -eq 0){$done = $true}
    }
    Return $Roman
}

Function Loopy{
Param(
    [int]$int,
    [int]$number
)
    $notDone = $true
    $loops = 0
    While($notDone){
        If($int-$number -ge 0){$int=$int-$number;$loops++}
        ElseIf($int-$number -lt $number){$notDone = $false}
    }
    return $int,$loops
}

1..1000 | %{"$(To-Roman $_) $_"}
```
