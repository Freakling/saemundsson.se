---
title: Powershell auto updater
date: 2012-05-03T13:39:01+02:00
modified: 2013-05-20T14:45:42+02:00
slug: powershell-auto-updater
permalink: /2012/05/03/powershell-auto-updater/
wpId: 34
description: "I wrote this short script to keep local scripts up to date with server versions. Makes it easier to handle scripts that are added with initial version through task sequence or other onetime distributions. The requirement is for the scripts to have the variable $CurrentVersion = <int/double> Example script, located on the central/repository: $CurrentVersion ="
categories: []
tags: []
author: freakling
---

I wrote this short script to keep local scripts up to date with server versions.

Makes it easier to handle scripts that are added with initial version through task sequence or other onetime distributions. The requirement is for the scripts to have the variable $CurrentVersion = <int/double>

Example script, located on the central/repository:

```powershell
$CurrentVersion = 1.1
[Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms")
$form = New-Object 'System.Windows.Forms.Form'
$form.showdialog()
```

If the local/current script contains $CurrentVersion = 1.0 or less it will get updated once the launcher has been run.  
Launcher code below:

```powershell
# Following variables control the paths used in script

# Retrieve the directory of script.
$Script:G_runDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Name of the script to update.
$Script:G_Script  = "ScriptPath.ps1"

# Where repository version is located.
$Script:G_RepositoryPath = "\\$env:userdnsdomain\Path\To\Script"

# Build paths for scripts. Do not change!
$Script:G_LocalScript = "$G_runDir\$G_Script"
$Script:G_CentralScript = "$G_RepositoryPath\$G_Script"
===========================================================================

Function MainFunction(){

    if(Test-Path $G_CentralScript){

        $LocalInfo = Get-Info -ScriptPath $G_LocalScript
        $CentralInfo = Get-Info -ScriptPath $G_CentralScript

        $LocalVersion = $LocalInfo.Version
        $LocalChecksum = $LocalInfo.Checksum

        $CentralVersion = $CentralInfo.Version
        $CentralChecksum = $CentralInfo.Checksum

        Write-Host "Local Version: $LocalVersion. Central Version: $CentralVersion"

        If($LocalChecksum -ne $CentralChecksum){
            If($LocalVersion -ge $CentralVersion){
                Write-Host "Local script corrupt"
            }
            try{
                Write-Host "Updating script"
                Copy-Item "$G_CentralScript" -Destination "$G_runDir" -Force
                Write-host "Script pdated"
            }
            catch{
                Write-Error $_
            }
        }Elseif($LocalChecksum -eq $CentralChecksum){
            Write-Host "Script up to date"
        }
    }
    Else{
        Write-host "Local Version: $LocalVersion. Could not find $G_CentralScript."
    }

    Launch-Application
} # End Function

#----------------------------------------------------------------
# Gets version of scripts.
#----------------------------------------------------------------
Function Get-Info{
    Param(
        [Parameter(Mandatory=$true)]$ScriptPath
    )

    $Return = @{"Checksum" = "Null";"Version" = 0}
    $MD5 = New-Object 'System.Security.Cryptography.MD5CryptoServiceProvider'

    If(Test-Path $ScriptPath){

        Try{
            $Checksum = [System.BitConverter]::ToString($MD5.ComputeHash([System.IO.File]::ReadAllBytes($ScriptPath)))
            $Return.Checksum = $Checksum
        }
        Catch{
            Write-Error $_
        }

        $Script = (get-content $ScriptPath) | Where-Object{$_ -like "*APP_VER*"}
        if(!$Script){
            Return Write-Host "$ScriptPath does not contain any valid version information!"
        }
        else{
            Try{
                # Uses invoke-expression to set version variable.
                $ScriptBlock = $Script | Where-Object{$_.StartsWith("Set-Variable")}
                If($ScriptBlock.GetType().Name -eq "String"){
                    Invoke-Expression $ScriptBlock
                    If(($APP_VER.GetType() -eq [Double]) -or ($APP_VER.GetType() -eq [Int])){
                        $Return.Version = $APP_VER
                    }
                }
            }Catch{
                Write-Error $_
            }
        }
    }
    Return $Return
}

#----------------------------------------------------------------
# Prompts for input and launches script.
#----------------------------------------------------------------

Function Launch-Application{
    Try{
        .{Powershell.exe -File "$Script:G_LocalScript"}
    }
    Catch{
        Write-Error $_
    }
} # End function

#=== Call Main function =========================================================
#================================================================================

MainFunction
```

Just copy-paste this and change the paths and you should be good. If you’re running a console application you might want to change the “-Windowstyle” in Start-Script function to “normal”  
Currently it waits until any key has been pressed but if you want it to launch instantly just comment out the line

```
[void]$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```
