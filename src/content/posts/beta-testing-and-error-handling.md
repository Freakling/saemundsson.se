---
title: Beta testing and error handling
date: 2012-08-21T13:10:33+02:00
modified: 2012-08-21T13:17:51+02:00
slug: beta-testing-and-error-handling
permalink: /2012/08/21/beta-testing-and-error-handling/
wpId: 147
description: "Here is a simple snippet that you can run to output all exceptions in a script. $ErrorActionPreference = “SilentlyContinue” IWillProduceAnError #—————————————————————- # Debug function, dumps all errors in $Error variable to file #—————————————————————- Function Dump-Errors(){ Param( [Parameter(Position=0, Mandatory = $True)] [String]$Logfile ) $Error | Add-Content $Logfile $Error.Clear() } Dump-Errors -logfile “c:\\temp\\script.log” If you look at"
categories: []
tags: []
author: freakling
---

Here is a simple snippet that you can run to output all exceptions in a script.

```powershell
$ErrorActionPreference = "SilentlyContinue"

IWillProduceAnError

#----------------------------------------------------------------
# Debug function, dumps all errors in $Error variable to file
#----------------------------------------------------------------

Function Dump-Errors(){
    Param(
        [Parameter(Position=0, Mandatory = $True)]
        [String]$Logfile
    )
    $Error | Add-Content $Logfile
    $Error.Clear()
}

Dump-Errors -logfile "c:\temp\script.log"
```

If you look at the code, the cmdlet “IWillProduceAnError” is most likely not recognized and will produce an exception.  
However, you have the $ErrorActionPreference set to SilentlyContinue so nothing will show for the user.

This is where the dump-errors function will help you catch errors you would otherwise never see.

Place the function in your code and make sure the last line to run is the function.  
It will output all exceptions in the $Error variable to a file. You can then later collect the file from the users you know are beta testing and use the Try/Catch statements to correct your code. Combine this with the [Powershell auto updater](/2012/05/03/powershell-auto-updater/ "Powershell Auto Updater") in silent mode and the user will never know you updated the code.
