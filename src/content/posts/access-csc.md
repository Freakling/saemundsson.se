---
title: Access CSC
date: 2013-11-14T16:58:14+01:00
modified: 2017-11-30T08:31:08+01:00
slug: access-csc
permalink: /2013/11/14/access-csc/
wpId: 294
description: "this is used to quickly gain access to a users client side cache without ruining sync. Used for backup issues and other stuff. $comp = ‘computer1’ # Replace with computer $FQDN = ‘your.domain.com’ # Replace with FQDN $UserID = ‘user1’ # Replace with the useraccount to gain access Function ConvertTo‐Base64($string) { $bytes = [System.Text.Encoding]::Unicode.GetBytes($string); $encoded"
categories: []
tags: []
author: freakling
---

this is used to quickly gain access to a users client side cache without ruining sync.  
Used for backup issues and other stuff.

```powershell
$comp = 'computer1' # Replace with computer
$FQDN = 'your.domain.com' # Replace with FQDN
$UserID = 'user1' # Replace with the useraccount to gain access

Function ConvertTo‐Base64($string) {
  $bytes  = [System.Text.Encoding]::Unicode.GetBytes($string);
  $encoded = [System.Convert]::ToBase64String($bytes);
  Return $encoded;
}

$cmd = @'
if (schtasks.exe /Query | select-string "RUNCMD1") {
    schtasks.exe /delete /tn "RUNCMD1" /F
}

mkdir c:\temp\ -ea 0

"running"|out-file c:\temp\csctemp
schtasks.exe /ru "SYSTEM" /Create /TN "RUNCMD1" /TR "cmd /C icacls c:\windows\csc\ /c /grant {FQDN}\{UserID}`:`(OI`)`(CI`)F /T > c:\temp\cmd1.log && del c:\temp\csctemp" /sc "once" /ST "23:00"
schtasks.exe /run /tn "RUNCMD1"
'@.Replace('{FQDN}',$FQDN).Replace('{UserID}',$UserID)

$EncodedCmd = ConvertTo‐Base64($cmd)
$EncodedArgs = 'c:\windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy ByPass -EncodedCommand "' + $EncodedCmd + '"'
$result = Invoke-WmiMethod -ComputerName $comp -class win32_process -name create -ea 0 -ArgumentList $EncodedArgs
```
