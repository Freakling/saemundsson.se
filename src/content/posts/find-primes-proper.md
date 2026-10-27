---
title: Find primes, the proper way
date: 2013-12-10T10:41:41+01:00
modified: 2014-01-07T09:32:17+01:00
slug: find-primes-proper
permalink: /2013/12/10/find-primes-proper/
wpId: 316
description: I noticed that the earlier way to find primes is really fast for small numbers, but it is really really slow for number >5000 To shorten this, and provide a proper track of what primes are found as well as looping endlessly I’ve created this thing below. Place it as prime.ps1 in a folder with
categories: []
tags: []
author: freakling
---

I noticed that the earlier way to find primes is really fast for small numbers, but it is really really slow for number >5000

To shorten this, and provide a proper track of what primes are found as well as looping endlessly I’ve created this thing below.

Place it as prime.ps1 in a folder with read/write access.

The code below writes lines in a file called primes.log and keeps a progress of the last processed number (stored in progress.log).  
This allows the script to resume the last location where it was terminated.  
It also uses a better algorithm to determine if the given number is a prime or not, resulting in a steady 30 seconds to calculate 0-5000

Now the algorithm is not perfect (could check common divisible numbers first and some pattern matching) but it produces a steady stream of numbers in a fairly quick fashion.

```powershell
[CmdletBinding()]
Param()
Process{

    If(!([int]$currentNumber = Get-Content $progressfile -ErrorAction Ignore)){[int]$currentNumber = $lastPrime+1}
    Write-Verbose "Starting at $currentNumber"

    "$(Get-Date -UFormat "%Y-%m-%d %r")| Starting at $currentNumber" | Out-File $logfile -Append

    While($Loop){

        Write-Verbose "Processing $currentNumber"
        $prime = Test-Prime $currentNumber

        If($prime){
            $currentNumber | Out-File $file -Append
            "$(Get-Date -UFormat "%Y-%m-%d %r")| Found prime, $currentNumber" | Out-File $logfile -Append
            Write-host "Success, prime found! $currentNumber" -ForegroundColor Green
        }

        $currentNumber++
        $currentNumber | Out-File $progressfile
    }
}
Begin{

    $MyPath = Split-Path $MyInvocation.MyCommand.path -Parent

    $Loop = $true
    $logfile = "$MyPath\log.log"
    $file = "$MyPath\primes.log"
    $progressfile = "$MyPath\progress.log"
    Try{
        $primes = Get-Content $file -ErrorAction Ignore
        [int]$lastPrime = $primes[-1]
        Write-Verbose "File found, last prime is $lastprime"
    }
    Catch{
        Write-Verbose "File not found. Creating file and starting from 3"
        $lastPrime = 3
        New-Item -Path $file -ItemType file -Force
        "2","3" | ForEach-Object{$_ | Out-File $file -Append}
    }

    Function Test-Prime{
        Param($number)
        If($number -match "0$|2$|4$|5$|6$|8$"){
            return $false
        }
        [int]$DivNumber = $number/2
        #$numbers = 2..$DivNumber
        $i = 2
        While($i -le $DivNumber){
            If($number%$i -eq 0){
                return $false
            }
            $i++
        }
        return $true
    }
}
```
