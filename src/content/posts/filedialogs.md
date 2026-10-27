---
title: FileDialogs
date: 2013-04-12T17:18:27+02:00
modified: 2014-03-06T16:06:12+01:00
slug: filedialogs
permalink: /2013/04/12/filedialogs/
wpId: 247
description: Function SaveFileDialog{ Param( [Parameter(Mandatory=$True)] $Filetype ) [Void][Reflection.Assembly]::LoadWithPartialName(“System.Windows.Forms”) $SaveFileDialog = New-Object System.Windows.Forms.SaveFileDialog $SaveFileDialog.Filter = “$Filetype files (*.$Filetype)|*.$Filetype|All files (*.*)|*.*” $status = $SaveFileDialog.ShowDialog() If($status -eq “Cancel”){$Return = $status} Else{$Return = $SaveFileDialog.FileName} $SaveFileDialog.Dispose() Return $Return } Function SelectFileDialog{ Param( [Parameter(Mandatory=$True)] $Filetype ) [Void][Reflection.Assembly]::LoadWithPartialName(“System.Windows.Forms”) $OpenFileDialog = New-Object System.Windows.Forms.OpenFileDialog $OpenFileDialog.Filter = “$Filetype files (*.$Filetype)|*.$Filetype|All files (*.*)|*.*” $status = $OpenFileDialog.ShowDialog() If($status
categories: []
tags: []
author: freakling
---

```powershell
Function SaveFileDialog{
    Param(
        [Parameter(Mandatory=$True)]
        $Filetype
    )
    [Void][Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
    $SaveFileDialog = New-Object System.Windows.Forms.SaveFileDialog
    $SaveFileDialog.Filter = "$Filetype files (*.$Filetype)|*.$Filetype|All files (*.*)|*.*"
    $status = $SaveFileDialog.ShowDialog()

    If($status -eq "Cancel"){$Return = $status}
    Else{$Return = $SaveFileDialog.FileName}

    $SaveFileDialog.Dispose()
    Return $Return
}
```

```powershell
Function SelectFileDialog{
    Param(
        [Parameter(Mandatory=$True)]
        $Filetype
    )
    [Void][Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
    $OpenFileDialog = New-Object System.Windows.Forms.OpenFileDialog

    $OpenFileDialog.Filter = "$Filetype files (*.$Filetype)|*.$Filetype|All files (*.*)|*.*"

    $status = $OpenFileDialog.ShowDialog()

    If($status -eq "Cancel"){$Return = $status}
    Else{$Return = $OpenFileDialog.FileName}

    $OpenFileDialog.Dispose()
    Return $Return
}
```

```powershell
Function SelectFolderDialog{
    [Void][Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")

    $SelectFileDialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $status = $SelectFileDialog.ShowDialog()

    If($status -eq "Cancel"){$Return = $status}
    Else{$Return = $SelectFileDialog.FileName}

    $SelectFileDialog.Dispose()
    Return $Return
}
```
