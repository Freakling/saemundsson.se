---
title: Just enough Administration & RDS
date: 2017-12-11T10:50:23+01:00
modified: 2018-01-04T21:42:38+01:00
slug: just-enough-administration-rds
permalink: /2017/12/11/just-enough-administration-rds/
wpId: 736
description: "Reblogged from my company blog: https://tech.xenit.se/just-enough-administration-rds/ — The Problem? Microsoft RDS has limitations when delegating access, in fact there is no built-in access delegation whatsoever! The solution? Powershell! A Just enough Administration (JEA) endpoint, also known as a Constrained Powershell Endpoint. The endpoint is restricted to only access List collection, list users and subsequently force"
categories: []
tags: []
author: freakling
---

Reblogged from my company blog: [https://tech.xenit.se/just-enough-administration-rds/](https://tech.xenit.se/just-enough-administration-rds/)  
—

### The Problem?

Microsoft RDS has limitations when delegating access, in fact there is no built-in access delegation whatsoever!

### The solution? Powershell!

A Just enough Administration (JEA) endpoint, also known as a Constrained Powershell Endpoint.  
The endpoint is restricted to only access List collection, list users and subsequently force logoff users. The endpoint configuration to only accept users from a certain AD group.

To configure endpoint, run the following code on all connection brokers. The script is somewhat generalized for easy adaptability. The main parts are in the parameters where we configure who can run, using which account and also what cmdlet are available in the constrained session.

```powershell
<#
.Synopsis
    Short description
.DESCRIPTION

.NOTES
    Name: Create-JEA-RDS-Endpoint.ps1
    Author: Vikingur Saemundsson
    Date Created: 2017-11-20
    Version History:
        2017-11-20 - Vikingur Saemundsson
            Initial Creation

    Xenit AB
#>

[cmdletbinding()]
Param(
    [String]$Name = 'Xenit.JEA.RDS.Servicedesk',
    [String]$Path = 'C:\Xenit\RDS\LogoffEndpoint',
    [Array]$VisibleCmdlets = $("Get-RDSessionCollection","Get-RDSessionHost","Get-RDUserSession","Invoke-RDUserLogoff","Where-object"),
    [String]$AdGroup = 'Servicedesk Ad group',
    [Parameter(Mandatory=$true)]
    [String]$ServiceAccount,
    [Array]$Modules = 'RemoteDesktop',
    [String]$Author = 'Vikingur Saemundsson',
    [String]$Company = 'Xenit AB'
)
Try{
    $ADGroupSID = (Get-ADGroup $AdGroup).SID

    If(-not(Test-Path -Path $Path -PathType Container)){
        New-Item -Path $Path -ItemType Directory -Force
    }

    $LockdownScript = @'
    Get-Command | Where Visibility -eq 'Public' | ForEach-Object {
        if ( $_.Name -notin $CmdsToExclude ) {
            $_.Visibility = 'Private'
        }
    }
'@
    '$CmdsToExclude = @("Get-Command", "Out-Default", "Exit-PSSession", "Measure-Object", "Select-Object" , "Get-FormatData"{0})' -f (($VisibleCmdlets | ForEach-Object{",`"$_`""}) -join '') | Out-File "$Path\LockdownScript.ps1"
    $LockdownScript | Out-File "$Path\LockdownScript.ps1" -Append

    $Modules += 'Microsoft.PowerShell.Core'
    $Modules += 'Microsoft.PowerShell.Management'
    $Modules += 'Microsoft.PowerShell.Security'
    $Modules += 'Microsoft.PowerShell.Utility'
    $Modules += 'Microsoft.PowerShell.Diagnostics'
    $Modules += 'Microsoft.PowerShell.Host'

    $ConfigFileParams = @{
        Path ="$Path\$Name.pssc"
        ModulesToImport = $Modules
        ScriptsToProcess = "$Path\LockdownScript.ps1"
        CompanyName = $Company
        Author = $Author
        Copyright = "(c) $((Get-Date).Year) $Company. All rights reserved."
        SessionType = 'Default'
        LanguageMode = "ConstrainedLanguage"
        ExecutionPolicy = 'Bypass'
    }

    $SessionConfigParams = @{
        RunAsCredential = $ServiceAccount
        Name = $Name
        Path = $ConfigFileParams.Path
        UseSharedProcess = $true
        SecurityDescriptorSddl = "O:BAG:DUD:AI(A;;GX;;;$ADGroupSID)"
        Confirm = $false
    }

    If(Get-PSSessionConfiguration -Name $SessionConfigParams.Name -ErrorAction SilentlyContinue){
        Unregister-PSSessionConfiguration -Name $SessionConfigParams.Name -Confirm:$false
    }

    New-PSSessionConfigurationFile @ConfigFileParams

    Register-PSSessionConfiguration @SessionConfigParams
}
Catch{
    Write-Error $_
}
```

The frontend application code is not posted in the blog.
