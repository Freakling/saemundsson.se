---
title: Add users as local admin on select computers
date: 2013-11-14T16:40:35+01:00
modified: 2017-11-30T08:29:43+01:00
slug: add-users-as-local-admin-on-select-computers
permalink: /2013/11/14/add-users-as-local-admin-on-select-computers/
wpId: 288
description: This is used to add users as local admin on a select group of clients. Needs a input file specified or default to input.txt in same folder. It converts Administrator SID to friendlyname to account for things such as foreign characters. It uses WMI to invoke a client side script to be run under admin
categories: []
tags: []
author: freakling
---

This is used to add users as local admin on a select group of clients.  
Needs a input file specified or default to input.txt in same folder.  
It converts Administrator SID to friendlyname to account for things such as foreign characters.

It uses WMI to invoke a client side script to be run under admin credentials in order to bypass PSremoting policies.

Content in input should be formatted as below.

```
Computername,Username
computer1,User1
computer2,User1
computer2,User2
```

```
This is used to add users as local admin on a select group of clients.
Needs a input file specified or default to input.txt in same folder.
It converts Administrator SID to friendlyname to account for things such as foreign characters.

It uses WMI to invoke a client side script to be run under admin credentials in order to bypass PSremoting policies.

Content in input should be formatted as below.
```

```
Computername,Username
computer1,User1
computer2,User1
computer2,User2
```

Script below:

```powershell
[Cmdletbinding()]
Param(
    [String]$InputFile=".\input.txt"
)
$MyPath = Split-Path $MyInvocation.MyCommand.path -Parent
$Logpath = "$MyPath\Status.log"
$Ping = new-object Net.NetworkInformation.Ping
If(!(Test-path -Path $InputFile -PathType Leaf)){Throw{"Could not find $InputFile"}}
$Data = Import-Csv $InputFile -Delimiter ','

$Logpath = "$MyPath\Status.log"
If(!(Test-Path -Path $Logpath -PathType Leaf)){
    New-Item -Path $Logpath -ItemType file
    "Computername,Username,Status" | Out-File $Logpath
}
$LogData = Import-Csv $Logpath -Delimiter ','

Function ConvertTo-Base64($String){
    $Bytes = [System.Text.Encoding]::Unicode.GetBytes($String)
    $Encoded = [System.Convert]::ToBase64String($Bytes)
    Return $Encoded
}
$cmdtemplate = @'
$SID = "S-1-5-32-544" # built-in administrator group sid
# Find Administrator group based on SID and gets the friendlyname of account
$admins = New-object System.Security.Principal.SecurityIdentifier($SID)
[string]$adminNTaccount = $admins.Translate([System.Security.Principal.NTAccount]).Value.Split('\')[1]

# Gets a list of members and collects friendlyname of each member
$computer = [ADSI]('WinNT://.,computer')
$Group = $computer.psbase.children.find($adminNTaccount)
$Group.Add("WinNT://{replacewithuser},user") # Must change/replace user string here with real user account
'@

$data | Foreach-object{
    $Computer = $_.Computername
    $User = $_.Username
    $Cmd = $cmdtemplate -replace '{replacewithuser}',$User
    $EncodedCmd = ConvertTo-Base64($Cmd)
    $EncodedArgs = 'c:\windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy ByPass -EncodedCommand "' + $EncodedCmd + '"'
    Remove-Variable added -Force -ErrorAction Ignore
    $added = $LogData | Where-Object {($_.Computername -match $computer) -and ($_.Username -match $user) -and ($_.Status -match "Success")}
    $Status = ($Ping.Send($Computer)).Status
    If($added){
        Write-host "Already added $User to $Computer" -ForegroundColor Blue
    }
    ElseIf($Status -eq "Success"){
        $Result = Invoke-WmiMethod -ComputerName $Computer -class win32_process -name create -ErrorAction Ignore -ArgumentList $EncodedArgs
        Write-Verbose $Result
        If($Result.ReturnValue -eq 0){
            Write-host "Added $User to $Computer" -ForegroundColor Green
            $Returnvalue = "Success"
        }
        Else{
            Write-Host "Failed to add $User to $Computer" -ForegroundColor Red
            $Returnvalue = "Error $($result.ReturnValue)"
        }

    }
    Else{
        Write-Host "Could not contact $Computer" -ForegroundColor Red
        $Returnvalue = "Host Unreachable"
    }

    "$computer,$User,$Returnvalue" | Out-File -Append $Logpath

}
Write-host "Done!" -BackgroundColor Green -ForegroundColor Black
Write-host "Bash the keyboard to quit application!" -BackgroundColor Green -ForegroundColor Black
[void]$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```
