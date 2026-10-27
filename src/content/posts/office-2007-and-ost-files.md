---
title: Office 2007 and .ost files.
date: 2012-06-12T16:29:28+02:00
modified: 2013-11-14T17:21:28+01:00
slug: office-2007-and-ost-files
permalink: /2012/06/12/office-2007-and-ost-files/
wpId: 121
description: There is a slight issue with .ost files and roaming profiles in Outlook 2007. The issue appears when the user gets a corrupt profile, gets another generated but still has some registry keys mapped to the old corrupt profile. If the corrupt profile gets removed, or if another local mail account is created on the
categories: []
tags: []
author: freakling
---

There is a slight issue with .ost files and roaming profiles in Outlook 2007.  
The issue appears when the user gets a corrupt profile, gets another generated but still has some registry keys mapped to the old corrupt profile. If the corrupt profile gets removed, or if another local mail account is created on the new profile it will result in an error when the user switches between computers.

Here is the logonscript that solves the issue by changing the keys each time the user logs on.

```powershell
On Error Resume Next

If Not TestOstFilePath = True Then
  Const HKEY_CURRENT_USER = &H80000001
  Set oReg = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\default:StdRegProv")
  Set objFSO = CreateObject("Scripting.FileSystemObject")
  Set oShell = CreateObject("WScript.Shell")

  LocalAppData = oShell.ExpandEnvironmentStrings("%LocalAppData%")
  stringDefaultOstPath = LocalAppdata & "\Microsoft\Outlook\"

  ' searches for the most recent created .ost file.
  Set objFSO = CreateObject("scripting.filesystemobject")
  set oFolder = objFSO.getfolder(stringDefaultOstPath)
  For Each aFile In oFolder.Files
    Extension = objFSO.GetExtensionName(stringDefaultOstPath & aFile)
    If Extension = "ost" Then
      If sNewest = "" Then
        Set fNewest = aFile
        sNewest = aFile.Name
      Else
        If fNewest.DateCreated < aFile.DateCreated Then
          Set fNewest = aFile
        End If
      End If
    End If
  Next

  ' if no .ost file is found, revert to default.
  If fNewest = "" Then
    fNewest = stringDefaultOstPath & "outlook.ost"
  End If

  ' Convert path into binary format with nulls
  stringDefaultOstFilePath = fNewest

  iLength = Len(stringDefaultOstFilePath)
  Dim binaryDefaultOstFilePath()
  Redim binaryDefaultOstFilePath(iLength * 2 + 1)
  For i = 0 To iLength - 1
    binaryDefaultOstFilePath(i * 2)   = Asc(Mid(stringDefaultOstFilePath, i + 1, 1))
    binaryDefaultOstFilePath(i * 2 + 1) = 0
  Next
  binaryDefaultOstFilePath(iLength * 2)   = 0
  binaryDefaultOstFilePath(iLength * 2 + 1) = 0'

  ' Look in outlook profile and set the ost to correct location
  iReturn = oReg.EnumKey(HKEY_CURRENT_USER, "Software\Microsoft\Windows NT\CurrentVersion\Windows Messaging Subsystem\Profiles\", allOutlookProfiles)
  If IsArray(allOutlookProfiles) Then
    For Each stringOutlookProfile In allOutlookProfiles
      iReturn = oReg.SetBinaryValue(HKEY_CURRENT_USER, "Software\Microsoft\Windows NT\CurrentVersion\Windows Messaging Subsystem\Profiles\" & stringOutlookProfile & "\13dbb0c8aa05101a9bb000aa002fc45a", "001f6610", binaryDefaultOstFilePath)
      If iReturn <> 0 Then
        oShell.Logevent 1, "Error! Could not set value 001f6610 to " & binaryDefaultOstFilePath & ". Error: " & iReturn
      End If
      iReturn = oReg.SetStringValue(HKEY_CURRENT_USER, "Software\Microsoft\Windows NT\CurrentVersion\Windows Messaging Subsystem\Profiles\" & stringOutlookProfile & "\13dbb0c8aa05101a9bb000aa002fc45a", "001e660e", stringDefaultOstPath)
      If iReturn <> 0 Then
        oShell.Logevent 1, "Error! Could not set value 001e660e to " & stringDefaultOstPath & ". Error: " & iReturn
      End If
    Next
  End If

  ' Writes an event with the current .ost file to registry.
  RegistrySetting = oShell.RegRead("HKCU\Software\Microsoft\Windows NT\CurrentVersion\Windows Messaging Subsystem\Profiles\Microsoft Outlook\13dbb0c8aa05101a9bb000aa002fc45a\001f6610")
  If Not RegistrySetting = "" Then
    oShell.Logevent 4, "The .ost path has been set to: " & stringDefaultOstFilePath
  Else
    oShell.Logevent 2, "The .ost path can not be found"
  End If
End If

Function TestOstFilePath
  On Error Resume Next
  Const HKEY_CURRENT_USER = &H80000001
  Set objFSO = CreateObject("Scripting.FileSystemObject")
  Set oShell = CreateObject("WScript.Shell")

  strKeyPath = "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Windows Messaging Subsystem\Profiles\Microsoft Outlook\13dbb0c8aa05101a9bb000aa002fc45a\"
  strValueName = "HKCU\Software\Microsoft\Windows NT\CurrentVersion\Windows Messaging Subsystem\Profiles\Microsoft Outlook\13dbb0c8aa05101a9bb000aa002fc45a\001f6610"

  RegExists = True
  RegistrySetting = oShell.RegRead(strValueName)
  If Err.Number <> 0 Then
    oShell.Logevent 2, "Could not read from registry. " & Err.Description
    RegExists = False
    Err.Clear
  End If

  StringRegValue=""  
  for i=0 to ubound(RegistrySetting)
    if RegistrySetting(i)<>0 then StringRegValue=StringRegValue & chr(RegistrySetting(i))
  Next

  If RegExists = True Then
    If objFSO.FileExists(StringRegValue) Then
      TestOstFilePath = True
    Else
      TestOstFilePath = False
    End If
  Else
    TestOstFilePath = True
  End If
End Function
```

I did not come up with everything myself. Some of the code was taken from the site below. But i felt that this did not solve my issue completely since i do not use “ForceOSTPath” value.

Some functionality was taken from:  
[http://www.greycube.com/help/vb/update\_ost\_path\_in\_outlook\_profiles.txt](http://www.greycube.com/help/vb/update_ost_path_in_outlook_profiles.txt)
